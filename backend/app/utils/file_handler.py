import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".mp4", ".m4a", ".ogg", ".webm", ".txt"}
MAX_SIZE_MB = 50


def validate_audio_file(file: UploadFile) -> None:
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_SIZE_MB}MB",
        )


async def save_upload(file: UploadFile, upload_dir: str) -> str:
    ext = Path(file.filename).suffix.lower() if file.filename else ".webm"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, "audio", filename)

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return file_path
