from __future__ import annotations

import argparse
from pathlib import Path
import subprocess
import sys


PROJECT_DIR = Path(__file__).resolve().parent
SPEC_FILE = PROJECT_DIR / "Image2PDF.spec"


def build_executable() -> Path:
    try:
        import PyInstaller  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "PyInstaller is not installed. Run: "
            f"{sys.executable} -m pip install -r requirements-build.txt"
        ) from exc

    subprocess.run(
        [
            sys.executable,
            "-m",
            "PyInstaller",
            "--noconfirm",
            "--clean",
            str(SPEC_FILE),
        ],
        cwd=PROJECT_DIR,
        check=True,
    )

    filename = "Image2PDF.exe" if sys.platform == "win32" else "Image2PDF"
    return PROJECT_DIR / "dist" / filename


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a native Image2PDF executable for the current OS."
    )
    parser.add_argument(
        "target",
        choices=("exe",),
        help="Build the desktop executable.",
    )
    args = parser.parse_args()

    if args.target == "exe":
        executable = build_executable()
        print(f"\nBuild complete: {executable}")


if __name__ == "__main__":
    main()
