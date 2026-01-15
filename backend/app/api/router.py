from fastapi import APIRouter

from app.api import health, search, lyrics, image_proxy

router = APIRouter(prefix="/api")

router.include_router(health.router, tags=["Health"])
router.include_router(search.router, prefix="/search", tags=["Search"])
router.include_router(lyrics.router, prefix="/lyrics", tags=["Lyrics"])
router.include_router(image_proxy.router, prefix="/image", tags=["Image"])
