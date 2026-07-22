#!/bin/bash
set -e

START_TIME=$(date "+%Y-%m-%d %H:%M:%S")
echo "=============================="
echo "⏳ Start Time: $START_TIME"
echo "=============================="

echo "=== 1. Updating System & Installing FFmpeg ==="
sudo apt-get update
sudo apt-get install -y ffmpeg python3-pip

echo "=== 2. Installing Python Dependencies ==="
pip install pillow moviepy numpy gTTS

echo "=== 3. Executing Promo Video Generator ==="
python3 video_generator.py

END_TIME=$(date "+%Y-%m-%d %H:%M:%S")
echo "=============================="
echo "✅ Finished Successfully at: $END_TIME"
echo "=============================="
