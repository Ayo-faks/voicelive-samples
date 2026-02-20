# Voice Live Proactive Messages Testing

This folder contains test implementations for the Voice Live proactive messages how-to article.

## Test Structure

```
temp_testing/
├── python/                         # Python SDK test
│   ├── requirements.txt
│   └── test_proactive_messages.py
├── csharp/                         # C# SDK test
│   ├── TestProactiveMessages.csproj
│   ├── appsettings.json
│   └── Program.cs
├── java/                           # Java SDK test
│   ├── pom.xml
│   └── TestProactiveMessages.java
├── javascript/                     # JavaScript SDK test
│   ├── package.json
│   └── test_proactive_messages.js
├── .env.template                   # Environment variables template
└── README.md                       # This file
```

## Prerequisites

1. Azure subscription with a Foundry resource
2. Set environment variables (copy `.env.template` to `.env` and fill in values):
   - `AZURE_VOICELIVE_ENDPOINT` - Your Foundry resource endpoint
   - `AZURE_VOICELIVE_API_KEY` - Your API key (optional if using Azure CLI auth)

## Running Tests

### Python
```bash
cd python
pip install -r requirements.txt

# Option 1: Pre-generated greeting (default)
python test_proactive_messages.py --use-token-credential

# Option 2: LLM-generated greeting
python test_proactive_messages.py --use-token-credential --greeting-mode llm-generated

# With API key
python test_proactive_messages.py --api-key YOUR_KEY
```

### C#
```bash
cd csharp
dotnet restore

# Option 1: Pre-generated greeting (default)
dotnet run -- --use-token-credential

# Option 2: LLM-generated greeting
dotnet run -- --use-token-credential --greeting-mode llm-generated
```

### Java
```bash
cd java

# Option 1: Pre-generated greeting (default)
mvn compile exec:java

# Option 2: LLM-generated greeting
mvn compile exec:java -Dexec.args="--greeting-mode llm-generated"

# With token credential
mvn compile exec:java -Dexec.args="--use-token-credential"
```

### JavaScript
```bash
cd javascript
npm install

# Option 1: Pre-generated greeting (default)
node test_proactive_messages.js

# Option 2: LLM-generated greeting
node test_proactive_messages.js --greeting-mode llm-generated
```

## Test Options

Each test supports two proactive greeting modes:
- **Option 1: `pre-generated`** - Sends a deterministic, pre-written greeting
- **Option 2: `llm-generated`** - Triggers the LLM to generate a dynamic greeting

Toggle the option using `--greeting-mode pre-generated` or `--greeting-mode llm-generated`.

## What These Tests Validate

1. **Session initialization** - Connecting to Voice Live API
2. **Event handling** - Processing SESSION_UPDATED event
3. **State tracking** - Ensuring greeting is sent only once
4. **Pre-generated greeting** - Using `response.create` with `pre_generated_assistant_message`
5. **LLM-generated greeting** - Using `conversation.item.create` + `response.create`
6. **Error handling** - Try/catch around greeting functions

## SDK Version Notes

| Language | SDK | Version | Status |
|----------|-----|---------|--------|
| Python | azure-ai-voicelive | Latest | GA |
| C# | Azure.AI.VoiceLive | Latest | GA |
| Java | azure-ai-voicelive | 1.0.0-beta.1 | Preview |
| JavaScript | @azure/ai-voicelive | Latest | Preview |

> **Note**: Java and JavaScript SDKs are in preview. APIs may change before GA.

