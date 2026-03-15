import httpx
from fastapi import APIRouter
from typing import List

from timezonefinder import TimezoneFinder
tf = TimezoneFinder()

router = APIRouter(prefix="/geo", tags=["geolocation"])

@router.get("/suggest")
async def suggest_city(q: str):
    if len(q) < 2:
        return []
        
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": q,
        "format": "json",
        "limit": 5,
        "accept-language": "ru"
    }
    headers = {
        "User-Agent": "vlubvi-app/1.0 (contact@vlubvi.ru)"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code != 200:
            return []
            
        data = resp.json()
        results = []
        for item in data:
            lat = float(item["lat"])
            lon = float(item["lon"])
            tz = tf.timezone_at(lng=lon, lat=lat) or "UTC"
            
            # Use 'display_name' simplified
            name = item.get("display_name", "").split(",")[0:2]
            name = ", ".join(n.strip() for n in name)
            
            results.append({
                "name": name,
                "lat": lat,
                "lon": lon,
                "timezone": tz
            })
            
        return results
