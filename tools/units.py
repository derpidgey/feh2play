import requests
from bs4 import BeautifulSoup
import json

# Define the URL for the unit's wiki page
url = "https://feheroes.fandom.com/wiki/Alfonse:_Prince_of_Askr"

# Send a request to fetch the page
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Parse the data
def parse_hero_data(soup):
    # Extract the name and subtitle
    name = soup.select_one(".page-header__title").text.split(":")[0].strip()
    subtitle = soup.select_one(".page-header__title").text.split(":")[1].strip()

    # Extract face and sprite images
    img_face = soup.select_one(".pi-image-thumbnail")['src']
    img_sprite = soup.select("img[data-image-name*='Mini_Unit_Idle']")[0]['src']  # May vary in structure
    
    # Sample data extraction - you'll need to adjust selectors depending on the page structure
    rarity = "RARITY.STORY"  # Hardcoded for example
    
    # Weapon and Move types
    weapon_type = "WEAPON_TYPE.SWORD.id"  # Dummy value; replace with extracted data
    move_type = "MOVE_TYPE.INFANTRY.id"  # Dummy value; replace with extracted data
    
    # Extract release date and version
    release_date = "2017-02-02"  # Example hardcoded; replace with extracted data
    version = "1.0"  # Example hardcoded; replace with extracted data
    
    # Sample stats - these may require further parsing
    level1_stats = {
        "hp": 19,
        "atk": 9,
        "spd": 6,
        "def": 8,
        "res": 5
    }
    
    level40_stats = {
        "hp": 43,
        "atk": 35,
        "spd": 25,
        "def": 32,
        "res": 22
    }
    
    # Superboons and superbanes (you would also need to parse these)
    superboons = ["STATS.SPD"]
    superbanes = ["STATS.DEF"]
    
    # Construct the hero dictionary
    hero_data = {
        "name": name,
        "subtitle": subtitle,
        "imgFace": f"assets/face/{img_face.split('/')[-1]}",  # Assuming local assets folder
        "imgSprite": f"assets/sprites/{img_sprite.split('/')[-1]}",
        "rarity": rarity,
        "weaponType": weapon_type,
        "moveType": move_type,
        "entry": ["ENTRY.HEROES"],
        "releaseDate": release_date,
        "version": version,
        "level1Stats": level1_stats,
        "level40Stats": level40_stats,
        "superboons": superboons,
        "superbanes": superbanes
    }
    
    return hero_data

# Extract data and convert to JavaScript
hero_data = parse_hero_data(soup)
hero_name = hero_data['name'].upper()  # Format name in uppercase for object key

# Create JavaScript string
js_object = f"{hero_name}: {json.dumps(hero_data, indent=2)};"

# Save to a .js file
with open("heroes_data.js", "w") as file:
    file.write(js_object)

print(f"JavaScript data for {hero_name} created.")
