import os
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load .env from tts-server or project root
root_env_path = Path(__file__).resolve().parent.parent / ".env"
local_env_path = Path(__file__).resolve().parent / ".env"

if local_env_path.exists():
    load_dotenv(local_env_path)
elif root_env_path.exists():
    load_dotenv(root_env_path)

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "resonance-app")

CACHE_DIR = Path(__file__).resolve().parent / ".cache" / "voices"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

_s3_client = None

def get_s3_client():
    global _s3_client
    if _s3_client is None:
        if not R2_ACCOUNT_ID or not R2_ACCESS_KEY_ID or not R2_SECRET_ACCESS_KEY:
            raise ValueError("R2 environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are required")
        
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            region_name="auto",
        )
    return _s3_client

def get_voice_file(voice_key: str) -> Path:
    """
    Downloads voice audio from Cloudflare R2 if not already in local cache.
    Returns the local Path to the audio file.
    """
    # Normalize key to safe local path
    safe_key = voice_key.replace("\\", "/").lstrip("/")
    local_path = CACHE_DIR / safe_key

    if local_path.exists() and local_path.stat().st_size > 0:
        return local_path

    # Ensure parent folder exists
    local_path.parent.mkdir(parents=True, exist_ok=True)

    s3 = get_s3_client()
    try:
        s3.download_file(R2_BUCKET_NAME, safe_key, str(local_path))
        return local_path
    except ClientError as e:
        if local_path.exists():
            local_path.unlink()
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        raise FileNotFoundError(f"Voice '{voice_key}' not found in R2 bucket '{R2_BUCKET_NAME}' ({error_code})") from e
    except Exception as e:
        if local_path.exists():
            local_path.unlink()
        raise RuntimeError(f"Failed to download voice '{voice_key}' from R2: {e}") from e
