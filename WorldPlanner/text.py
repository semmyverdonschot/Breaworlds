import os
import json

# Define the source folder for sprites
folder = r'C:\Users\semmy\Desktop\Breaworlds\WorldPlanner\Export_Sprites\Export_Sprites'
web_path_prefix = 'Export_Sprites/'  # relative URL path

# Keywords and prefixes to exclude (clothes, character parts, wearables)
exclude_prefixes = ('spr_wa_', 'spr_character_', 'spr_wc_')
exclude_keywords = [
    'head', 'leg', 'hand', 'face', 'body', 'diaper', 'shoes', 'pants', 
    'shirt', 'suit', 'hat', 'cap', 'mask', 'glasses', 'wings', 'cape', 
    'hair', 'booties', 'slippers', 'sneakers', 'jeans', 'skirt', 'tuxedo', 
    'sweater', 'robe', 'dress', 'coat', 'beard', 'makeup', 'crown', 
    'visor', 'headphones', 'scarf', 'bandit', 'goggles', 'snorkel', 
    'helmet', 'hoodie', 'bikini', 'outfit', 'eyes', 'arm', 'chest', 'seed','achievement',
]

# List all image files and apply filtering
all_files = [f for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
filtered_images = []
deleted_count = 0

for f in all_files:
    fname_lower = f.lower()
    is_excluded = (
        fname_lower.startswith(exclude_prefixes) or 
        any(kw in fname_lower for kw in exclude_keywords)
    )
    
    # Exceptions: keep items that might be blocks but contain keywords (if any)
    # e.g., 'treasure_chest' contains 'chest' but is a block
    if 'treasure_chest' in fname_lower or 'amethyst_chest' in fname_lower:
        is_excluded = False

    if is_excluded:
        try:
            os.remove(os.path.join(folder, f))
            deleted_count += 1
        except Exception as e:
            print(f"Error deleting {f}: {e}")
    else:
        filtered_images.append(web_path_prefix + f)

filtered_images.sort()

# Define all json paths to update
json_paths = [
    r'C:\Users\semmy\Desktop\Breaworlds\WorldPlanner\images.json',
    r'C:\Users\semmy\Desktop\Breaworlds\WorldPlanner\Export_Sprites\images.json',
    r'C:\Users\semmy\Desktop\Breaworlds\WorldPlanner\Export_Sprites\Export_Sprites\images.json'
]

for jp in json_paths:
    try:
        with open(jp, 'w') as f:
            json.dump(filtered_images, f, indent=2)
        print(f"Updated: {jp}")
    except Exception as e:
        print(f"Error updating {jp}: {e}")

print(f"Deleted {deleted_count} wearable/character assets.")
print(f"Total images remaining and indexed: {len(filtered_images)}")
