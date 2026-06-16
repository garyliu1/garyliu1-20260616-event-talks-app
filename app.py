import os
import re
import time
import hashlib
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Cache configuration
CACHE_EXPIRY_SECONDS = 600  # 10 minutes
_cache = {
    "data": None,
    "last_fetched": 0
}

def clean_text(text):
    """Normalize whitespace in text."""
    if not text:
        return ""
    # Replace multiple whitespaces/newlines with a single space
    return re.sub(r'\s+', ' ', text).strip()

def get_text_summary(html_content):
    """Strip HTML to get a clean text summary for search index and social sharing."""
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, 'html.parser')
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.extract()
    return clean_text(soup.get_text())

def fetch_and_parse_feed():
    """Fetch the BigQuery release notes XML feed and parse it into structured updates."""
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    
    # Atom namespaces
    namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
    root = ET.fromstring(response.content)
    
    updates = []
    
    for entry in root.findall('atom:entry', namespaces):
        title_elem = entry.find('atom:title', namespaces)
        updated_elem = entry.find('atom:updated', namespaces)
        content_elem = entry.find('atom:content', namespaces)
        link_elem = entry.find('atom:link', namespaces)
        
        date_str = title_elem.text if title_elem is not None else "Unknown Date"
        updated_str = updated_elem.text if updated_elem is not None else ""
        link_href = link_elem.attrib.get('href') if link_elem is not None else "https://cloud.google.com/bigquery/docs/release-notes"
        
        content_html = content_elem.text if content_elem is not None else ""
        
        if not content_html.strip():
            continue
            
        soup = BeautifulSoup(content_html, 'html.parser')
        
        # We want to split updates by <h3> tags
        current_type = None
        current_elements = []
        
        def add_current_update():
            nonlocal current_type, current_elements
            if current_type and current_elements:
                html_content = "".join(str(el) for el in current_elements).strip()
                text_summary = get_text_summary(html_content)
                
                # Generate unique ID based on content hash
                content_hash = hashlib.md5((date_str + current_type + html_content).encode('utf-8')).hexdigest()[:12]
                update_id = f"bq-{content_hash}"
                
                updates.append({
                    'id': update_id,
                    'date': date_str,
                    'updated': updated_str,
                    'link': link_href,
                    'type': current_type,
                    'content': html_content,
                    'text_summary': text_summary
                })
        
        for child in soup.contents:
            if child.name == 'h3':
                # Save previous update before starting a new one
                add_current_update()
                current_type = child.get_text().strip()
                current_elements = []
            elif child.name is not None:
                # Include standard tags
                current_elements.append(child)
            elif isinstance(child, str) and child.strip():
                # Include non-empty text nodes
                current_elements.append(child)
                
        # Save the final update for this entry
        add_current_update()
        
        # If no h3 headings were found but we have content, treat the whole entry as one update
        if not current_type and content_html.strip():
            content_hash = hashlib.md5((date_str + "Update" + content_html).encode('utf-8')).hexdigest()[:12]
            updates.append({
                'id': f"bq-{content_hash}",
                'date': date_str,
                'updated': updated_str,
                'link': link_href,
                'type': 'Update',
                'content': content_html,
                'text_summary': get_text_summary(content_html)
            })
            
    return updates

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    now = time.time()
    
    # Return cached data if available and not expired, unless refresh is forced
    if not force_refresh and _cache["data"] is not None and (now - _cache["last_fetched"] < CACHE_EXPIRY_SECONDS):
        return jsonify({
            "status": "success",
            "source": "cache",
            "last_fetched": _cache["last_fetched"],
            "data": _cache["data"]
        })
        
    try:
        data = fetch_and_parse_feed()
        _cache["data"] = data
        _cache["last_fetched"] = now
        return jsonify({
            "status": "success",
            "source": "network",
            "last_fetched": now,
            "data": data
        })
    except Exception as e:
        # Fallback to cache if network fetch fails
        if _cache["data"] is not None:
            return jsonify({
                "status": "partial_success",
                "source": "cache_fallback",
                "error": str(e),
                "last_fetched": _cache["last_fetched"],
                "data": _cache["data"]
            })
        return jsonify({
            "status": "error",
            "message": "Failed to fetch release notes from Google Cloud.",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    # Bind to all interfaces (0.0.0.0) so it's accessible externally if needed, on port 5001 to avoid conflicts
    app.run(host='0.0.0.0', port=5001, debug=True)
