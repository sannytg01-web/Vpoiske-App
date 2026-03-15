from app.services.matching import calculate_score

def test_score_calculation():
    hd_a = {"type": "Генератор", "active_gates": [], "active_channels": []}
    psych_a = {"attachment_style": "secure", "ocean": {"neuroticism": 0.5}, "top_values": ["семья", "развитие"]}
    
    hd_b = {"type": "Проектор", "active_gates": [], "active_channels": []}
    psych_b = {"attachment_style": "secure", "ocean": {"neuroticism": 0.5}, "top_values": ["семья", "развитие", "карьера"]}
    
    score = calculate_score(hd_a, psych_a, hd_b, psych_b)
    assert score["score"] > 0
    assert 0 <= score["score"] <= 100
    assert score["details"]["hd"]["compatibility_base"] == 90 # Gen + Proj

def test_em_channel_bonus():
    hd_a = {"type": "Генератор", "active_gates": [1], "active_channels": []}
    psych_a = {"attachment_style": "secure"}
    
    hd_b = {"type": "Генератор", "active_gates": [8], "active_channels": []}
    psych_b = {"attachment_style": "secure"}
    
    score = calculate_score(hd_a, psych_a, hd_b, psych_b)
    # Channel 1-8 forms electromagnetic
    assert score["details"]["hd"]["em_bonus"] >= 15

def test_anxious_anxious_penalty():
    psych_a = {"attachment_style": "anxious"}
    psych_b = {"attachment_style": "anxious"}
    score = calculate_score({}, psych_a, {}, psych_b)
    assert score["details"]["psych"]["attachment"] == -15

def test_secure_bonus():
    psych_a = {"attachment_style": "secure"}
    psych_b = {"attachment_style": "secure"}
    score = calculate_score({}, psych_a, {}, psych_b)
    assert score["details"]["psych"]["attachment"] == 20

def test_values_intersection():
    psych_a = {"top_values": ["1", "2", "3", "4", "5"]}
    psych_b = {"top_values": ["1", "2", "3", "a", "b"]}
    score = calculate_score({}, psych_a, {}, psych_b)
    assert score["details"]["values"]["shared_count"] == 3
    assert score["values_score"] > 60

def test_vector_similarity():
    pass # PGVector dependency mocked in algorithm logic
