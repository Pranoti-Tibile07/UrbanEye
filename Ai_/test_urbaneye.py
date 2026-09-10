
from urbaneye_ai import analyze_image
import os
import json

# Folder containing test images (relative to this script so it works from
# any working directory, not just Ai_/)
TEST_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_images")

# Supported image formats
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png")

print("\n========================================")
print("        UrbanEye AI - Image Testing")
print("========================================")

# Get all images from test folder
images = [
    file for file in os.listdir(TEST_FOLDER)
    if file.lower().endswith(IMAGE_EXTENSIONS)
]

if not images:
    print("No images found in test_images folder.")
    exit()

# Analyze each image
for image_name in images:

    image_path = os.path.join(TEST_FOLDER, image_name)

    print(f"\nAnalyzing: {image_name}")
    print("----------------------------------------")

    try:
        result = analyze_image(image_path)

        print(json.dumps(result, indent=4))

    except Exception as e:
        print(f"Error analyzing {image_name}: {e}")

print("\n========================================")
print("          Testing Completed")
print("========================================")