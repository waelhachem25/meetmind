# Ollama Setup for MeetMind

Ollama provides **FREE, LOCAL, ACCURATE** AI for meeting minutes - just like Whisper does for transcription!

## Why Ollama?

- ✅ **100% FREE** - No API costs, no limits
- ✅ **Runs locally** - Like Whisper, on your own machine
- ✅ **Very accurate** - Uses powerful models like Llama 3.1, Qwen, Mistral
- ✅ **Private** - Your data never leaves your computer
- ✅ **Fast** - Optimized for local inference

## Installation

### macOS/Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Or with Homebrew (macOS):
```bash
brew install ollama
```

### Windows:
Download from: https://ollama.com/download

## Start Ollama

```bash
ollama serve
```

This starts Ollama on `http://localhost:11434` (default)

## Download a Model

Choose one of these models (recommended for meeting minutes):

### Option 1: Llama 3.1 8B (RECOMMENDED - Best balance)
```bash
ollama pull llama3.1:8b
```
- **Size**: ~4.7 GB
- **Accuracy**: Excellent
- **Speed**: Fast
- **RAM needed**: 8 GB

### Option 2: Qwen 2.5 7B (Great alternative)
```bash
ollama pull qwen2.5:7b
```
- **Size**: ~4.7 GB
- **Accuracy**: Excellent for extraction tasks
- **Speed**: Very fast

### Option 3: Llama 3.1 70B (Best accuracy, needs powerful machine)
```bash
ollama pull llama3.1:70b
```
- **Size**: ~40 GB
- **Accuracy**: Best possible
- **Speed**: Slower
- **RAM needed**: 64 GB

### Option 4: Mistral 7B (Fast and efficient)
```bash
ollama pull mistral:7b
```
- **Size**: ~4.1 GB
- **Accuracy**: Very good
- **Speed**: Very fast

## Configuration

Your `appsettings.json` is already configured with:

```json
"Ollama": {
  "Url": "http://localhost:11434",
  "Model": "llama3.1:8b"
}
```

To use a different model, change `"Model"` to:
- `"llama3.1:8b"` (default, recommended)
- `"qwen2.5:7b"`
- `"llama3.1:70b"` (if you have a powerful machine)
- `"mistral:7b"`

## How It Works

1. **Ollama running**: Uses your selected local model (accurate!)
2. **Ollama not running**: Falls back to Gemini (also free)
3. **Neither available**: Uses local Python pattern matching

## Start Your API

```bash
cd api
dotnet run
```

You'll see:
```
🦙 Using Ollama for meeting minutes: llama3.1:8b
   Ollama URL: http://localhost:11434
   Falls back to Gemini/local AI if Ollama is not running
```

## Test Ollama

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test with a simple prompt
ollama run llama3.1:8b "Hello, how are you?"
```

## Performance Tips

1. **For best accuracy**: Use `llama3.1:8b` or `qwen2.5:7b`
2. **For fastest speed**: Use `mistral:7b`
3. **For max accuracy (if you have RAM)**: Use `llama3.1:70b`

## Troubleshooting

### Ollama not found
- Make sure you installed Ollama
- Run `ollama serve` in a terminal
- Check `http://localhost:11434` in your browser

### Model not found
- Pull the model: `ollama pull llama3.1:8b`
- Check available models: `ollama list`

### Out of memory
- Use a smaller model: `mistral:7b` or `qwen2.5:7b`
- Close other applications

## Compare: Ollama vs Gemini vs OpenAI

| Feature | Ollama | Gemini Free | OpenAI |
|---------|--------|-------------|--------|
| Cost | FREE | FREE (limited) | Paid |
| Privacy | Local | Cloud | Cloud |
| Accuracy | Excellent | Very Good | Excellent |
| Speed | Fast | Fast | Fast |
| Limits | None | 1,500/day | Pay per use |
| Setup | Install once | API key | API key + billing |

## Recommended Setup

For best experience (like Whisper for transcription):

1. Install Ollama
2. Pull `llama3.1:8b`: `ollama pull llama3.1:8b`
3. Start Ollama: `ollama serve`
4. Keep it running in the background
5. Your meeting minutes will be FREE and ACCURATE!

---

**Questions?**
- Ollama docs: https://ollama.com
- Model library: https://ollama.com/library
- GitHub: https://github.com/ollama/ollama
