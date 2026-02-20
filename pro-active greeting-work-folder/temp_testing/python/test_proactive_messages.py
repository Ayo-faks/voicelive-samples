# -------------------------------------------------------------------------
# Voice Live Proactive Messages Test - Python
# Based on the how-to article: how-to-voice-live-proactive-messages.md
# -------------------------------------------------------------------------
from __future__ import annotations
import os
import sys
import argparse
import asyncio
import base64
from datetime import datetime
import logging
import queue
import signal
from typing import Union, Optional, TYPE_CHECKING, cast

from azure.core.credentials import AzureKeyCredential
from azure.core.credentials_async import AsyncTokenCredential
from azure.identity.aio import AzureCliCredential, DefaultAzureCredential

from azure.ai.voicelive.aio import connect
from azure.ai.voicelive.models import (
    AssistantMessageItem,
    AudioEchoCancellation,
    AudioNoiseReduction,
    AzureStandardVoice,
    InputAudioFormat,
    InputTextContentPart,
    MessageItem,
    Modality,
    OutputAudioFormat,
    OutputTextContentPart,
    RequestSession,
    ResponseCreateParams,
    ServerEventType,
    ServerVad
)
from dotenv import load_dotenv
import pyaudio

if TYPE_CHECKING:
    from azure.ai.voicelive.aio import VoiceLiveConnection

# Change to the directory where this script is located
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Environment variable loading
load_dotenv('../.env', override=True)
load_dotenv('./.env', override=True)

# Set up logging
if not os.path.exists('logs'):
    os.makedirs('logs')

timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

logging.basicConfig(
    filename=f'logs/{timestamp}_proactive_test.log',
    filemode="w",
    format='%(asctime)s:%(name)s:%(levelname)s:%(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Also log to console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(console_handler)


# =============================================================================
# PROACTIVE MESSAGE HELPER FUNCTIONS (from how-to article)
# =============================================================================

async def send_pre_generated_greeting(conn):
    """Option 1: Send a pre-generated greeting message."""
    try:
        await conn.response.create(
            response=ResponseCreateParams(
                pre_generated_assistant_message=AssistantMessageItem(
                    content=[
                        OutputTextContentPart(
                            text="Welcome! I'm here to help you get started."
                        )
                    ]
                )
            )
        )
        logger.info("✅ Pre-generated greeting sent successfully")
    except Exception as e:
        logger.error(f"Failed to send pre-generated greeting: {e}")


async def send_llm_generated_greeting(conn):
    """Option 2: Send an LLM-generated greeting message."""
    try:
        await conn.conversation.item.create(
            item=MessageItem(
                role="system",
                content=[
                    InputTextContentPart(
                        text="Greet the user warmly and briefly explain how you can help."
                    )
                ]
            )
        )
        await conn.response.create()
        logger.info("✅ LLM-generated greeting triggered successfully")
    except Exception as e:
        logger.error(f"Failed to send LLM-generated greeting: {e}")


# =============================================================================
# AUDIO PROCESSOR
# =============================================================================

class AudioProcessor:
    """Handles real-time audio capture and playback for the voice assistant."""

    loop: asyncio.AbstractEventLoop

    class AudioPlaybackPacket:
        def __init__(self, seq_num: int, data: Optional[bytes]):
            self.seq_num = seq_num
            self.data = data

    def __init__(self, connection):
        self.connection = connection
        self.audio = pyaudio.PyAudio()
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 24000
        self.chunk_size = 1200
        self.input_stream = None
        self.playback_queue: queue.Queue[AudioProcessor.AudioPlaybackPacket] = queue.Queue()
        self.playback_base = 0
        self.next_seq_num = 0
        self.output_stream: Optional[pyaudio.Stream] = None
        logger.info("AudioProcessor initialized with 24kHz PCM16 mono audio")

    def start_capture(self):
        """Start capturing audio from microphone."""
        def _capture_callback(in_data, _frame_count, _time_info, _status_flags):
            audio_base64 = base64.b64encode(in_data).decode("utf-8")
            asyncio.run_coroutine_threadsafe(
                self.connection.input_audio_buffer.append(audio=audio_base64), self.loop
            )
            return (None, pyaudio.paContinue)

        if self.input_stream:
            return

        self.loop = asyncio.get_event_loop()

        try:
            self.input_stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=_capture_callback,
            )
            logger.info("Started audio capture")
        except Exception:
            logger.exception("Failed to start audio capture")
            raise

    def start_playback(self):
        """Initialize audio playback system."""
        if self.output_stream:
            return

        remaining = bytes()
        def _playback_callback(_in_data, frame_count, _time_info, _status_flags):
            nonlocal remaining
            frame_count *= pyaudio.get_sample_size(pyaudio.paInt16)
            out = remaining[:frame_count]
            remaining_local = remaining[frame_count:]

            while len(out) < frame_count:
                try:
                    packet = self.playback_queue.get_nowait()
                except queue.Empty:
                    out = out + bytes(frame_count - len(out))
                    continue

                if not packet or not packet.data:
                    break

                if packet.seq_num < self.playback_base:
                    continue

                num_to_take = frame_count - len(out)
                out = out + packet.data[:num_to_take]

            return (out, pyaudio.paContinue) if len(out) >= frame_count else (out, pyaudio.paComplete)

        try:
            self.output_stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                output=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=_playback_callback
            )
            logger.info("Audio playback system ready")
        except Exception:
            logger.exception("Failed to initialize audio playback")
            raise

    def _get_and_increase_seq_num(self):
        seq = self.next_seq_num
        self.next_seq_num += 1
        return seq

    def queue_audio(self, audio_data: Optional[bytes]) -> None:
        self.playback_queue.put(
            AudioProcessor.AudioPlaybackPacket(
                seq_num=self._get_and_increase_seq_num(),
                data=audio_data))

    def skip_pending_audio(self):
        self.playback_base = self._get_and_increase_seq_num()

    def shutdown(self):
        if self.input_stream:
            self.input_stream.stop_stream()
            self.input_stream.close()
            self.input_stream = None
        logger.info("Stopped audio capture")

        if self.output_stream:
            self.skip_pending_audio()
            self.queue_audio(None)
            self.output_stream.stop_stream()
            self.output_stream.close()
            self.output_stream = None
        logger.info("Stopped audio playback")

        if self.audio:
            self.audio.terminate()
        logger.info("Audio processor cleaned up")


# =============================================================================
# VOICE ASSISTANT WITH PROACTIVE GREETING
# =============================================================================

class ProactiveVoiceAssistant:
    """Voice assistant with proactive greeting support."""

    def __init__(
        self,
        endpoint: str,
        credential: Union[AzureKeyCredential, AsyncTokenCredential],
        model: str,
        voice: str,
        instructions: str,
        greeting_mode: str = "pre-generated"  # "pre-generated" or "llm-generated"
    ):
        self.endpoint = endpoint
        self.credential = credential
        self.model = model
        self.voice = voice
        self.instructions = instructions
        self.greeting_mode = greeting_mode
        self.connection: Optional["VoiceLiveConnection"] = None
        self.audio_processor: Optional[AudioProcessor] = None
        self.session_ready = False
        self.greeting_sent = False  # Track if greeting has been sent
        self._active_response = False
        self._response_api_done = False

    async def start(self):
        """Start the voice assistant session."""
        try:
            logger.info(f"Connecting to VoiceLive API with model {self.model}")
            logger.info(f"Greeting mode: {self.greeting_mode}")

            async with connect(
                endpoint=self.endpoint,
                credential=self.credential,
                model=self.model,
            ) as connection:
                conn = connection
                self.connection = conn

                ap = AudioProcessor(conn)
                self.audio_processor = ap

                await self._setup_session()
                ap.start_playback()

                logger.info("Voice assistant ready! Start speaking...")
                print("\n" + "=" * 60)
                print("🎤 PROACTIVE VOICE ASSISTANT TEST")
                print(f"Greeting mode: {self.greeting_mode}")
                print("Start speaking to begin conversation")
                print("Press Ctrl+C to exit")
                print("=" * 60 + "\n")

                await self._process_events()
        finally:
            if self.audio_processor:
                self.audio_processor.shutdown()

    async def _setup_session(self):
        """Configure the VoiceLive session."""
        logger.info("Setting up voice conversation session...")

        voice_config: Union[AzureStandardVoice, str]
        if "-" in self.voice:
            voice_config = AzureStandardVoice(name=self.voice)
        else:
            voice_config = self.voice

        turn_detection_config = ServerVad(
            threshold=0.5,
            prefix_padding_ms=300,
            silence_duration_ms=500)

        session_config = RequestSession(
            modalities=[Modality.TEXT, Modality.AUDIO],
            instructions=self.instructions,
            voice=voice_config,
            input_audio_format=InputAudioFormat.PCM16,
            output_audio_format=OutputAudioFormat.PCM16,
            turn_detection=turn_detection_config,
            input_audio_echo_cancellation=AudioEchoCancellation(),
            input_audio_noise_reduction=AudioNoiseReduction(type="azure_deep_noise_suppression"),
        )

        conn = self.connection
        assert conn is not None
        await conn.session.update(session=session_config)
        logger.info("Session configuration sent")

    async def _process_events(self):
        """Process events from the VoiceLive connection."""
        try:
            conn = self.connection
            assert conn is not None
            async for event in conn:
                await self._handle_event(event)
        except Exception:
            logger.exception("Error processing events")
            raise

    async def _handle_event(self, event):
        """Handle events with proactive greeting support."""
        logger.debug(f"Received event: {event.type}")
        ap = self.audio_processor
        conn = self.connection
        assert ap is not None
        assert conn is not None

        if event.type == ServerEventType.SESSION_UPDATED:
            logger.info(f"Session ready: {event.session.id}")
            self.session_ready = True

            # Start audio capture
            ap.start_capture()

            # ============================================================
            # PROACTIVE GREETING - This is the key addition from the how-to
            # ============================================================
            if not self.greeting_sent:
                self.greeting_sent = True
                logger.info(f"Sending proactive greeting ({self.greeting_mode})...")

                if self.greeting_mode == "pre-generated":
                    # Option 1: Pre-generated greeting
                    await send_pre_generated_greeting(conn)
                else:
                    # Option 2: LLM-generated greeting
                    await send_llm_generated_greeting(conn)

        elif event.type == ServerEventType.INPUT_AUDIO_BUFFER_SPEECH_STARTED:
            logger.info("User started speaking - stopping playback")
            print("🎤 Listening...")
            ap.skip_pending_audio()

        elif event.type == ServerEventType.INPUT_AUDIO_BUFFER_SPEECH_STOPPED:
            logger.info("User stopped speaking")
            print("🤔 Processing...")

        elif event.type == ServerEventType.RESPONSE_CREATED:
            logger.info("Assistant response created")
            self._active_response = True
            self._response_api_done = False

        elif event.type == ServerEventType.RESPONSE_AUDIO_DELTA:
            logger.debug("Received audio delta")
            ap.queue_audio(event.delta)

        elif event.type == ServerEventType.RESPONSE_AUDIO_DONE:
            logger.info("Assistant finished speaking")
            print("🎤 Ready for next input...")

        elif event.type == ServerEventType.RESPONSE_DONE:
            logger.info("Response complete")
            self._active_response = False
            self._response_api_done = True

        elif event.type == ServerEventType.ERROR:
            msg = event.error.message
            if "Cancellation failed: no active response" in msg:
                logger.debug(f"Benign cancellation error: {msg}")
            else:
                logger.error(f"VoiceLive error: {msg}")
                print(f"Error: {msg}")

        elif event.type == ServerEventType.CONVERSATION_ITEM_CREATED:
            logger.debug(f"Conversation item created: {event.item.id}")

        else:
            logger.debug(f"Unhandled event type: {event.type}")


# =============================================================================
# MAIN
# =============================================================================

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Proactive Voice Assistant Test - Based on Voice Live how-to article",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    parser.add_argument(
        "--api-key",
        help="Azure VoiceLive API key",
        type=str,
        default=os.environ.get("AZURE_VOICELIVE_API_KEY"),
    )

    parser.add_argument(
        "--endpoint",
        help="Azure VoiceLive endpoint",
        type=str,
        default=os.environ.get("AZURE_VOICELIVE_ENDPOINT", "https://your-resource-name.services.ai.azure.com/"),
    )

    parser.add_argument(
        "--model",
        help="VoiceLive model to use",
        type=str,
        default=os.environ.get("AZURE_VOICELIVE_MODEL", "gpt-realtime"),
    )

    parser.add_argument(
        "--voice",
        help="Voice to use for the assistant",
        type=str,
        default=os.environ.get("AZURE_VOICELIVE_VOICE", "en-US-Ava:DragonHDLatestNeural"),
    )

    parser.add_argument(
        "--instructions",
        help="System instructions for the AI assistant",
        type=str,
        default=os.environ.get(
            "AZURE_VOICELIVE_INSTRUCTIONS",
            "You are a helpful AI assistant. Respond naturally and conversationally. Keep your responses concise but engaging.",
        ),
    )

    parser.add_argument(
        "--greeting-mode",
        help="Proactive greeting mode: 'pre-generated' or 'llm-generated'",
        type=str,
        choices=["pre-generated", "llm-generated"],
        default="pre-generated",
    )

    parser.add_argument(
        "--use-token-credential",
        help="Use Azure token credential instead of API key",
        action="store_true",
        default=False
    )

    parser.add_argument("--verbose", help="Enable verbose logging", action="store_true")

    return parser.parse_args()


def main():
    args = parse_arguments()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)

    if not args.api_key and not args.use_token_credential:
        print("❌ Error: No authentication provided")
        print("Please provide an API key using --api-key or set AZURE_VOICELIVE_API_KEY environment variable,")
        print("or use --use-token-credential for Azure authentication.")
        sys.exit(1)

    credential: Union[AzureKeyCredential, AsyncTokenCredential]
    if args.use_token_credential:
        credential = AzureCliCredential()
        logger.info("Using Azure token credential")
    else:
        credential = AzureKeyCredential(args.api_key)
        logger.info("Using API key credential")

    assistant = ProactiveVoiceAssistant(
        endpoint=args.endpoint,
        credential=credential,
        model=args.model,
        voice=args.voice,
        instructions=args.instructions,
        greeting_mode=args.greeting_mode,
    )

    def signal_handler(_sig, _frame):
        logger.info("Received shutdown signal")
        raise KeyboardInterrupt()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        asyncio.run(assistant.start())
    except KeyboardInterrupt:
        print("\n👋 Voice assistant shut down. Goodbye!")
    except Exception as e:
        print(f"Fatal Error: {e}")
        logger.exception("Fatal error")


if __name__ == "__main__":
    # Check audio system
    try:
        p = pyaudio.PyAudio()
        input_devices = [
            i for i in range(p.get_device_count())
            if cast(Union[int, float], p.get_device_info_by_index(i).get("maxInputChannels", 0) or 0) > 0
        ]
        output_devices = [
            i for i in range(p.get_device_count())
            if cast(Union[int, float], p.get_device_info_by_index(i).get("maxOutputChannels", 0) or 0) > 0
        ]
        p.terminate()

        if not input_devices:
            print("❌ No audio input devices found. Please check your microphone.")
            sys.exit(1)
        if not output_devices:
            print("❌ No audio output devices found. Please check your speakers.")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Audio system check failed: {e}")
        sys.exit(1)

    print("🎙️  Proactive Voice Assistant Test")
    print("=" * 50)
    print("Testing Voice Live proactive messages how-to article")
    print("=" * 50)

    main()
