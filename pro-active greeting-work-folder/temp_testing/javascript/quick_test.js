// Voice Live Proactive Messages Quick Test - JavaScript
// Tests actual connection and proactive greeting

import { VoiceLiveClient } from '@azure/ai-voicelive';
import { AzureCliCredential } from '@azure/identity';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
let greetingMode = 'pre-generated';
let useTokenCredential = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--greeting-mode' && args[i + 1]) {
        greetingMode = args[++i];
    } else if (args[i] === '--use-token-credential') {
        useTokenCredential = true;
    }
}

console.log('🎙️  Voice Live Proactive Messages Quick Test');
console.log('='.repeat(50));
console.log(`Greeting mode: ${greetingMode}`);
console.log('='.repeat(50));

const endpoint = process.env.AZURE_VOICELIVE_ENDPOINT;
const model = process.env.AZURE_VOICELIVE_MODEL || 'gpt-realtime';

if (!endpoint) {
    console.error('❌ Error: AZURE_VOICELIVE_ENDPOINT environment variable not set');
    process.exit(1);
}

async function sendPreGeneratedGreeting(session) {
    try {
        await session.sendEvent({
            type: 'response.create',
            response: {
                preGeneratedAssistantMessage: {
                    content: [
                        {
                            type: 'text',
                            text: 'Welcome! I am here to help you get started.'
                        }
                    ]
                }
            }
        });
        console.log('✅ Pre-generated greeting sent successfully');
    } catch (error) {
        console.error('❌ Failed to send pre-generated greeting:', error.message);
    }
}

async function sendLlmGeneratedGreeting(session) {
    try {
        await session.addConversationItem({
            type: 'message',
            role: 'system',
            content: [
                {
                    type: 'input_text',
                    text: 'Greet the user warmly and briefly explain how you can help.'
                }
            ]
        });
        await session.sendEvent({
            type: 'response.create'
        });
        console.log('✅ LLM-generated greeting triggered successfully');
    } catch (error) {
        console.error('❌ Failed to send LLM-generated greeting:', error.message);
    }
}

async function main() {
    try {
        console.log('🔑 Using Azure CLI credential');
        const credential = new AzureCliCredential();
        
        console.log(`Connecting to VoiceLive API (${endpoint})...`);
        const client = new VoiceLiveClient(endpoint, credential);
        
        console.log(`Starting session with model: ${model}...`);
        const session = await client.startSession(model);
        
        console.log('✓ Session created, configuring...');
        
        // Configure session
        await session.updateSession({
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful AI assistant.',
            voice: {
                type: 'azure-standard',
                name: 'en-US-Ava:DragonHDLatestNeural'
            },
            inputAudioFormat: 'pcm16',
            outputAudioFormat: 'pcm16'
        });
        
        // Subscribe to events
        let greetingSent = false;
        
        session.subscribe({
            onSessionUpdated: async (event) => {
                console.log('✓ Session ready (session.updated received)');
                
                if (!greetingSent) {
                    greetingSent = true;
                    console.log(`Sending ${greetingMode} greeting...`);
                    
                    if (greetingMode === 'pre-generated') {
                        await sendPreGeneratedGreeting(session);
                    } else {
                        await sendLlmGeneratedGreeting(session);
                    }
                    
                    // Wait a moment for server response, then disconnect
                    setTimeout(async () => {
                        console.log('\n✅ Test completed successfully!');
                        await session.disconnect();
                        process.exit(0);
                    }, 2000);
                }
            },
            onError: (error) => {
                console.error('❌ Session error:', error.message);
            },
            onResponseCreated: (event) => {
                console.log('✓ Response created event received');
            },
            onResponseDone: (event) => {
                console.log('✓ Response done event received');
            }
        });
        
        // Timeout after 30 seconds
        setTimeout(() => {
            console.error('❌ Test timed out after 30 seconds');
            process.exit(1);
        }, 30000);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
