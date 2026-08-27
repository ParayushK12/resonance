import io
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
import torch
import torchaudio as ta

# Load .env from tts-server or project root
root_env_path = Path(__file__).resolve().parent.parent / ".env"
local_env_path = Path(__file__).resolve().parent / ".env"

if local_env_path.exists():
    load_dotenv(local_env_path)
elif root_env_path.exists():
    load_dotenv(root_env_path)

from r2_storage import get_voice_file

# Global model reference
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    from chatterbox.tts_turbo import ChatterboxTurboTTS

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[TTS Server] Starting up... Using device: {device.upper()}")
    if device == "cuda":
        print(f"[TTS Server] GPU: {torch.cuda.get_device_name(0)}")

    try:
        model = ChatterboxTurboTTS.from_pretrained(device=device)
        print("[TTS Server] ChatterboxTurboTTS model loaded successfully!")
    except Exception as e:
        print(f"[TTS Server] Error loading model: {e}", file=sys.stderr)
        raise e

    yield
    print("[TTS Server] Shutting down...")

app = FastAPI(
    title="Chatterbox TTS API",
    description="Text-to-speech with voice cloning (Local Server)",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_scheme = APIKeyHeader(
    name="x-api-key",
    scheme_name="ApiKeyAuth",
    auto_error=False,
)

def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
    expected = os.environ.get("CHATTERBOX_API_KEY", "")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

class TTSRequest(BaseModel):
    """Request model for text-to-speech generation."""
    prompt: str = Field(..., min_length=1, max_length=5000)
    voice_key: str = Field(..., min_length=1, max_length=300)
    temperature: float = Field(default=0.8, ge=0.0, le=2.0)
    top_p: float = Field(default=0.95, ge=0.0, le=1.0)
    top_k: int = Field(default=1000, ge=1, le=10000)
    repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
    norm_loudness: bool = Field(default=True)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "model_loaded": model is not None,
    }

@app.post(
    "/generate",
    responses={
        200: {
            "content": {
                "application/json": {},
                "audio/wav": {},
            },
            "description": "Successful Response",
        }
    },
    dependencies=[Depends(verify_api_key)],
)
def generate_speech(request: TTSRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is still initializing")

    try:
        voice_path = get_voice_file(request.voice_key)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch voice: {e}")

    try:
        wav = model.generate(
            request.prompt,
            audio_prompt_path=str(voice_path),
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            norm_loudness=request.norm_loudness,
        )

        buffer = io.BytesIO()
        ta.save(buffer, wav, model.sr, format="wav")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=generated.wav"
            }
        )
    except Exception as e:
        print(f"[TTS Server] Generation failed: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {e}")

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=False)

