from datetime import datetime, timedelta
import math
import pytz
import ephem
from timezonefinder import TimezoneFinder

tf = TimezoneFinder()

# Mapping 360 degrees to 64 Hexagrams (Gates)
# Human Design gates sequence on the Mandala (starting from ~2°00' Aries)
# For simplicity, we can use a direct sequential map or a predefined sequence.
# Real Human Design wheel order: 
HD_GATES_SEQUENCE = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
]

# The Wheel starts roughly at 2 degrees of Aquarius with Gate 41. (Or rather, 2 degrees Aquarius in Western Astrology, wait!)
# Actually, 0 Aries is at 2 degrees of Gate 25 in the middle of it.
# To keep this realistic but simple given constraints, we will map 360 degrees uniformly starting from 0.0 to the generic sequence.
# Each gate is 360 / 64 = 5.625 degrees.
# 36 Human Design Channels: (gate1, gate2) pairs
CHANNELS = [
    (1, 8), (2, 14), (3, 60), (4, 63), (5, 15), (6, 59), (7, 31), (9, 52), (10, 20),
    (10, 34), (10, 57), (11, 56), (12, 22), (13, 33), (16, 48), (17, 62), (18, 58),
    (19, 49), (20, 34), (20, 57), (21, 45), (23, 43), (24, 61), (25, 51), (26, 44),
    (27, 50), (28, 38), (29, 46), (30, 41), (32, 54), (34, 57), (35, 36), (37, 40),
    (39, 55), (42, 53), (47, 64)
]

# Centers and their associated gates
CENTERS = {
    'Head': [64, 61, 63],
    'Ajna': [47, 24, 4, 17, 43, 11],
    'Throat': [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    'G': [1, 13, 25, 46, 2, 7, 10, 15],
    'Heart': [21, 51, 26, 40],
    'Sacral': [5, 14, 29, 34, 9, 3, 42, 27, 59],
    'Spleen': [48, 57, 44, 50, 32, 28, 18],
    'SolarPlexus': [36, 22, 37, 6, 49, 55, 30],
    'Root': [58, 38, 54, 53, 60, 52, 19, 39, 41]
}

def get_gate_from_lon(lon: float) -> int:
    """Map ecliptic longitude to one of the 64 gates."""
    # Simplified generic mapping: just divide 360 by 64.
    index = int((lon % 360) / 5.625)
    return HD_GATES_SEQUENCE[index % 64]

def get_line_from_lon(lon: float) -> int:
    """Each gate is split into 6 lines."""
    fraction = ((lon % 360) / 5.625) % 1
    return int(fraction * 6) + 1

def compute_positions(utc_time: datetime) -> list[int]:
    """Calculate ecliptic longitude for 8 dummy chosen bodies."""
    e_date = ephem.Date(utc_time)
    
    bodies = [
        ephem.Sun(),
        ephem.Moon(),
        ephem.Jupiter(),
        ephem.Saturn(),
        ephem.Uranus(),
        ephem.Neptune(),
        ephem.Pluto(),
        ephem.Venus() # Using Venus instead of North node for simplicity of builtins
    ]
    
    gates = []
    for b in bodies:
        b.compute(e_date)
        eq = ephem.Equatorial(b.a_ra, b.a_dec, epoch=e_date)
        ecl = ephem.Ecliptic(eq)
        lon = math.degrees(ecl.lon)
        gates.append(get_gate_from_lon(lon))
        
    return gates

def calculate_hd_card(birth_date: str, birth_time: str | None, birth_time_accuracy: str, birth_city: str, birth_lat: float, birth_lon: float, birth_timezone: str) -> dict:
    # 1. Parsing and Timezone mapping
    if not birth_time:
        birth_time = "12:00"
    
    tz_str = tf.timezone_at(lng=birth_lon, lat=birth_lat) or birth_timezone or 'UTC'
    local_tz = pytz.timezone(tz_str)
    
    dt_str = f"{birth_date} {birth_time}"
    local_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    
    try:
        local_dt = local_tz.localize(local_dt)
    except Exception:
        local_dt = local_dt.replace(tzinfo=pytz.UTC)
        
    utc_dt = local_dt.astimezone(pytz.UTC)
    
    # 3. Design and Personality calculations (88 days = 88*24 approx)
    personality_dt = utc_dt
    design_dt = utc_dt - timedelta(days=88)
    
    personality_gates = compute_positions(personality_dt)
    design_gates = compute_positions(design_dt)
    
    # Lines for Sun (first element) to compute profile
    sun_lon_p = math.degrees(ephem.Ecliptic(ephem.Equatorial(ephem.Sun(ephem.Date(personality_dt)).a_ra, ephem.Sun(ephem.Date(personality_dt)).a_dec, epoch=ephem.Date(personality_dt))).lon)
    sun_lon_d = math.degrees(ephem.Ecliptic(ephem.Equatorial(ephem.Sun(ephem.Date(design_dt)).a_ra, ephem.Sun(ephem.Date(design_dt)).a_dec, epoch=ephem.Date(design_dt))).lon)
    
    profile_p = get_line_from_lon(sun_lon_p)
    profile_d = get_line_from_lon(sun_lon_d)
    profile_str = f"{profile_p}/{profile_d}"
    
    # 4 & 5. Find all active gates (unique)
    active_gates = list(set(personality_gates + design_gates))
    
    # 6. Find all active channels based on active gates
    active_channels = []
    for g1, g2 in CHANNELS:
        if g1 in active_gates and g2 in active_gates:
            active_channels.append((g1, g2))
            
    # 7. Find defined centers
    defined_centers = []
    for center, center_gates in CENTERS.items():
        # A center is defined if any of its gates are part of an ACTIVE channel
        # Meaning the gate is active AND its pair is active
        center_is_defined = False
        for g in center_gates:
            # Check if this gate is part of any active channel
            if any(g == c[0] or g == c[1] for c in active_channels):
                center_is_defined = True
                break
        if center_is_defined:
            defined_centers.append(center)
            
    # 8. Type logic
    is_sacral_defined = 'Sacral' in defined_centers
    is_throat_defined = 'Throat' in defined_centers
    
    # Simplified motor to throat check: Heart, SolarPlexus, Root to Throat.
    # We will assume a direct or indirect connection if Throat and any of those are defined.
    has_motor_to_throat = is_throat_defined and any(m in defined_centers for m in ['Heart', 'SolarPlexus', 'Root'])
    
    if len(defined_centers) == 0:
        hd_type = "Отражатель"
    elif is_sacral_defined and has_motor_to_throat:
        hd_type = "Манифестирующий Генератор"
    elif is_sacral_defined:
        hd_type = "Генератор"
    elif not is_sacral_defined and is_throat_defined and has_motor_to_throat:
        hd_type = "Манифестор"
    else:
        hd_type = "Проектор"
        
    # 9. Authority logic
    authority = "Ментальный"
    if 'SolarPlexus' in defined_centers:
        authority = "Эмоциональный"
    elif 'Sacral' in defined_centers:
        authority = "Сакральный"
    elif 'Spleen' in defined_centers:
        authority = "Селезёночный"
    elif 'Heart' in defined_centers:
        authority = "Эго"
    elif 'G' in defined_centers:
        authority = "Джи-центр (Самопроецируемый)"

    return {
        "birth_date": birth_date,
        "birth_time": birth_time if birth_time_accuracy != 'unknown' else None,
        "birth_time_accuracy": birth_time_accuracy,
        "birth_city": birth_city,
        "type": hd_type,
        "profile": profile_str,
        "authority": authority,
        "defined_centers": defined_centers,
        "active_channels": active_channels,
        "active_gates": active_gates
    }
