import re
import os
import requests

def get_img_url(skill_name):
    skill_name = skill_name.replace('Armour', 'Armor')
    api_url = f"https://feheroes.fandom.com/api.php?action=query&prop=imageinfo&titles=File:{skill_name}.png&iiprop=url&format=json"
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

def download_image(skill_name):
    download_path = os.path.join('..', 'assets', 'skills', f"{skill_name}.webp")
    try:
        # Check if the file already exists
        if os.path.exists(download_path):
            print(f"File already exists: {download_path}, skipping download.")
            return f"assets/skills/{skill_name}.webp"  # Return the relative path

        url = get_img_url(skill_name)
        # Fetch the image content
        image_response = requests.get(url)
        image_response.raise_for_status()  # Raise an error for failed HTTP requests
        
        # Save the image locally
        os.makedirs(os.path.dirname(download_path), exist_ok=True)
        with open(download_path, 'wb') as file:
            file.write(image_response.content)
        
        print(f"Downloaded {download_path}")
        return f"assets/skills/{skill_name}.webp"  # Return the relative path for the JS file
    except Exception as e:
        print(f"Error downloading {download_path}: {e}")
        return None


def modify_js_file(file_path, output_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
            # Extract the A_SKILLS object using regex
            match = re.search(r'(C_SKILLS\s*=\s*{)(.*?)(};)', content, re.DOTALL)
            if not match:
                print("A_SKILLS variable not found.")
                return
            
            prefix, skills_content, suffix = match.groups()
            
            # Regex pattern to match each skill object
            skill_pattern = re.compile(
                r'(\w+):\s*{\s*name:\s*"(.*?)",\s*description:\s*"(.*?)",(?:\s*img:\s*".*?",)?', 
                re.DOTALL
            )
            
            # Replace each skill with an updated version if img property is missing
            def add_img_property(match):
                skill_id, skill_name, description = match.groups()
                
                # Check if the skill already has an img property
                if 'img:' in match.group(0):
                    return match.group(0)  # Return the original unmodified skill
                
                img_skill_name = skill_name.replace(' ', '_').replace('+','Plus_').replace('/','_')
                # Fetch the image URL and download the image
                relative_path = download_image(img_skill_name)
                if relative_path:
                    # Add the img property with the relative path
                    return (
                        f'{skill_id}: {{\n'
                        f'    name: "{skill_name}",\n'
                        f'    description: "{description}",\n'
                        f'    img: "{relative_path}",'
                    )
                
                # If downloading or fetching fails, leave it unchanged
                return match.group(0)
            
            modified_skills_content = skill_pattern.sub(add_img_property, skills_content)
            
            # Combine the modified A_SKILLS object
            modified_content = f"{prefix}{modified_skills_content}{suffix}"
            
            # Write the modified content to a new file
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(content.replace(skills_content, modified_skills_content))
            
            print(f"Modified file written to: {output_path}")
    
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
             
# Example usage
input_file_path = "../js/data/skills.js"
output_file_path = "../js/data/skills.js"
modify_js_file(input_file_path, output_file_path)
