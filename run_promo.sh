#!/bin/bash
set -e


     -y ffmpeg python3-pip

pip install pillow moviepy numpy gTTS

python3 video_generator.py
