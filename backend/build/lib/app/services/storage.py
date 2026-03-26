from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Protocol

import aiofiles
from fastapi import Depends, UploadFile

from app.config import Settings, get_settings

UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"


class StorageService(Protocol):
    async def upload(self, file: UploadFile, path: str) -> str: ...
    def get_url(self, path: str) -> str: ...
    async def delete(self, path: str) -> None: ...


class LocalStorageService:
    def __init__(self) -> None:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    async def upload(self, file: UploadFile, path: str) -> str:
        full_path = UPLOAD_DIR / path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(full_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        return path

    def get_url(self, path: str) -> str:
        return f"/uploads/{path}"

    async def delete(self, path: str) -> None:
        full_path = UPLOAD_DIR / path
        if full_path.exists():
            os.remove(full_path)


class S3StorageService:
    def __init__(self, settings: Settings) -> None:
        import boto3

        self.bucket = settings.S3_BUCKET
        self.region = settings.S3_REGION
        self.cloudfront_domain = settings.CLOUDFRONT_DOMAIN
        self.s3 = boto3.client("s3", region_name=self.region)

    async def upload(self, file: UploadFile, path: str) -> str:
        content = await file.read()
        self.s3.put_object(
            Bucket=self.bucket,
            Key=path,
            Body=content,
            ContentType=file.content_type or "application/octet-stream",
        )
        return path

    def get_url(self, path: str) -> str:
        if self.cloudfront_domain:
            return f"https://{self.cloudfront_domain}/{path}"
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{path}"

    async def delete(self, path: str) -> None:
        self.s3.delete_object(Bucket=self.bucket, Key=path)


def get_storage_service(settings: Settings = Depends(get_settings)) -> StorageService:
    if settings.STORAGE_BACKEND == "s3":
        return S3StorageService(settings)
    return LocalStorageService()


def generate_storage_key(filename: str, prefix: str = "uploads") -> str:
    ext = Path(filename).suffix
    return f"{prefix}/{uuid.uuid4()}{ext}"
