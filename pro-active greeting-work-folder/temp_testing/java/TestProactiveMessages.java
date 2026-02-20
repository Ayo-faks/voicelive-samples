// -------------------------------------------------------------------------
// Voice Live Proactive Messages Test - Java
// Based on the how-to article: how-to-voice-live-proactive-messages.md
// -------------------------------------------------------------------------

import com.azure.ai.voicelive.VoiceLiveAsyncClient;
import com.azure.ai.voicelive.VoiceLiveClientBuilder;
import com.azure.ai.voicelive.VoiceLiveServiceVersion;
import com.azure.ai.voicelive.VoiceLiveSessionAsyncClient;
import com.azure.ai.voicelive.models.*;
import com.azure.core.credential.KeyCredential;
import com.azure.core.credential.TokenCredential;
import com.azure.core.util.BinaryData;
import com.azure.identity.AzureCliCredentialBuilder;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.sound.sampled.*;
import java.util.Arrays;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Voice Live Proactive Messages Test - Java
 * 
 * Tests the proactive greeting functionality from the how-to article.
 * 
 * Usage:
 *   mvn compile exec:java
 *   mvn compile exec:java -Dexec.args="--greeting-mode llm-generated"
 *   mvn compile exec:java -Dexec.args="--use-token-credential"
 */
public class TestProactiveMessages {

    // Configuration constants
    private static final int SAMPLE_RATE = 24000;
    private static final int CHANNELS = 1;
    private static final int SAMPLE_SIZE_BITS = 16;
    private static final int CHUNK_SIZE = 1200;

    // Environment variable names
    private static final String ENV_ENDPOINT = "AZURE_VOICELIVE_ENDPOINT";
    private static final String ENV_API_KEY = "AZURE_VOICELIVE_API_KEY";

    public static void main(String[] args) {
        System.out.println("🎙️  Proactive Voice Assistant Test - Java");
        System.out.println("=" + "=".repeat(50));
        System.out.println("Testing Voice Live proactive messages how-to article");
        System.out.println("=" + "=".repeat(50));

        // Parse arguments
        String greetingMode = "pre-generated";
        boolean useTokenCredential = false;

        for (int i = 0; i < args.length; i++) {
            if ("--greeting-mode".equals(args[i]) && i + 1 < args.length) {
                greetingMode = args[++i];
            } else if ("--use-token-credential".equals(args[i])) {
                useTokenCredential = true;
            }
        }

        System.out.println("Greeting mode: " + greetingMode);

        // Get configuration
        String endpoint = System.getenv(ENV_ENDPOINT);
        String apiKey = System.getenv(ENV_API_KEY);

        if (endpoint == null || endpoint.isEmpty()) {
            System.err.println("❌ Error: AZURE_VOICELIVE_ENDPOINT environment variable not set");
            return;
        }

        if (!useTokenCredential && (apiKey == null || apiKey.isEmpty())) {
            System.err.println("❌ Error: No authentication provided");
            System.err.println("Set AZURE_VOICELIVE_API_KEY or use --use-token-credential");
            return;
        }

        // Check audio system
        if (!checkAudioSystem()) {
            System.err.println("❌ Audio system check failed");
            return;
        }

        try {
            runProactiveAssistant(endpoint, apiKey, greetingMode, useTokenCredential);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static boolean checkAudioSystem() {
        try {
            AudioFormat format = new AudioFormat(SAMPLE_RATE, SAMPLE_SIZE_BITS, CHANNELS, true, false);
            DataLine.Info micInfo = new DataLine.Info(TargetDataLine.class, format);
            DataLine.Info speakerInfo = new DataLine.Info(SourceDataLine.class, format);

            if (!AudioSystem.isLineSupported(micInfo)) {
                System.err.println("❌ No compatible microphone found");
                return false;
            }
            if (!AudioSystem.isLineSupported(speakerInfo)) {
                System.err.println("❌ No compatible speaker found");
                return false;
            }

            System.out.println("✓ Audio system check passed");
            return true;
        } catch (Exception e) {
            System.err.println("❌ Audio system check failed: " + e.getMessage());
            return false;
        }
    }

    private static void runProactiveAssistant(
            String endpoint, 
            String apiKey, 
            String greetingMode,
            boolean useTokenCredential) {

        // Create client
        VoiceLiveAsyncClient client;
        if (useTokenCredential) {
            System.out.println("🔑 Using Azure token credential");
            TokenCredential credential = new AzureCliCredentialBuilder().build();
            client = new VoiceLiveClientBuilder()
                .endpoint(endpoint)
                .credential(credential)
                .serviceVersion(VoiceLiveServiceVersion.V2025_10_01)
                .buildAsyncClient();
        } else {
            System.out.println("🔑 Using API key credential");
            client = new VoiceLiveClientBuilder()
                .endpoint(endpoint)
                .credential(new KeyCredential(apiKey))
                .serviceVersion(VoiceLiveServiceVersion.V2025_10_01)
                .buildAsyncClient();
        }

        // State tracking
        AtomicBoolean greetingSent = new AtomicBoolean(false);
        String model = "gpt-realtime";

        // Start session
        client.startSession(model)
            .flatMap(session -> {
                System.out.println("✓ Session started successfully");

                // Create audio processor
                AudioProcessor audioProcessor = new AudioProcessor(session);

                // Subscribe to events
                session.receiveEvents()
                    .doOnSubscribe(s -> System.out.println("🔗 Subscribed to event stream"))
                    .subscribe(
                        event -> handleServerEvent(event, session, audioProcessor, greetingMode, greetingSent),
                        error -> System.err.println("❌ Event stream error: " + error.getMessage()),
                        () -> System.out.println("✓ Event stream completed")
                    );

                // Configure session
                VoiceLiveSessionOptions sessionOptions = createSessionOptions();
                ClientEventSessionUpdate updateEvent = new ClientEventSessionUpdate(sessionOptions);
                
                session.sendEvent(updateEvent)
                    .doOnSuccess(v -> System.out.println("✓ Session configuration sent"))
                    .subscribe();

                // Start audio
                audioProcessor.startPlayback();

                System.out.println("\n" + "=".repeat(60));
                System.out.println("🎤 PROACTIVE VOICE ASSISTANT READY");
                System.out.println("Greeting mode: " + greetingMode);
                System.out.println("Start speaking to begin conversation");
                System.out.println("Press Ctrl+C to exit");
                System.out.println("=".repeat(60) + "\n");

                // Shutdown hook
                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    System.out.println("\n🛑 Shutting down...");
                    audioProcessor.shutdown();
                }));

                return Mono.never();
            })
            .block();
    }

    private static VoiceLiveSessionOptions createSessionOptions() {
        ServerVadTurnDetection turnDetection = new ServerVadTurnDetection()
            .setThreshold(0.5)
            .setPrefixPaddingMs(300)
            .setSilenceDurationMs(500)
            .setInterruptResponse(true)
            .setAutoTruncate(true)
            .setCreateResponse(true);

        AudioInputTranscriptionOptions transcriptionOptions = 
            new AudioInputTranscriptionOptions(AudioInputTranscriptionOptionsModel.WHISPER_1);

        return new VoiceLiveSessionOptions()
            .setInstructions("You are a helpful AI voice assistant. Respond naturally and conversationally.")
            .setVoice(BinaryData.fromObject(new AzureStandardVoice("en-US-Ava:DragonHDLatestNeural")))
            .setModalities(Arrays.asList(InteractionModality.TEXT, InteractionModality.AUDIO))
            .setInputAudioFormat(InputAudioFormat.PCM16)
            .setOutputAudioFormat(OutputAudioFormat.PCM16)
            .setInputAudioSamplingRate(SAMPLE_RATE)
            .setInputAudioNoiseReduction(new AudioNoiseReduction(AudioNoiseReductionType.NEAR_FIELD))
            .setInputAudioEchoCancellation(new AudioEchoCancellation())
            .setInputAudioTranscription(transcriptionOptions)
            .setTurnDetection(turnDetection);
    }

    private static void handleServerEvent(
            SessionUpdate event, 
            VoiceLiveSessionAsyncClient session,
            AudioProcessor audioProcessor,
            String greetingMode,
            AtomicBoolean greetingSent) {

        ServerEventType eventType = event.getType();

        if (eventType == ServerEventType.SESSION_UPDATED) {
            System.out.println("✓ Session ready - starting microphone");
            audioProcessor.startCapture();

            // ==========================================================
            // PROACTIVE GREETING - Key addition from the how-to article
            // ==========================================================
            if (!greetingSent.getAndSet(true)) {
                System.out.println("Sending proactive greeting (" + greetingMode + ")...");

                if ("pre-generated".equals(greetingMode)) {
                    sendPreGeneratedGreeting(session);
                } else {
                    sendLlmGeneratedGreeting(session);
                }
            }

        } else if (eventType == ServerEventType.INPUT_AUDIO_BUFFER_SPEECH_STARTED) {
            System.out.println("🎤 Listening...");
            audioProcessor.skipPendingAudio();

        } else if (eventType == ServerEventType.RESPONSE_AUDIO_DELTA) {
            if (event instanceof SessionUpdateResponseAudioDelta) {
                SessionUpdateResponseAudioDelta audioEvent = (SessionUpdateResponseAudioDelta) event;
                audioProcessor.queueAudio(audioEvent.getDelta());
            }

        } else if (eventType == ServerEventType.RESPONSE_AUDIO_DONE) {
            System.out.println("🎤 Ready for next input...");

        } else if (eventType == ServerEventType.ERROR) {
            if (event instanceof SessionUpdateError) {
                SessionUpdateError errorEvent = (SessionUpdateError) event;
                System.out.println("❌ VoiceLive error: " + errorEvent.getError().getMessage());
            }
        }
    }

    // =========================================================================
    // PROACTIVE MESSAGE HELPER FUNCTIONS (from how-to article)
    // =========================================================================

    private static void sendPreGeneratedGreeting(VoiceLiveSessionAsyncClient session) {
        try {
            // Create pre-generated assistant message with content
            OutputTextContentPart textContent = new OutputTextContentPart("Welcome! I'm here to help you get started.");
            AssistantMessageItem assistantMessage = new AssistantMessageItem(Arrays.asList(textContent));
            
            // Create response params with pre-generated message
            ResponseCreateParams responseParams = new ResponseCreateParams()
                .setPreGeneratedAssistantMessage(assistantMessage);
            
            // Send response.create event with pre-generated message
            session.sendEvent(new ClientEventResponseCreate().setResponse(responseParams))
                .doOnSuccess(v -> System.out.println("✅ Pre-generated greeting sent successfully"))
                .doOnError(error -> System.err.println("❌ Failed to send pre-generated greeting: " + error.getMessage()))
                .subscribe();
        } catch (Exception e) {
            System.err.println("❌ Failed to send pre-generated greeting: " + e.getMessage());
        }
    }

    private static void sendLlmGeneratedGreeting(VoiceLiveSessionAsyncClient session) {
        try {
            // First, add a system message with greeting instructions using SystemMessageItem
            InputTextContentPart textContent = new InputTextContentPart(
                "Greet the user warmly and briefly explain how you can help.");
            SystemMessageItem systemMessage = new SystemMessageItem(Arrays.asList(textContent));
            
            session.sendEvent(new ClientEventConversationItemCreate().setItem(systemMessage))
                .doOnError(error -> System.err.println("❌ Failed to add conversation item: " + error.getMessage()))
                .subscribe();
            
            // Then trigger the response generation
            session.sendEvent(new ClientEventResponseCreate())
                .doOnSuccess(v -> System.out.println("✅ LLM-generated greeting triggered successfully"))
                .doOnError(error -> System.err.println("❌ Failed to create response: " + error.getMessage()))
                .subscribe();
        } catch (Exception e) {
            System.err.println("❌ Failed to send LLM-generated greeting: " + e.getMessage());
        }
    }

    // =========================================================================
    // AUDIO PROCESSOR (simplified for testing)
    // =========================================================================

    private static class AudioProcessor {
        private final VoiceLiveSessionAsyncClient session;
        private final AudioFormat audioFormat;
        private TargetDataLine microphone;
        private SourceDataLine speaker;
        private final AtomicBoolean isCapturing = new AtomicBoolean(false);
        private final AtomicBoolean isPlaying = new AtomicBoolean(false);
        private final BlockingQueue<byte[]> playbackQueue = new LinkedBlockingQueue<>();
        private final AtomicInteger skipCounter = new AtomicInteger(0);

        AudioProcessor(VoiceLiveSessionAsyncClient session) {
            this.session = session;
            this.audioFormat = new AudioFormat(
                AudioFormat.Encoding.PCM_SIGNED,
                SAMPLE_RATE, SAMPLE_SIZE_BITS, CHANNELS,
                CHANNELS * SAMPLE_SIZE_BITS / 8, SAMPLE_RATE, false);
        }

        void startCapture() {
            if (isCapturing.get()) return;

            try {
                DataLine.Info micInfo = new DataLine.Info(TargetDataLine.class, audioFormat);
                microphone = (TargetDataLine) AudioSystem.getLine(micInfo);
                microphone.open(audioFormat, CHUNK_SIZE * 4);
                microphone.start();
                isCapturing.set(true);

                Thread captureThread = new Thread(() -> {
                    byte[] buffer = new byte[CHUNK_SIZE * 2];
                    while (isCapturing.get() && microphone != null) {
                        try {
                            int bytesRead = microphone.read(buffer, 0, buffer.length);
                            if (bytesRead > 0) {
                                byte[] audioChunk = Arrays.copyOf(buffer, bytesRead);
                                session.sendInputAudio(BinaryData.fromBytes(audioChunk))
                                    .subscribeOn(Schedulers.boundedElastic())
                                    .subscribe();
                            }
                        } catch (Exception e) {
                            if (isCapturing.get()) {
                                System.err.println("❌ Error in audio capture: " + e.getMessage());
                            }
                            break;
                        }
                    }
                }, "VoiceLive-AudioCapture");
                captureThread.setDaemon(true);
                captureThread.start();

                System.out.println("🎤 Microphone capture started");
            } catch (LineUnavailableException e) {
                System.err.println("❌ Failed to start microphone: " + e.getMessage());
            }
        }

        void startPlayback() {
            if (isPlaying.get()) return;

            try {
                DataLine.Info speakerInfo = new DataLine.Info(SourceDataLine.class, audioFormat);
                speaker = (SourceDataLine) AudioSystem.getLine(speakerInfo);
                speaker.open(audioFormat, CHUNK_SIZE * 4);
                speaker.start();
                isPlaying.set(true);

                Thread playbackThread = new Thread(() -> {
                    while (isPlaying.get()) {
                        try {
                            byte[] audio = playbackQueue.take();
                            if (audio != null && speaker != null && speaker.isOpen()) {
                                speaker.write(audio, 0, audio.length);
                            }
                        } catch (InterruptedException e) {
                            break;
                        }
                    }
                }, "VoiceLive-AudioPlayback");
                playbackThread.setDaemon(true);
                playbackThread.start();

                System.out.println("🔊 Audio playback started");
            } catch (LineUnavailableException e) {
                System.err.println("❌ Failed to start speaker: " + e.getMessage());
            }
        }

        void queueAudio(byte[] audioData) {
            if (audioData != null && audioData.length > 0) {
                playbackQueue.offer(audioData);
            }
        }

        void skipPendingAudio() {
            playbackQueue.clear();
            if (speaker != null && speaker.isOpen()) {
                speaker.flush();
            }
        }

        void shutdown() {
            isCapturing.set(false);
            if (microphone != null) {
                microphone.stop();
                microphone.close();
            }
            isPlaying.set(false);
            if (speaker != null) {
                speaker.stop();
                speaker.close();
            }
            System.out.println("Audio processor cleaned up");
        }
    }
}
