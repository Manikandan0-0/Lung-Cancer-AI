"""
Launcher script for PulmoVision AI FastAPI Backend
"""

import sys
import os
from pathlib import Path

# Add current project root and backend dir to sys.path
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent

sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("  PulmoVision AI - ResNet50 & Grad-CAM FastAPI Backend")
    print("  Server URL: http://localhost:8000")
    print("  API Docs:   http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
