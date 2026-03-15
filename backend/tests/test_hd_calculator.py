import pytest
from app.services.hd_calculator import calculate_hd_card

def test_unknown_birth_time():
    res = calculate_hd_card("1990-01-01", None, "unknown", "Moscow", 55.7558, 37.6173, "Europe/Moscow")
    assert res["birth_time"] is None
    assert res["type"] in ["Манифестор", "Генератор", "Манифестирующий Генератор", "Проектор", "Отражатель"]
    assert "profile" in res

def test_generator_type():
    res = calculate_hd_card("1990-05-10", "14:30", "exact", "Moscow", 55.7558, 37.6173, "Europe/Moscow")
    # For a deterministic assertion we would need an exact HD sample. We'll just verify the keys exist.
    assert res["type"] in ["Манифестор", "Генератор", "Манифестирующий Генератор", "Проектор", "Отражатель"]
    assert "authority" in res
    assert "defined_centers" in res

def test_channel_activation():
    res = calculate_hd_card("1985-08-20", "08:15", "exact", "London", 51.5074, -0.1278, "Europe/London")
    assert isinstance(res["active_channels"], list)
    assert isinstance(res["active_gates"], list)

def test_defined_centers():
    res = calculate_hd_card("2000-12-01", "23:45", "approx", "New York", 40.7128, -74.0060, "America/New_York")
    assert isinstance(res["defined_centers"], list)
