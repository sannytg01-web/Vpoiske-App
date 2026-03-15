import math
from typing import Dict, List, Any

# Types of Human Design
HD_TYPES = ["Генератор", "Манифестирующий Генератор", "Манифестор", "Проектор", "Отражатель"]

def get_hd_type_compatibility(type_a: str, type_b: str) -> int:
    # Normalize types for comparison (MG treats mostly like Generator here based on rules)
    t_a = "Генератор" if type_a == "Манифестирующий Генератор" else type_a
    t_b = "Генератор" if type_b == "Манифестирующий Генератор" else type_b

    pair = tuple(sorted([t_a, t_b]))
    
    if "Отражатель" in pair:
        return 60
    if pair == ("Генератор", "Проектор"):
        return 90
    if pair == ("Манифестор", "Проектор"):
        return 80
    if pair == ("Генератор", "Манифестор"):
        return 75
    if pair == ("Генератор", "Генератор"):
        return 70
        
    return 50 # Base for others

def calculate_score(hd_a: dict, psych_a: dict, hd_b: dict, psych_b: dict) -> dict:
    # 1. HD Score (40%)
    hd_base_score = get_hd_type_compatibility(hd_a.get("type", ""), hd_b.get("type", ""))
    
    # Electromagnetic channels: A gate + B gate forms a channel
    active_gates_a = set(hd_a.get("active_gates", []))
    active_gates_b = set(hd_b.get("active_gates", []))
    active_channels_a = set(tuple(sorted(c)) for c in hd_a.get("active_channels", []))
    active_channels_b = set(tuple(sorted(c)) for c in hd_b.get("active_channels", []))
    
    # All HD 36 Channels definition
    ALL_CHANNELS = [
        (1, 8), (2, 14), (3, 60), (4, 63), (5, 15), (6, 59), (7, 31), (9, 52), (10, 20),
        (10, 34), (10, 57), (11, 56), (12, 22), (13, 33), (16, 48), (17, 62), (18, 58),
        (19, 49), (20, 34), (20, 57), (21, 45), (23, 43), (24, 61), (25, 51), (26, 44),
        (27, 50), (28, 38), (29, 46), (30, 41), (32, 54), (34, 57), (35, 36), (37, 40),
        (39, 55), (42, 53), (47, 64)
    ]
    
    em_bonus = 0
    shared_channels_count = 0
    for g1, g2 in ALL_CHANNELS:
        # Check electromagnetic
        if (g1 in active_gates_a and g2 in active_gates_b and g1 not in active_gates_b and g2 not in active_gates_a) or \
           (g2 in active_gates_a and g1 in active_gates_b and g2 not in active_gates_b and g1 not in active_gates_a):
            em_bonus += 15
            
    shared_channels = active_channels_a.intersection(active_channels_b)
    shared_channels_count = len(shared_channels)
    
    channel_bonus = min(shared_channels_count * 5, 20)
    if shared_channels_count > 2:
        channel_bonus += 10
        
    total_hd_score = min(hd_base_score + em_bonus + channel_bonus, 100)
    
    # 2. Psychology Score (40%)
    # Default base
    psych_base_score = 50
    
    attach_a = psych_a.get("attachment_style", "secure")
    attach_b = psych_b.get("attachment_style", "secure")
    attach_pair = tuple(sorted([attach_a, attach_b]))
    attach_bonus = 0
    if attach_pair == ("secure", "secure"):
        attach_bonus = 20
    elif attach_pair == ("anxious", "secure"):
        attach_bonus = 10
    elif attach_pair == ("avoidant", "secure"):
        attach_bonus = 10
    elif attach_pair == ("anxious", "anxious"):
        attach_bonus = -15
    elif attach_pair == ("avoidant", "avoidant"):
        attach_bonus = -10
    elif attach_pair == ("anxious", "avoidant"):
        attach_bonus = -20
        
    neuro_a = psych_a.get("ocean", {}).get("neuroticism", 0.5)
    neuro_b = psych_b.get("ocean", {}).get("neuroticism", 0.5)
    neuro_diff = abs(neuro_a - neuro_b)
    neuro_bonus = 5 if neuro_diff < 0.3 else (-10 if neuro_diff > 0.6 else 0)
    
    extra_a = psych_a.get("ocean", {}).get("extraversion", 0.5)
    extra_b = psych_b.get("ocean", {}).get("extraversion", 0.5)
    extra_bonus = 5 if abs(extra_a - extra_b) < 0.2 else 0
    
    # Conflict styles
    conf_a = psych_a.get("conflict_resolution", "")
    conf_b = psych_b.get("conflict_resolution", "")
    conf_bonus = 0
    if conf_a == "healthy_boundary" or conf_b == "healthy_boundary":
        conf_bonus += 10
    if tuple(sorted([conf_a, conf_b])) == tuple(sorted(["avoidance", "merger"])):
         conf_bonus -= 15

    total_psych_score = min(max(psych_base_score + attach_bonus + neuro_bonus + extra_bonus + conf_bonus, 0), 100)

    # 3. Values Score (20%)
    values_a = set(psych_a.get("top_values", []))
    values_b = set(psych_b.get("top_values", []))
    shared_values = values_a.intersection(values_b)
    
    values_base = min((len(shared_values) / 5.0) * 100, 100)
    if len(shared_values) >= 3:
        values_base = min(values_base + 15, 100)
        
    total_values_score = min(values_base, 100)
    
    # 4. Final Score
    final_score = (total_hd_score * 0.4) + (total_psych_score * 0.4) + (total_values_score * 0.2)
    final_score = min(max(round(final_score), 0), 100)
    
    return {
        "score": final_score,
        "hd_score": round(total_hd_score),
        "psychology_score": round(total_psych_score),
        "values_score": round(total_values_score),
        "details": {
            "hd": {"compatibility_base": hd_base_score, "em_bonus": em_bonus, "channel_bonus": channel_bonus},
            "psych": {"attachment": attach_bonus, "neuro_diff": neuro_bonus, "extra_diff": extra_bonus, "conflict": conf_bonus},
            "values": {"shared_count": len(shared_values)}
        }
    }

import uuid
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from app.models.models import User, PsychologicalProfile, HdCard, Match

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
        user_hd = HdCard(user_id=user_id, type="Генератор", active_gates=[], active_channels=[])
        db.add(user_hd)
        await db.flush()

    # 2. PGVector Query: Find top 10 closest psychological profiles 
    # using L2 distance or Cosine distance (<=> is cosine distance in pgvector)
    stmt_others = select(PsychologicalProfile).where(
        PsychologicalProfile.user_id != user_id,
        PsychologicalProfile.embedding.is_not(None)
    ).order_by(
        PsychologicalProfile.embedding.cosine_distance(user_psych.embedding)
    ).limit(10)
    
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
            other_hd = HdCard(user_id=other_psych.user_id, type="Проектор", active_gates=[], active_channels=[])
            db.add(other_hd)
            await db.flush()

        # Build dict arguments for calculate_score
        dict_hd_a = {"type": user_hd.type, "active_gates": user_hd.active_gates or [], "active_channels": user_hd.active_channels or []}
        dict_psych_a = {
            "attachment_style": user_psych.attachment_style or "secure", 
            "ocean": {
                "neuroticism": user_psych.neuroticism or 0.5,
                "extraversion": user_psych.extraversion or 0.5
            },
            "conflict_resolution": user_psych.conflict_style or "healthy_boundary",
            "top_values": user_psych.top_values or []
        }
        
        dict_hd_b = {"type": other_hd.type, "active_gates": other_hd.active_gates or [], "active_channels": other_hd.active_channels or []}
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
        
        # Insert Match
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
