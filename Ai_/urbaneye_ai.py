
import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

# --------------------------------------------------
# 1. Load environment variables
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# 2. Configuration
# --------------------------------------------------

MODEL_NAME = "gemini-3.6-flash"

CATEGORIES = [
    "Pothole",
    "Garbage",
    "Broken Streetlight",
    "Water Leakage",
    "Damaged Public Property",
    "Other",
]

SEVERITIES = ["Low", "Medium", "High"]

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}


# --------------------------------------------------
# 3. Errors
# --------------------------------------------------

class UrbanEyeAIError(Exception):
    """Base error for the UrbanEye AI module."""


class AIConfigurationError(UrbanEyeAIError):
    """Raised when the Gemini API key is missing or misconfigured."""


class InvalidImageError(UrbanEyeAIError):
    """Raised when the supplied image is not a supported type."""


class AIAnalysisError(UrbanEyeAIError):
    """Raised when Gemini cannot produce a usable result."""


# --------------------------------------------------
# 4. Gemini client (created lazily so importing this
#    module never crashes the whole app)
# --------------------------------------------------

_client = None


def get_client():
    global _client

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AIConfigurationError(
            "GEMINI_API_KEY is not set. Create an Ai_/.env file (or a .env file "
            "in the project root) containing: GEMINI_API_KEY=your_key_here"
        )

    if _client is None:
        _client = genai.Client(api_key=api_key)

    return _client


# --------------------------------------------------
# 5. Image helpers
# --------------------------------------------------

def detect_image_mime(data):
    """Detect the MIME type of an image from its magic bytes."""
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    return None


def _mime_from_filename(filename):
    lowered = filename.lower()
    if lowered.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lowered.endswith(".png"):
        return "image/png"
    return None


# --------------------------------------------------
# 6. Prompt
# --------------------------------------------------

PROMPT = """
You are UrbanEye AI, an intelligent public infrastructure
analysis system.

Analyze the provided image and identify the main public
infrastructure problem.

Choose exactly ONE category:

- Pothole
- Garbage
- Broken Streetlight
- Water Leakage
- Damaged Public Property
- Other

Choose exactly ONE severity:

- Low
- Medium
- High

Estimate your confidence as a percentage from 0 to 100.

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
    "category": "...",
    "severity": "...",
    "confidence": 0,
    "description": "..."
}

Do not include markdown, explanations, or code fences.
"""


# --------------------------------------------------
# 7. Robust JSON parsing + validation
# --------------------------------------------------

def _extract_json(text):
    """Best-effort extraction of the JSON object from a model reply."""
    if not text:
        raise AIAnalysisError("Gemini returned an empty response.")

    text = text.strip()

    # Strip code fences if the model wrapped the JSON in ```json ... ```
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, flags=re.DOTALL)
    if fence:
        text = fence.group(1).strip()

    # Fall back to the first { ... } block
    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end > start:
            text = text[start : end + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise AIAnalysisError(f"Gemini returned invalid JSON: {exc}")


def _validate_result(data):
    if not isinstance(data, dict):
        raise AIAnalysisError("Gemini returned an unexpected structure (not an object).")

    # Category
    category = str(data.get("category", "")).strip()
    match = next(
        (c for c in CATEGORIES if c.lower() == category.lower()),
        None,
    )
    if match:
        category = match
    elif not category:
        raise AIAnalysisError("Gemini response is missing the 'category' field.")
    else:
        raise AIAnalysisError(f"Gemini returned an unknown category: '{category}'.")

    # Severity
    severity = str(data.get("severity", "")).strip()
    match = next(
        (s for s in SEVERITIES if s.lower() == severity.lower()),
        None,
    )
    if match:
        severity = match
    elif not severity:
        raise AIAnalysisError("Gemini response is missing the 'severity' field.")
    else:
        raise AIAnalysisError(f"Gemini returned an unknown severity: '{severity}'.")

    # Confidence (clamped to 0-100)
    try:
        confidence = int(round(float(data.get("confidence", 0))))
    except (TypeError, ValueError):
        raise AIAnalysisError("Gemini returned a non-numeric confidence value.")
    confidence = max(0, min(100, confidence))

    description = str(data.get("description", "")).strip()

    return {
        "category": category,
        "severity": severity,
        "confidence": confidence,
        "description": description,
    }


# --------------------------------------------------
# 8. Analysis entry points
# --------------------------------------------------

def analyze_image_bytes(image_data, mime_type=None):
    """Analyze an in-memory image (bytes). Used by the FastAPI backend."""
    if mime_type is None:
        mime_type = detect_image_mime(image_data)

    if mime_type not in ALLOWED_MIME_TYPES:
        raise InvalidImageError(
            "Unsupported image type. Please upload a JPG, JPEG or PNG image."
        )

    image = types.Part.from_bytes(data=image_data, mime_type=mime_type)

    try:
        response = get_client().models.generate_content(
            model=MODEL_NAME,
            contents=[PROMPT, image],
        )
    except AIConfigurationError:
        raise
    except Exception as exc:
        raise AIAnalysisError(
            f"Gemini request failed: {exc.__class__.__name__}: {exc}"
        )

    return _validate_result(_extract_json(response.text))


def analyze_image(image_path):
    """Analyze an image from a file path (kept for the existing test scripts)."""
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()

    mime_type = _mime_from_filename(image_path) or detect_image_mime(image_data)

    return analyze_image_bytes(image_data, mime_type=mime_type)


# --------------------------------------------------
# 9. Test
# --------------------------------------------------

if __name__ == "__main__":

    result = analyze_image("pothole.jpg")

    print("\n--- UrbanEye AI Result ---")
    print(json.dumps(result, indent=4))
