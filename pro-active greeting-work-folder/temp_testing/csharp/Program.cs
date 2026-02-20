// -------------------------------------------------------------------------
// Voice Live Proactive Messages Test - C#
// Based on the how-to article: how-to-voice-live-proactive-messages.md
// -------------------------------------------------------------------------

using System;
using System.CommandLine;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Channels;
using System.Collections.Generic;
using Azure;
using Azure.AI.VoiceLive;
using Azure.Core;
using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NAudio.Wave;

namespace VoiceLive.ProactiveTest
{
    /// <summary>
    /// Tracks session state for proactive messaging
    /// </summary>
    public class SessionState
    {
        public bool GreetingSent { get; set; } = false;
    }

    public class Program
    {
        public static async Task<int> Main(string[] args)
        {
            var rootCommand = CreateRootCommand();
            return await rootCommand.InvokeAsync(args).ConfigureAwait(false);
        }

        private static RootCommand CreateRootCommand()
        {
            var rootCommand = new RootCommand("Proactive Voice Assistant Test - Based on Voice Live how-to article");

            var apiKeyOption = new Option<string?>(
                "--api-key",
                "Azure VoiceLive API key");

            var endpointOption = new Option<string>(
                "--endpoint",
                () => Environment.GetEnvironmentVariable("AZURE_VOICELIVE_ENDPOINT") ?? "https://your-resource-name.services.ai.azure.com/",
                "Azure VoiceLive endpoint");

            var modelOption = new Option<string>(
                "--model",
                () => "gpt-realtime",
                "VoiceLive model to use");

            var voiceOption = new Option<string>(
                "--voice",
                () => "en-US-Ava:DragonHDLatestNeural",
                "Voice to use for the assistant");

            var greetingModeOption = new Option<string>(
                "--greeting-mode",
                () => "pre-generated",
                "Greeting mode: 'pre-generated' or 'llm-generated'");

            var useTokenCredentialOption = new Option<bool>(
                "--use-token-credential",
                "Use Azure token credential instead of API key");

            var verboseOption = new Option<bool>(
                "--verbose",
                "Enable verbose logging");

            rootCommand.AddOption(apiKeyOption);
            rootCommand.AddOption(endpointOption);
            rootCommand.AddOption(modelOption);
            rootCommand.AddOption(voiceOption);
            rootCommand.AddOption(greetingModeOption);
            rootCommand.AddOption(useTokenCredentialOption);
            rootCommand.AddOption(verboseOption);

            rootCommand.SetHandler(async (context) =>
            {
                var apiKey = context.ParseResult.GetValueForOption(apiKeyOption);
                var endpoint = context.ParseResult.GetValueForOption(endpointOption)!;
                var model = context.ParseResult.GetValueForOption(modelOption)!;
                var voice = context.ParseResult.GetValueForOption(voiceOption)!;
                var greetingMode = context.ParseResult.GetValueForOption(greetingModeOption)!;
                var useTokenCredential = context.ParseResult.GetValueForOption(useTokenCredentialOption);
                var verbose = context.ParseResult.GetValueForOption(verboseOption);

                // Load from appsettings.json
                var configuration = new ConfigurationBuilder()
                    .AddJsonFile("appsettings.json", optional: true)
                    .AddEnvironmentVariables()
                    .Build();

                apiKey ??= configuration["VoiceLive:ApiKey"];
                endpoint = configuration["VoiceLive:Endpoint"] ?? endpoint;
                model = configuration["VoiceLive:Model"] ?? model;
                voice = configuration["VoiceLive:Voice"] ?? voice;
                // Command-line takes priority over config file for greeting mode
                if (greetingMode == "pre-generated") // default value
                {
                    greetingMode = configuration["GreetingMode"] ?? greetingMode;
                }
                var instructions = configuration["VoiceLive:Instructions"] ?? 
                    "You are a helpful AI assistant. Respond naturally and conversationally.";

                await RunProactiveAssistant(
                    apiKey, endpoint, model, voice, instructions, 
                    greetingMode, useTokenCredential, verbose, 
                    context.GetCancellationToken());
            });

            return rootCommand;
        }

        private static async Task RunProactiveAssistant(
            string? apiKey,
            string endpoint,
            string model,
            string voice,
            string instructions,
            string greetingMode,
            bool useTokenCredential,
            bool verbose,
            CancellationToken cancellationToken)
        {
            Console.WriteLine("🎙️  Proactive Voice Assistant Test - C#");
            Console.WriteLine("=" + new string('=', 50));
            Console.WriteLine($"Greeting mode: {greetingMode}");
            Console.WriteLine("=" + new string('=', 50));

            // Create credential
            if (!useTokenCredential && string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("❌ Error: No authentication provided");
                Console.WriteLine("Please provide an API key or use --use-token-credential");
                return;
            }

            VoiceLiveClient client;
            if (useTokenCredential)
            {
                Console.WriteLine("🔑 Using Azure token credential");
                client = new VoiceLiveClient(new Uri(endpoint), new AzureCliCredential());
            }
            else
            {
                Console.WriteLine("🔑 Using API key credential");
                client = new VoiceLiveClient(new Uri(endpoint), new AzureKeyCredential(apiKey!));
            }

            try
            {
                Console.WriteLine($"Connecting to VoiceLive API with model {model}...");
                var session = await client.StartSessionAsync(model, cancellationToken).ConfigureAwait(false);

                // Create audio processor
                var audioProcessor = new AudioProcessor(session);

                // Configure session
                await ConfigureSessionAsync(session, voice, instructions, cancellationToken);

                // Start audio
                audioProcessor.StartPlayback();

                Console.WriteLine("\n" + new string('=', 60));
                Console.WriteLine("🎤 PROACTIVE VOICE ASSISTANT READY");
                Console.WriteLine($"Greeting mode: {greetingMode}");
                Console.WriteLine("Start speaking to begin conversation");
                Console.WriteLine("Press Ctrl+C to exit");
                Console.WriteLine(new string('=', 60) + "\n");

                // State tracking
                var state = new SessionState();

                // Process events
                await foreach (var serverEvent in session.GetUpdatesAsync(cancellationToken))
                {
                    await HandleEventAsync(
                        serverEvent, session, audioProcessor, 
                        greetingMode, state, 
                        cancellationToken);
                }
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("\n👋 Voice assistant shut down. Goodbye!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
            }
        }

        private static async Task ConfigureSessionAsync(
            VoiceLiveSession session, 
            string voice, 
            string instructions,
            CancellationToken cancellationToken)
        {
            Console.WriteLine("Setting up voice conversation session...");

            var sessionOptions = new VoiceLiveSessionOptions()
            {
                Model = "gpt-realtime",
                Instructions = instructions,
                Voice = new AzureStandardVoice(voice),
                TurnDetection = new AzureSemanticVadTurnDetection()
                {
                    Threshold = 0.5f,
                    PrefixPadding = TimeSpan.FromMilliseconds(300),
                    SilenceDuration = TimeSpan.FromMilliseconds(500)
                },
                InputAudioFormat = InputAudioFormat.Pcm16,
                OutputAudioFormat = OutputAudioFormat.Pcm16
            };

            sessionOptions.Modalities.Clear();
            sessionOptions.Modalities.Add(InteractionModality.Text);
            sessionOptions.Modalities.Add(InteractionModality.Audio);

            await session.ConfigureSessionAsync(sessionOptions, cancellationToken).ConfigureAwait(false);
            Console.WriteLine("✅ Session configuration sent");
        }

        private static async Task HandleEventAsync(
            SessionUpdate serverEvent,
            VoiceLiveSession session,
            AudioProcessor audioProcessor,
            string greetingMode,
            SessionState state,
            CancellationToken cancellationToken)
        {
            if (serverEvent is SessionUpdateSessionUpdated sessionUpdated)
            {
                Console.WriteLine("Session is ready.");

                // Start microphone capture
                await audioProcessor.StartCaptureAsync();

                // ==========================================================
                // PROACTIVE GREETING - Key addition from the how-to article
                // ==========================================================
                if (!state.GreetingSent)
                {
                    state.GreetingSent = true;
                    Console.WriteLine($"Sending proactive greeting ({greetingMode})...");

                    if (greetingMode == "pre-generated")
                    {
                        await SendPreGeneratedGreetingAsync(session, cancellationToken);
                    }
                    else
                    {
                        await SendLlmGeneratedGreetingAsync(session, cancellationToken);
                    }
                }
            }
            else if (serverEvent is SessionUpdateInputAudioBufferSpeechStarted)
            {
                Console.WriteLine("🎤 Listening...");
                await audioProcessor.StopPlaybackAsync();
            }
            else if (serverEvent is SessionUpdateResponseAudioDelta audioDelta)
            {
                await audioProcessor.QueueAudioAsync(audioDelta.Delta.ToArray());
            }
            else if (serverEvent is SessionUpdateResponseAudioDone)
            {
                Console.WriteLine("🎤 Ready for next input...");
            }
        }

        // =====================================================================
        // PROACTIVE MESSAGE HELPER FUNCTIONS (from how-to article)
        // =====================================================================

        private static async Task SendPreGeneratedGreetingAsync(
            VoiceLiveSession session, 
            CancellationToken cancellationToken)
        {
            try
            {
                var greeting = "Welcome! I'm here to help you get started.";
                var responseCreatePayload = new
                {
                    type = "response.create",
                    response = new
                    {
                        pre_generated_assistant_message = new
                        {
                            type = "message",
                            role = "assistant",
                            content = new[]
                            {
                                new { type = "text", text = greeting }
                            }
                        }
                    }
                };
                BinaryData eventData = BinaryData.FromObjectAsJson(responseCreatePayload);
                await session.SendCommandAsync(eventData, cancellationToken).ConfigureAwait(false);
                Console.WriteLine("✅ Pre-generated greeting sent successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send pre-generated greeting: {ex.Message}");
            }
        }

        private static async Task SendLlmGeneratedGreetingAsync(
            VoiceLiveSession session, 
            CancellationToken cancellationToken)
        {
            try
            {
                // Using strongly typed SDK classes
                var systemMessage = new SystemMessageItem(
                    new InputTextContentPart("Greet the user warmly and briefly explain how you can help."));
                await session.AddItemAsync(systemMessage, cancellationToken).ConfigureAwait(false);
                await session.StartResponseAsync().ConfigureAwait(false);
                Console.WriteLine("✅ LLM-generated greeting triggered successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send LLM-generated greeting: {ex.Message}");
            }
        }
    }

    // =========================================================================
    // AUDIO PROCESSOR (simplified for testing)
    // =========================================================================

    public class AudioProcessor
    {
        private readonly VoiceLiveSession _session;
        private WaveInEvent? _waveIn;
        private WaveOutEvent? _waveOut;
        private BufferedWaveProvider? _bufferedWaveProvider;

        public AudioProcessor(VoiceLiveSession session)
        {
            _session = session;
        }

        public async Task StartCaptureAsync()
        {
            try
            {
                _waveIn = new WaveInEvent
                {
                    WaveFormat = new WaveFormat(24000, 16, 1),
                    BufferMilliseconds = 50
                };

                _waveIn.DataAvailable += async (sender, e) =>
                {
                    try
                    {
                        await _session.SendInputAudioAsync(new BinaryData(e.Buffer.AsMemory(0, e.BytesRecorded)));
                    }
                    catch { }
                };

                _waveIn.StartRecording();
                Console.WriteLine("🎤 Microphone capture started");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to start microphone: {ex.Message}");
            }
        }

        public void StartPlayback()
        {
            try
            {
                _bufferedWaveProvider = new BufferedWaveProvider(new WaveFormat(24000, 16, 1))
                {
                    BufferDuration = TimeSpan.FromSeconds(10),
                    DiscardOnBufferOverflow = true
                };

                _waveOut = new WaveOutEvent();
                _waveOut.Init(_bufferedWaveProvider);
                _waveOut.Play();
                Console.WriteLine("🔊 Audio playback started");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to start playback: {ex.Message}");
            }
        }

        public Task QueueAudioAsync(byte[] audioData)
        {
            _bufferedWaveProvider?.AddSamples(audioData, 0, audioData.Length);
            return Task.CompletedTask;
        }

        public Task StopPlaybackAsync()
        {
            _bufferedWaveProvider?.ClearBuffer();
            return Task.CompletedTask;
        }

        public void Shutdown()
        {
            _waveIn?.StopRecording();
            _waveIn?.Dispose();
            _waveOut?.Stop();
            _waveOut?.Dispose();
        }
    }
}
