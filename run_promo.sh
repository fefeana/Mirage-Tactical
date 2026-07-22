#!/bin/bash
set -e

date

sudo apt-get update
sudo apt-get install -y ffmpeg python3-pip

pip install pillow moviepy numpy gTTS

python3 video_generator.py

date
