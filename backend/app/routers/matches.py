import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException

from app.database import get_db
from app.models.models import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/matches", tags=["matches"])

# Mock Database for Matches Demo
MOCK_MATCHES = [
    {
        "id": "1",
        "name": "Аня",
        "age": 24,
        "city": "Москва",
        "score": 92,
        "hd_type": "Манифестирующий Генератор",
        "photo": None,
        "locked": False,
        "details": {
            "hd_score": 95,
            "psychology_score": 90,
            "values_score": 88,
            "hd": {"compatibility_base": 90, "em_bonus": 15, "channel_bonus": 5},
            "psych": {"attachment": 20, "neuro_diff": 5, "extra_diff": 5, "conflict": 10},
            "values": {"shared_values": ["Свобода", "Любовь", "Развитие"]}
        }
    },
    {
        "id": "2",
        "name": "Лера",
        "age": 22,
        "city": "Санкт-Петербург",
        "score": 85,
        "hd_type": "Проектор",
        "photo": None,
        "locked": False,
        "details": {
            "hd_score": 80,
            "psychology_score": 85,
            "values_score": 90,
            "hd": {"compatibility_base": 80, "em_bonus": 0, "channel_bonus": 20},
            "psych": {"attachment": 10, "neuro_diff": 5, "extra_diff": 0, "conflict": 10},
            "values": {"shared_values": ["Честность", "Деньги"]}
        }
    },
    {
        "id": "3",
        "name": "Даша",
        "age": 25,
        "city": "Казань",
        "score": 81,
        "hd_type": "Манифестор",
        "photo": None,
        "locked": False,
        "details": {
            "hd_score": 75,
            "psychology_score": 82,
            "values_score": 85,
            "hd": {"compatibility_base": 75, "em_bonus": 15, "channel_bonus": 0},
            "psych": {"attachment": 10, "neuro_diff": -10, "extra_diff": 0, "conflict": 0},
            "values": {"shared_values": ["Творчество", "Приключения"]}
        }
    },
    {
        "id": "4",
        "name": "Света",
        "age": 21,
        "city": "Екатеринбург",
        "score": 79,
        "hd_type": "Генератор",
        "photo": None,
        "locked": True, # For Non-Premium test
        "details": {
            "hd_score": 70,
            "psychology_score": 80,
            "values_score": 85,
            "hd": {"compatibility_base": 70, "em_bonus": 0, "channel_bonus": 10},
            "psych": {"attachment": 20, "neuro_diff": 5, "extra_diff": 0, "conflict": 10},
            "values": {"shared_values": ["Обучение", "Здоровье"]}
        }
    },
    {
        "id": "5",
        "name": "Маша",
        "age": 26,
        "city": "Москва",
        "score": 75,
        "hd_type": "Отражатель",
        "photo": None,
        "locked": True,
        "details": {"hd_score": 60, "psychology_score": 85, "values_score": 80, "hd":{}, "psych":{}, "values":{}}
    }
]

@router.get("")
async def list_matches(
    tab: str = Query("all", description="all, mutual, new"),
    user: User = Depends(get_current_user)
):
    # Depending on tab, we could filter matches.
    # In a real app we query Match objects where user_a_id = user.id or user_b_id = user.id
    
    is_premium = user.is_premium
    # Apply lock logic for free users (> 3 matches)
    for i, m in enumerate(MOCK_MATCHES):
        if not is_premium and i >= 3:
            m["locked"] = True
        else:
            m["locked"] = False
            
    return MOCK_MATCHES

@router.get("/{match_id}")
async def get_match_detail(
    match_id: str,
    user: User = Depends(get_current_user)
):
    for m in MOCK_MATCHES:
        if m["id"] == match_id:
            # Check premium rules
            is_premium = user.is_premium
            if m.get("locked") and not is_premium:
                 raise HTTPException(status_code=403, detail="Unlock premium to view this match details.")
            return m
            
    raise HTTPException(status_code=404, detail="Match not found")

@router.post("/{match_id}/start")
async def start_chat(
    match_id: str,
    user: User = Depends(get_current_user)
):
    if not user.is_premium:
        raise HTTPException(status_code=402, detail="Payment Required")
        
    chat_id = str(uuid.uuid4())
    return {"status": "started", "chat_id": chat_id}

@router.post("/{match_id}/skip")
async def skip_match(
    match_id: str,
    user: User = Depends(get_current_user)
):
    return {"status": "skipped"}
