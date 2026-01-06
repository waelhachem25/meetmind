#!/usr/bin/env python3.11
"""
Enhanced Whisper Transcription Script with Repetition Detection
Receives audio file path as argument, returns clean transcribed text
Uses OpenAI's Whisper with advanced configuration to prevent repetition loops
"""
import sys
import ssl
import whisper
import re
from typing import List, Tuple

# Fix SSL certificate issues on some systems
ssl._create_default_https_context = ssl._create_unverified_context

def detect_repetition(text: str, min_phrase_length: int = 10, max_repetitions: int = 3) -> bool:
    """
    Detect if text contains excessive repetition patterns
    Returns True if repetition detected, False otherwise
    """
    words = text.split()
    if len(words) < min_phrase_length * 2:
        return False
    
    # Check for repeating phrases
    for phrase_len in range(min_phrase_length, min(50, len(words) // 4)):
        for i in range(len(words) - phrase_len * max_repetitions):
            phrase = ' '.join(words[i:i + phrase_len])
            
            # Count how many times this phrase repeats immediately after
            repetition_count = 1
            pos = i + phrase_len
            
            while pos + phrase_len <= len(words):
                next_phrase = ' '.join(words[pos:pos + phrase_len])
                if phrase == next_phrase:
                    repetition_count += 1
                    pos += phrase_len
                else:
                    break
            
            if repetition_count >= max_repetitions:
                print(f"⚠️  Repetition detected: '{phrase[:50]}...' repeated {repetition_count} times", file=sys.stderr)
                return True
    
    return False

def clean_repetitions(text: str) -> str:
    """
    Remove obvious repetitive patterns from transcription
    """
    words = text.split()
    if len(words) < 20:
        return text
    
    cleaned_words = []
    skip_until = 0
    
    for i in range(len(words)):
        if i < skip_until:
            continue
            
        # Look ahead for repetitions
        found_repetition = False
        for phrase_len in range(5, min(30, len(words) - i)):
            if i + phrase_len * 2 > len(words):
                break
                
            phrase = words[i:i + phrase_len]
            next_phrase = words[i + phrase_len:i + phrase_len * 2]
            
            if phrase == next_phrase:
                # Found repetition, count how many times
                repetition_count = 2
                check_pos = i + phrase_len * 2
                
                while check_pos + phrase_len <= len(words):
                    check_phrase = words[check_pos:check_pos + phrase_len]
                    if phrase == check_phrase:
                        repetition_count += 1
                        check_pos += phrase_len
                    else:
                        break
                
                # Keep only one instance
                cleaned_words.extend(phrase)
                skip_until = check_pos
                found_repetition = True
                print(f"🧹 Removed {repetition_count - 1} repetitions of phrase (length {phrase_len})", file=sys.stderr)
                break
        
        if not found_repetition:
            cleaned_words.append(words[i])
    
    return ' '.join(cleaned_words)

def transcribe_audio(audio_path):
    """
    Transcribe audio using Whisper with anti-repetition measures.
    Uses 'base' model for good accuracy with anti-hallucination parameters.
    """
    try:
        print("Loading Whisper 'base' model for accurate transcription...")
        model = whisper.load_model("base")
        
        print(f"Transcribing {audio_path}...", file=sys.stderr)
        
        # CRITICAL: Use settings that prevent hallucination and repetition
        result = model.transcribe(
            audio_path,
            
            # Basic settings
            language="en",
            task="transcribe",
            fp16=False,
            verbose=False,
            
            # Anti-repetition settings
            temperature=0.0,  # Deterministic output, reduces randomness
            compression_ratio_threshold=2.4,  # Detect and reject highly repetitive outputs
            logprob_threshold=-1.0,  # Higher confidence requirement
            no_speech_threshold=0.6,  # Better silence detection
            condition_on_previous_text=False,  # CRITICAL: Prevents repetition loops
            
            # Timestamp settings for better segmentation
            word_timestamps=False,
            
            # Initial prompt to guide the model (helps with context)
            initial_prompt="This is a professional business meeting discussion with multiple speakers.",
            
            # Beam search for better quality
            beam_size=5,
            best_of=5,
            
            # Patience for better results
            patience=1.0
        )
        
        text = result["text"].strip()
        
        print(f"✅ Initial transcription complete: {len(text)} characters", file=sys.stderr)
        
        # Check for repetition patterns
        if detect_repetition(text):
            print("🔧 Cleaning detected repetitions...", file=sys.stderr)
            text = clean_repetitions(text)
            print(f"✅ Cleaned transcription: {len(text)} characters", file=sys.stderr)
        
        # Basic cleanup
        text = re.sub(r'\s+', ' ', text).strip()  # Normalize whitespace
        text = re.sub(r'\.{3,}', '...', text)  # Normalize ellipsis
        
        # Print final result to stdout
        print(text)
        return 0
        
    except Exception as e:
        print(f"❌ Error: {str(e)}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 transcribe.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
    
    audio_file = sys.argv[1]
    sys.exit(transcribe_audio(audio_file))
