import requests
import os
import time

book_number = 2  # Set the desired book number

def get_file_name(hero_name, image_type):
    formatted_name = hero_name.replace(' ', '_')
    return f"{formatted_name}_{image_type}.png"

def get_image_url(hero_name, image_type):
    file_name = get_file_name(hero_name, image_type)
    api_url = f"https://feheroes.fandom.com/api.php?action=query&prop=imageinfo&titles=File:{file_name}&iiprop=url&format=json"
    response = requests.get(api_url)
    data = response.json()

    try:
        pages = data['query']['pages']
        first_page = next(iter(pages.values()))
        image_info = first_page.get('imageinfo', [])
        return image_info[0]['url'] if image_info else None
    except KeyError as e:
        print(f"Error navigating JSON for {hero_name}: {e}")
        return None

def fetch_heroes(book_number):
    url = f'https://kannadb.up.railway.app/feh/heroes_ajax.json?_={int(time.time() * 1000)}'
    print(url)
    response = requests.get(url)

    if response.status_code != 200:
        print("Failed to fetch hero data")
        return []

    heroes = response.json()['data']
    return [hero['stripped_name'] for hero in heroes if hero['book'] == book_number]

def download_image(url, download_path):
    try:
        image_response = requests.get(url)
        with open(download_path, 'wb') as file:
            file.write(image_response.content)
        print(f"Downloaded {download_path}")
    except Exception as e:
        print(f"Error downloading {download_path}: {e}")

def process(hero_name, image_type):
    asset_path = 'face' if image_type == "Face_FC" else 'sprites'
    download_path = os.path.join('..', 'assets', asset_path, f"book{book_number}", f"{get_file_name(hero_name, image_type).replace('.png', '.webp')}")
    if os.path.exists(download_path):
        print(f"{download_path} already exists. Skipping download.")
        return
    image_url = get_image_url(hero_name, image_type)
    download_image(image_url, download_path)

if __name__ == "__main__":
    heroes = fetch_heroes(book_number)
    # heroes = ['Abel The Panther'] # testing purposes
    
    for hero in heroes:
        process(hero, "Face_FC")
        process(hero, "Mini_Unit_Idle")
