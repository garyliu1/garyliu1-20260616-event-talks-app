#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

echo "=============================================="
echo "🚀 BigQuery Release Notes Dashboard Launcher"
echo "=============================================="

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment 'venv' not found. Setting it up now..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "🔥 Starting Flask App on http://localhost:5001..."
python app.py
