import requests
import os
import time

book_number = 2  # Set the desired book number

slots_with_icons = ['W_91', 'W_92', 'W_93', 'W_95']

def get_file_name(skill_name):
    formatted_name = skill_name.replace(' ', '_').replace('/', '_').replace('+','').replace('\'', '').replace('-','_')
    return f"{formatted_name}.png"

def get_image_url(skill_name):
    file_name = get_file_name(skill_name)
    api_url = f"https://feheroes.fandom.com/api.php?action=query&prop=imageinfo&titles=File:{file_name}&iiprop=url&format=json"
    response = requests.get(api_url)
    data = response.json()

    try:
        pages = data['query']['pages']
        first_page = next(iter(pages.values()))
        image_info = first_page.get('imageinfo', [])
        return image_info[0]['url'] if image_info else None
    except KeyError as e:
        print(f"Error navigating JSON for {skill_name}: {e}")
        return None

def fetch_skills(book_number):
    url = f'https://kannadb.up.railway.app/feh/max_skills_ajax.json?_={int(time.time() * 1000)}'
    print(url)
    response = requests.get(url)

    if response.status_code != 200:
        print("Failed to fetch skill data")
        return []

    skills = response.json()['data']
    return [skill['name']['name'] for skill in skills if skill['book'] == book_number and skill['slot']['name'] in slots_with_icons]

def download_image(url, download_path):
    try:
        image_response = requests.get(url)
        with open(download_path, 'wb') as file:
            file.write(image_response.content)
        print(f"Downloaded {download_path}")
    except Exception as e:
        print(f"Error downloading {download_path}: {e}")

def process(skill_name):
    download_path = os.path.join('..', 'assets', "skills", f"{get_file_name(skill_name).replace('.png', '.webp')}")
    if os.path.exists(download_path):
        print(f"{download_path} already exists. Skipping download.")
        return
    image_url = get_image_url(skill_name)
    download_image(image_url, download_path)

if __name__ == "__main__":
    skills = fetch_skills(book_number)
    # skills = ['Atk Ploy 3'] # testing purposes
    
    for skill in skills:
        process(skill)
