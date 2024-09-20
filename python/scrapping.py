import requests
from bs4 import BeautifulSoup
import json
import re

# Load input data
with open('in.json', 'r') as json_file:
    entries = json.load(json_file)

# Facebook scraping function
def extract_data_from_facebook(url):
    """Extract full name, phone number, email, and address from a Facebook URL."""
    result = {"fullName": "", "phoneNumber": "", "email": "", "address": ""}
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract full name
            name_tag = soup.find('meta', property='og:title')
            if name_tag:
                result['fullName'] = name_tag.get('content', '').strip()

            # Extract phone number
            phone_tag = soup.find('a', href=lambda x: x and 'tel:' in x)
            if phone_tag:
                result['phoneNumber'] = phone_tag.get('href').replace('tel:', '').strip()

            # Extract email addresses
            email_tags = soup.find_all('a', href=lambda x: x and 'mailto:' in x)
            if email_tags:
                result['email'] = ', '.join([email.get('href').replace('mailto:', '').strip() for email in email_tags])

            # Extract address using regex
            address_pattern = re.compile(r'\d{1,5}\s\w+(\s\w+){1,3},\s\w+(\s\w+)*,\s\w{2,3}\s\d{5,6}')
            text_content = soup.get_text()
            address_matches = address_pattern.findall(text_content)
            if address_matches:
                result['address'] = ' '.join([match[0] for match in address_matches]).strip()

            return result
        else:
            print(f"Failed to retrieve the page. Status code: {response.status_code} for URL: {url}")
            return None
    except Exception as e:
        print(f"An error occurred: {e} for URL: {url}")
        return None

# Instagram scraping function
def extract_data_from_instagram(url):
    """Extract full name, phone number, email, and address from an Instagram URL."""
    result = {"fullName": "", "phoneNumber": "", "email": "", "address": ""}
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract full name
            name_tag = soup.find('meta', property='og:title')
            if name_tag:
                result['fullName'] = name_tag.get('content', '').strip()

            # Extract phone number (Instagram usually doesn't have phone numbers but check for tel links)
            phone_tag = soup.find('a', href=lambda x: x and 'tel:' in x)
            if phone_tag:
                result['phoneNumber'] = phone_tag.get('href').replace('tel:', '').strip()

            # Extract email addresses (Check for mailto links)
            email_tags = soup.find_all('a', href=lambda x: x and 'mailto:' in x)
            if email_tags:
                result['email'] = ', '.join([email.get('href').replace('mailto:', '').strip() for email in email_tags])

            return result
        else:
            print(f"Failed to retrieve the page. Status code: {response.status_code} for URL: {url}")
            return None
    except Exception as e:
        print(f"An error occurred: {e} for URL: {url}")
        return None

# Twitter/X scraping function
def extract_data_from_twitter(url):
    """Redirect to X.com and extract data from Twitter/X."""
    x_url = url.replace('twitter.com', 'x.com')  # Redirect to x.com
    result = {"fullName": "", "phoneNumber": "", "email": "", "address": ""}
    try:
        response = requests.get(x_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract full name from the profile's meta tag (similar to og:title)
            name_tag = soup.find('meta', property='og:title')
            if name_tag:
                result['fullName'] = name_tag.get('content', '').strip()

            # Extract possible email from text content (assuming Twitter/X users might mention emails in bio)
            email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+')
            email_matches = email_pattern.findall(soup.get_text())
            if email_matches:
                result['email'] = email_matches[0].strip()  # Assume the first match is the primary email

            # Extract phone numbers (not common on Twitter/X, but scan the bio for 'tel:' links or numbers)
            phone_pattern = re.compile(r'\+?\d[\d\s-]{8,}')
            phone_matches = phone_pattern.findall(soup.get_text())
            if phone_matches:
                result['phoneNumber'] = phone_matches[0].strip()  # Assume the first match is the primary phone number

            # Address isn't typically found, but you could search for mentions of locations in the bio
            location_tag = soup.find('span', class_=lambda x: x and 'location' in x.lower())
            if location_tag:
                result['address'] = location_tag.get_text().strip()

            return result
        else:
            print(f"Failed to retrieve the page. Status code: {response.status_code} for URL: {x_url}")
            return None
    except Exception as e:
        print(f"An error occurred: {e} for URL: {x_url}")
        return None

# Main logic to iterate over entries and scrape data
for entry in entries:
    facebook_url = entry.get('facebook', "")
    instagram_url = entry.get('instagram', "")
    twitter_url = entry.get('twitter', "")
    
    # Try scraping from Facebook
    data = extract_data_from_facebook(facebook_url) if facebook_url else None
    
    # If no data found from Facebook, try Instagram
    if not data or not any(data.values()):
        data = extract_data_from_instagram(instagram_url) if instagram_url else None
    
    # If still no data found, try Twitter (x.com)
    if not data or not any(data.values()):
        data = extract_data_from_twitter(twitter_url) if twitter_url else None

    if data:
        entry['fullName'] = data.get('fullName', "")
        entry['phoneNumber'] = data.get('phoneNumber', "")
        entry['email'] = data.get('email', "")
        entry['address'] = data.get('address', "")

# Save the updated data to output file
with open('out.json', 'w') as json_file:
    json.dump(entries, json_file, indent=4)

print("Data has been saved to out.json")
