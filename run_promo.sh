#!/bin/bash
set -e

echo "=== Installing FFmpeg ==="
sudo apt-get update
sudo apt-get install -y ffmpeg

echo "=== Installing Python Libraries ==="
pip install pillow moviepy numpy gTTS

echo "=== Running Video Generator ==="
python video_generator.py
