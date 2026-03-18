import math
import uuid
import random
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from app.models.models import User, PsychologicalProfile, HdCard, Match

# Types of Human Design
HD_TYPES = ["Генератор", "Манифестирующий Генератор", "Манифестор", "Проектор", "Отражатель"]

def get_hd_type_compatibility(type_a: str, type_b: str) -> int:
    # Normalize types for comparison (MG treats mostly like Generator here based on rules)
    t_a = "Генератор" if type_a == "Манифестирующий Генератор" else type_a
    t_b = "Генератор" if type_b == "Манифестирующий Генератор" else type_b

    pair = tuple(sorted([t_a, t_b]))
    
    if "Отражатель" in pair: return 60
    if pair == ("Генератор", "Проектор"): return 90
    if pair == ("Манифестор", "Проектор"): return 80
    if pair == ("Генератор", "Манифестор"): return 75
    if pair == ("Генератор", "Генератор"): return 70
        
    return 50 # Base for others

# Base profile compatibilities
PROFILE_COMPATIBILITY = {
    "1/3": ["1/3", "3/5", "3/6", "4/6"],
    "1/4": ["1/4", "2/4", "4/6"],
    "2/4": ["2/4", "5/1", "2/5"],
    "2/5": ["2/5", "2/4", "5/1", "5/2"],
    "3/5": ["3/5", "1/3", "3/6", "5/1", "5/2"],
    "3/6": ["3/6", "1/3", "3/5", "6/2", "6/3"],
    "4/1": ["4/1", "1/4", "4/6"],
    "4/6": ["4/6", "1/4", "4/1", "6/2", "6/3", "1/3"],
    "5/1": ["5/1", "2/4", "2/5", "5/2", "1/4"],
    "5/2": ["5/2", "2/5", "2/4", "5/1"],
    "6/2": ["6/2", "3/6", "4/6", "6/3", "2/4"],
    "6/3": ["6/3", "3/6", "4/6", "6/2", "1/3"],
}

ALL_CHANNELS = [
    (1, 8), (2, 14), (3, 60), (4, 63), (5, 15), (6, 59), (7, 31), (9, 52), (10, 20),
    (10, 34), (10, 57), (11, 56), (12, 22), (13, 33), (16, 48), (17, 62), (18, 58),
    (19, 49), (20, 34), (20, 57), (21, 45), (23, 43), (24, 61), (25, 51), (26, 44),
    (27, 50), (28, 38), (29, 46), (30, 41), (32, 54), (34, 57), (35, 36), (37, 40),
    (39, 55), (42, 53), (47, 64)
]

ALL_CENTERS = ["head", "ajna", "throat", "g", "heart", "sacral", "solar", "spleen", "root"]

def calculate_score(hd_a: dict, psych_a: dict, hd_b: dict, psych_b: dict) -> dict:
    # 1. HD Score (50%)
    hd_base_score = get_hd_type_compatibility(hd_a.get("type", ""), hd_b.get("type", ""))
    
    # Profile Line Compatibility
    prof_a = hd_a.get("profile_line") or "1/3"
    prof_b = hd_b.get("profile_line") or "1/3"
    prof_bonus = 15 if prof_b in PROFILE_COMPATIBILITY.get(prof_a, []) else 0

    # Centers Attraction (Electromagnetic)
    c_a_raw = hd_a.get("defined_centers") or {}
    c_b_raw = hd_b.get("defined_centers") or {}
    centers_a = set(c_a_raw.keys() if isinstance(c_a_raw, dict) else c_a_raw)
    centers_b = set(c_b_raw.keys() if isinstance(c_b_raw, dict) else c_b_raw)
    centers_bonus = 0
    # Add bonus if one is defined and other is undefined (Electromagnetic attraction)
    for c in ALL_CENTERS:
        if (c in centers_a and c not in centers_b) or (c in centers_b and c not in centers_a):
            centers_bonus += 3
            
    active_gates_a = set(hd_a.get("active_gates", []))
    active_gates_b = set(hd_b.get("active_gates", []))
    active_channels_a = set(tuple(sorted(c)) for c in hd_a.get("active_channels", []))
    active_channels_b = set(tuple(sorted(c)) for c in hd_b.get("active_channels", []))
    
    em_bonus = 0
    for g1, g2 in ALL_CHANNELS:
        # Check electromagnetic channels
        if (g1 in active_gates_a and g2 in active_gates_b and g1 not in active_gates_b and g2 not in active_gates_a) or \
           (g2 in active_gates_a and g1 in active_gates_b and g2 not in active_gates_b and g1 not in active_gates_a):
            em_bonus += 10
            
    shared_channels_count = len(active_channels_a.intersection(active_channels_b))
    channel_bonus = min(shared_channels_count * 5, 15)
        
    total_hd_score = min(hd_base_score + prof_bonus + centers_bonus + em_bonus + channel_bonus, 100)
    
    # 2. Psychology Score (30%)
    psych_base_score = 50
    attach_a = psych_a.get("attachment_style", "secure")
    attach_b = psych_b.get("attachment_style", "secure")
    attach_pair = tuple(sorted([attach_a, attach_b]))
    attach_bonus = 0
    if attach_pair == ("secure", "secure"): attach_bonus = 25
    elif attach_pair == ("anxious", "secure") or attach_pair == ("avoidant", "secure"): attach_bonus = 15
    elif attach_pair == ("anxious", "anxious"): attach_bonus = -15
    elif attach_pair == ("avoidant", "avoidant"): attach_bonus = -10
    elif attach_pair == ("anxious", "avoidant"): attach_bonus = -25
        
    neuro_diff = abs((psych_a.get("ocean") or {}).get("neuroticism", 0.5) - (psych_b.get("ocean") or {}).get("neuroticism", 0.5))
    neuro_bonus = 5 if neuro_diff < 0.3 else (-10 if neuro_diff > 0.6 else 0)
    
    extra_diff = abs((psych_a.get("ocean") or {}).get("extraversion", 0.5) - (psych_b.get("ocean") or {}).get("extraversion", 0.5))
    extra_bonus = 5 if extra_diff < 0.2 else (-5 if extra_diff > 0.6 else 0)
    
    conf_a = psych_a.get("conflict_resolution", "")
    conf_b = psych_b.get("conflict_resolution", "")
    conf_bonus = 10 if (conf_a == "healthy_boundary" or conf_b == "healthy_boundary") else 0
    if tuple(sorted([conf_a, conf_b])) == tuple(sorted(["avoidance", "merger"])):
         conf_bonus -= 15

    total_psych_score = min(max(psych_base_score + attach_bonus + neuro_bonus + extra_bonus + conf_bonus, 0), 100)

    # 3. Values Score (20%)
    values_a = set(psych_a.get("top_values", []) if psych_a.get("top_values") else [])
    values_b = set(psych_b.get("top_values", []) if psych_b.get("top_values") else [])
    shared_values = values_a.intersection(values_b)
    
    values_base = min((len(shared_values) / 5.0) * 100, 100)
    if len(shared_values) >= 3:
        values_base = min(values_base + 20, 100)
        
    total_values_score = min(values_base, 100)
    
    # 4. Final Score (HD 50%, Psych 30%, Values 20%)
    final_score = (total_hd_score * 0.5) + (total_psych_score * 0.3) + (total_values_score * 0.2)
    final_score = min(max(round(final_score), 0), 100)
    
    return {
        "score": final_score,
        "hd_score": round(total_hd_score),
        "psychology_score": round(total_psych_score),
        "values_score": round(total_values_score),
        "details": {
            "hd": {"compatibility_base": hd_base_score, "prof_bonus": prof_bonus, "centers_bonus": centers_bonus, "em_bonus": em_bonus, "channel_bonus": channel_bonus},
            "psych": {"attachment": attach_bonus, "neuro_diff": neuro_bonus, "extra_diff": extra_bonus, "conflict": conf_bonus},
            "values": {"shared_count": len(shared_values)}
        }
    }


def get_dummy_vector():
    # 384-dimensional vector like all-MiniLM-L6-v2
    return [random.gauss(0, 1) for _ in range(384)]

async def run_matching_for_user(user_id: uuid.UUID, db: AsyncSession):
    # 1. Fetch user's psych profile and hd card
    stmt_p = select(PsychologicalProfile).where(PsychologicalProfile.user_id == user_id)
    user_psych = await db.scalar(stmt_p)
    
    stmt_h = select(HdCard).where(HdCard.user_id == user_id)
    user_hd = await db.scalar(stmt_h)

    # 1.1 Mocks if not exist for testing purposes
    if not user_psych:
        user_psych = PsychologicalProfile(user_id=user_id, top_values=["Свобода", "Развитие"], embedding=get_dummy_vector())
        db.add(user_psych)
        await db.flush()
    if not user_psych.embedding:
        user_psych.embedding = get_dummy_vector()
        await db.flush()
        
    if not user_hd:
        user_hd = HdCard(user_id=user_id, hd_type="Генератор", active_gates=[], active_channels=[])
        db.add(user_hd)
        await db.flush()

    # 2. PGVector Query: Find top 100 closest psychological profiles 
    # using L2 distance or Cosine distance (<=> is cosine distance in pgvector)
    # We load 100 to find best HD matches among semantic clones
    stmt_others = select(PsychologicalProfile).where(
        PsychologicalProfile.user_id != user_id,
        PsychologicalProfile.embedding.is_not(None)
    ).order_by(
        PsychologicalProfile.embedding.cosine_distance(user_psych.embedding)
    ).limit(100)
    
    closest_profiles = await db.scalars(stmt_others)
    
    # 3. For each closest profile, calculate detailed score and create Match
    for other_psych in closest_profiles:
        # Check if match already exists
        stmt_exists = select(Match).where(
            or_(
                and_(Match.user_a == user_id, Match.user_b == other_psych.user_id),
                and_(Match.user_a == other_psych.user_id, Match.user_b == user_id)
            )
        )
        existing = await db.scalar(stmt_exists)
        if existing:
            continue
            
        # Get their HD Card
        stmt_other_h = select(HdCard).where(HdCard.user_id == other_psych.user_id)
        other_hd = await db.scalar(stmt_other_h)
        
        # Mocks if not exist
        if not other_hd:
            other_hd = HdCard(user_id=other_psych.user_id, hd_type="Проектор", active_gates=[], active_channels=[])
            db.add(other_hd)
            await db.flush()

        # Build dict arguments for calculate_score
        dict_hd_a = {
            "type": user_hd.hd_type or "Генератор", 
            "profile_line": user_hd.profile_line or "1/3",
            "defined_centers": user_hd.defined_centers or {},
            "active_gates": user_hd.active_gates or [], 
            "active_channels": user_hd.active_channels or []
        }
        dict_psych_a = {
            "attachment_style": user_psych.attachment_style or "secure", 
            "ocean": {
                "neuroticism": user_psych.neuroticism or 0.5,
                "extraversion": user_psych.extraversion or 0.5
            },
            "conflict_resolution": user_psych.conflict_style or "healthy_boundary",
            "top_values": user_psych.top_values or []
        }
        
        dict_hd_b = {
            "type": other_hd.hd_type or "Генератор", 
            "profile_line": other_hd.profile_line or "1/3",
            "defined_centers": other_hd.defined_centers or {},
            "active_gates": other_hd.active_gates or [], 
            "active_channels": other_hd.active_channels or []
        }
        dict_psych_b = {
            "attachment_style": other_psych.attachment_style or "secure", 
            "ocean": {
                "neuroticism": other_psych.neuroticism or 0.5,
                "extraversion": other_psych.extraversion or 0.5
            },
            "conflict_resolution": other_psych.conflict_style or "healthy_boundary",
            "top_values": other_psych.top_values or []
        }

        # Calculate semantic-hd combined score!
        score_data = calculate_score(dict_hd_a, dict_psych_a, dict_hd_b, dict_psych_b)
        
        # Only create a match if compatibility is somewhat reasonable or we are just testing
        if score_data["score"] > 40:
            new_match = Match(
                user_a=user_id,
                user_b=other_psych.user_id,
                compatibility_score=score_data["score"],
                hd_score=score_data["hd_score"],
                psychology_score=score_data["psychology_score"],
                values_score=score_data["values_score"],
                breakdown=score_data["details"],
                status="pending"
            )
            db.add(new_match)
        
    await db.commit()
