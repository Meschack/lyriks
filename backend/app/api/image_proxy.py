import base64
import httpx
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()

# Valid image MIME types
VALID_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
}


class ImageValidationResponse(BaseModel):
    valid: bool
    content_type: str | None = None
    error: str | None = None


@router.get("")
async def proxy_image(url: str = Query(..., description="Image URL to proxy")):
    """
    Proxy an external image and return it with proper CORS headers.
    Also supports returning as base64 data URI.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "image/jpeg")

            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Access-Control-Allow-Origin": "*",
                },
            )

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch image: {str(e)}")


@router.get("/base64")
async def proxy_image_base64(url: str = Query(..., description="Image URL to proxy")):
    """
    Proxy an external image and return it as a base64 data URI.
    Useful for html-to-image export.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "image/jpeg")
            b64_data = base64.b64encode(response.content).decode("utf-8")
            data_uri = f"data:{content_type};base64,{b64_data}"

            return {"data_uri": data_uri}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch image: {str(e)}")


@router.get("/validate", response_model=ImageValidationResponse)
async def validate_image_url(url: str = Query(..., description="Image URL to validate")):
    """
    Validate that a URL points to a valid image.
    Uses HEAD request to check Content-Type without downloading the full image.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # First try HEAD request (faster, no download)
            try:
                response = await client.head(url, follow_redirects=True)
                response.raise_for_status()
            except (httpx.HTTPError, httpx.RequestError):
                # Some servers don't support HEAD, fall back to GET with stream
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            # Extract base MIME type (remove charset, etc.)
            base_content_type = content_type.split(";")[0].strip().lower()

            if base_content_type in VALID_IMAGE_TYPES:
                return ImageValidationResponse(
                    valid=True,
                    content_type=base_content_type,
                )
            else:
                return ImageValidationResponse(
                    valid=False,
                    content_type=base_content_type if base_content_type else None,
                    error=f"URL does not point to a valid image (got {base_content_type or 'unknown type'})",
                )

    except httpx.TimeoutException:
        return ImageValidationResponse(
            valid=False,
            error="Request timed out",
        )
    except httpx.HTTPStatusError as e:
        return ImageValidationResponse(
            valid=False,
            error=f"HTTP error {e.response.status_code}",
        )
    except httpx.RequestError as e:
        return ImageValidationResponse(
            valid=False,
            error=f"Failed to reach URL: {str(e)}",
        )
