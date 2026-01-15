import base64
import httpx
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import Response

router = APIRouter()


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
