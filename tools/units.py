import requests
from bs4 import BeautifulSoup
import json
import re

# Define the URL for the unit's wiki page
url = "https://feheroes.fandom.com/wiki/Hinata:_Wild_Samurai"

response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

def parse_hero_data(soup):
    img_title = url.split("/")[-1].replace(":", "")
    entry = get_td_value(soup, "Entry")
    return {
        "name": soup.select_one(".page-header__title").text.split(":")[0].strip(),
        "subtitle": soup.select_one(".page-header__title").text.split(":")[1].strip(),
        "imgFace": f"assets/face/{img_title}_Face_FC.webp",
        "imgSprite": f"assets/sprites/{img_title}_Mini_Unit_Idle.webp",
        "rarity": f"RARITY.{map_rarity(get_td_value(soup, "Rarities"))}",
        "weaponType": f"WEAPON_TYPE.{get_td_value(soup, "Weapon Type").upper()}.id",
        "moveType": f"MOVE_TYPE.{get_td_value(soup, "Move Type").upper().replace("OR", "OUR")}.id",
        "entry": map_entry(get_td_value(soup, "Entries") if entry is None else entry),
        "releaseDate": get_td_value(soup, "Release Date"),
        "version": get_td_value(soup, "Version"),
        "level1Stats": parse_stats(soup, "Level_1_stats"),
        "level40Stats": parse_stats(soup, "Level_40_stats"),
        "superboons": find_supers(soup, "boon"),
        "superbanes": find_supers(soup, "bane")
    }

def get_td_value(soup, th_text):
    info = soup.select_one('div.hero-infobox')
    
    for tr in info.find_all('tr'):
        th = tr.find('th')
        td = tr.find('td')
        
        if th and td:
            if th_text.strip().lower() in th.get_text(strip=True).lower():
                return td.get_text(" ", strip=True)  # Replace newlines with spaces
    return None

# STORY GRAIL THREE_STAR FIVE_STAR FOUR_STAR_SEASONAL FIVE_STAR_SEASONAL 
def map_rarity(rarity):
    if rarity.endswith("Story"):
        return "STORY"
    if rarity.endswith("Grand Hero Battle") or rarity.endswith("Tempest Trials"):
        return "GRAIL"
    if rarity.startswith("3"):
        return "THREE_STAR"
    if "4" in rarity and "SR" in rarity:
        return "FIVE_STAR"

def map_entry(entry):
    tests = {
        "Heroes": "HEROES",
        "Shadow Dragon": "SHADOW_DRAG_NEW_MYSTERY",
        "Echoes": "ECHOS",
        "Genealogy": "GENEALOGY",
        "Thracia": "THRACIA",
        "Binding": "BINDING_BLADE",
        "Blazing": "BLAZING_BLADE",
        "Sacred": "SACRED_STONES",
        "Path of Radiance": "PATH_OF_RADIANCE",
        "Radiant Dawn": "RADIANT_DAWN",
        "Awakening": "AWAKENING",
        "Fates": "FATES",
        "Three Houses": "THREE_HOUSES",
        "Tokyo": "TOKYO_MIRAGE_SESSIONS",
        "Engage": "ENGAGE"
    }

    entry = entry.lower()  # make comparison case-insensitive
    result = []

    for key, value in tests.items():
        if key.lower() in entry:
            result.append(f"ENTRY.{value}")

    return result

def parse_stats(soup, section_id):
    span = soup.find("span", {"id": section_id})
    if not span:
        return None

    h3 = span.find_parent("h3")
    if not h3:
        return None

    table = h3.find_next("table")
    if not table:
        return None

    # Get the last <tr> (the 5★ row)
    last_row = table.find_all("tr")[-1]
    tds = last_row.find_all("td")

    stat_values = []
    for td in tds[1:6]:  # columns for HP, Atk, Spd, Def, Res
        parts = td.get_text(strip=True).split('/')
        if len(parts) == 3:
            stat_values.append(int(parts[1]))  # middle value
        else:
            stat_values.append(None)

    stat_names = ["hp", "atk", "spd", "def", "res"]
    return dict(zip(stat_names, stat_values))

def find_supers(soup, variant="boon"):
    span = soup.find("span", {"id": "Level_40_stats"})
    if not span:
        return []

    h3 = span.find_parent("h3")
    if not h3:
        return []

    table = h3.find_next("table")
    if not table:
        return []

    last_row = table.find_all("tr")[-1]
    tds = last_row.find_all("td")

    stat_names = ["HP", "ATK", "SPD", "DEF", "RES"]
    result = []

    for name, td in zip(stat_names, tds[1:6]):
        parts = td.get_text(strip=True).split('/')
        if len(parts) != 3:
            continue
        left, mid, right = map(int, parts)

        if variant == "boon":
            if right - mid == 4:
                result.append(f"STATS.{name}")
        elif variant == "bane":
            if mid - left == 4:
                result.append(f"STATS.{name}")

    return result

# Extract data and convert to JavaScript
hero_data = parse_hero_data(soup)
hero_name = hero_data['name'].upper()  # Format name in uppercase for object key

# Create JavaScript string
js_object = f"{hero_name}: {json.dumps(hero_data, indent=2)}"
js_object = re.sub(r'"(\w+)"\s*:', r'\1:', js_object)

# with open("heroes_data.js", "w") as file:
#     file.write(js_object)

print(js_object)
