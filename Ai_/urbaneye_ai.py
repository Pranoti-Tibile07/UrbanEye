
import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

# --------------------------------------------------
# 1. Load environment variables
# --------------------------------------------------

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")


# --------------------------------------------------
# 2. Create Gemini client
# --------------------------------------------------

client = genai.Client(api_key=api_key)


# --------------------------------------------------
# 3. UrbanEye image analysis
# --------------------------------------------------

def analyze_image(image_path):

    # Read image
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()

    # Convert image into Gemini Part
    image = types.Part.from_bytes(
        data=image_data,
        mime_type="image/jpeg"
    )

    # UrbanEye prompt
    prompt = """
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

    # Send image + prompt to Gemini
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            prompt,
            image
        ]
    )

    # Convert response into Python dictionary
    result = json.loads(response.text)

    return result


# --------------------------------------------------
# 4. Test
# --------------------------------------------------

if __name__ == "__main__":

    result = analyze_image("pothole.jpg")

    print("\n--- UrbanEye AI Result ---")
    print(json.dumps(result, indent=4))