# 🚀 BigQuery Release Notes Dashboard

A modern, high-performance web dashboard built using **Python Flask** and vanilla **HTML, CSS, and JavaScript**. The application pulls the official Google Cloud BigQuery Atom release notes feed, parses its content into individual granular updates, and features a social sharing integration to post specific notes to **X (formerly Twitter)** with customized templates.

---

## ✨ Features

- **Granular Feed Parsing**: The Google Cloud release notes feed clusters all updates for a single date under one entry. Our backend splits this feed by header tags (`<h3>Feature</h3>`, `<h3>Issue</h3>`, etc.) so that you can interact with, search, and Tweet about *specific updates* rather than whole days.
- **Cosmic Dark Theme**: Built with custom Google Fonts (`Outfit` and `Plus Jakarta Sans`), glowing background orbs, glassmorphism, responsive grids, and visual color badges tailored to release types (Green for *Features*, Red for *Issues*, Blue for *Changes*, Amber for *Deprecations*).
- **Instant Search & Type Filtering**: Instant fuzzy text matching across date, type, and contents, alongside dynamic category count statistic cards.
- **Social Sync Workspace**: Select any card to launch the Tweet composer. Features three preset formats (Bullet points, News headline, Short tweet) and dynamic character calculations tracking the 280-character limit with a glowing progress circle.
- **Intelligent Caching**: In-memory feed caching (10 minutes default) preventing network rate limiting and securing sub-millisecond load times. Bypassed instantly when hitting the animated refresh button.
- **Zero Configuration**: Uses native Twitter Web Intents for sharing, meaning no Twitter developer accounts or API keys are required.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, Flask 3.1.x, BeautifulSoup4 (HTML extraction), Requests
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (custom CSS Variables, CSS Grid, animations), Vanilla JavaScript (ES6+, state management)

---

## ⚙️ Project Structure

```text
bq-releases-notes/
├── app.py                # Flask server, Atom XML parser, cache and endpoints
├── requirements.txt      # Python dependencies
├── run.sh                # Launcher automation script
├── .gitignore            # Git exclusion rules
├── templates/
│   └── index.html        # HTML layout and structural dashboard
└── static/
    ├── css/
    │   └── style.css     # CSS Variables, grid system, and styling
    └── js/
        └── app.js        # Dynamic UI, searches, filters, state, and composer
```

---

## 🚀 Getting Started

### Method 1: The Automated Launcher (Recommended)

1. Make sure you are in the project folder.
2. Launch the application:
   ```bash
   ./run.sh
   ```
   *Note: This script checks your environment, installs dependencies in a local `.venv` if needed, and starts the server on port `5001`.*

### Method 2: Manual Setup

1. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. **Install requirements**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the server**:
   ```bash
   python app.py
   ```

Open your browser and navigate to **[http://localhost:5001](http://localhost:5001)**.

---

## 🐦 How to Tweet an Update

1. Hover over a release card and click **Select Update** in the top-right header, or click **Tweet This** in the footer.
2. The right-hand **X/Twitter Composer** panel will instantly activate, loading the update details.
3. Choose a layout template at the bottom:
   - **Bullet (🚀)**: Pre-formatted bullet style summarizing the update.
   - **Headline (📰)**: Professional news header layout.
   - **Short (⚡)**: Minimalist format optimized for length.
4. Modify the text inside the text area if you want to customize.
5. The circular character widget tracks your length:
   - **Green/Cyan**: Valid length.
   - **Amber**: Under 20 characters remaining.
   - **Red**: Limit exceeded (Post button will be disabled).
6. Click **Post to X** to open a pre-filled Twitter sharing window in a new tab.
