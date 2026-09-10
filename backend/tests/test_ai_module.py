"""Unit tests for the AI module's parsing/validation (no network needed)."""
import os

import pytest

from Ai_ import urbaneye_ai

PNG_1X1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d4944415478da63fcffff3f0300050001a1c5b8e700"
    "00000049454e44ae426082"
)


def test_detect_mime_types():
    assert urbaneye_ai.detect_image_mime(b"\xff\xd8\xff\xe0\x00") == "image/jpeg"
    assert urbaneye_ai.detect_image_mime(PNG_1X1) == "image/png"
    assert urbaneye_ai.detect_image_mime(b"plain text") is None


def test_extract_json_strips_code_fences():
    raw = '```json\n{"category": "Pothole"}\n```'
    assert urbaneye_ai._extract_json(raw) == {"category": "Pothole"}


def test_extract_json_handles_surrounding_text():
    raw = 'Here you go: {"category": "Garbage"} thanks!'
    assert urbaneye_ai._extract_json(raw) == {"category": "Garbage"}


def test_extract_json_rejects_invalid():
    with pytest.raises(urbaneye_ai.UrbanEyeAIError):
        urbaneye_ai._extract_json("no json here")


def test_validate_result_normalizes_case_and_clamps_confidence():
    result = urbaneye_ai._validate_result(
        {"category": "pothole", "severity": "high", "confidence": 150, "description": "x"}
    )
    assert result["category"] == "Pothole"
    assert result["severity"] == "High"
    assert result["confidence"] == 100


def test_validate_result_rejects_unknown_category():
    with pytest.raises(urbaneye_ai.UrbanEyeAIError):
        urbaneye_ai._validate_result({"category": "Dragon", "severity": "Low", "confidence": 50})


def test_validate_result_requires_severity():
    with pytest.raises(urbaneye_ai.UrbanEyeAIError):
        urbaneye_ai._validate_result({"category": "Pothole", "confidence": 50})


def test_analyze_without_key_raises_configuration_error():
    if os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY is set; skipping no-key test")
    with pytest.raises(urbaneye_ai.AIConfigurationError):
        urbaneye_ai.analyze_image_bytes(PNG_1X1, mime_type="image/png")
