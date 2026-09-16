from __future__ import annotations

import argparse
import hashlib
from importlib import metadata
from pathlib import Path
import shutil
import sys
import sysconfig


PROJECT_DIR = Path(__file__).resolve().parents[1]
RELEASE_DIR = PROJECT_DIR / "release"

PLATFORMS = {
    "windows": {
        "label": "Windows",
        "source": PROJECT_DIR / "dist" / "Image2PDF.exe",
        "output": "Image2PDF-Windows.exe",
    },
    "macos": {
        "label": "macOS",
        "source": PROJECT_DIR / "dist" / "Image2PDF",
        "output": "Image2PDF-macOS",
    },
    "linux": {
        "label": "Linux",
        "source": PROJECT_DIR / "dist" / "Image2PDF",
        "output": "Image2PDF-Linux",
    },
}

NOTICE_PACKAGES = {
    "altgraph",
    "blinker",
    "click",
    "flask",
    "gunicorn",
    "itsdangerous",
    "jinja2",
    "markupsafe",
    "packaging",
    "pefile",
    "pillow",
    "pyinstaller",
    "pyinstaller-hooks-contrib",
    "pywin32-ctypes",
    "werkzeug",
}

LICENSE_PREFIXES = ("LICENSE", "LICENCE", "COPYING", "NOTICE")


def normalized_name(value: str) -> str:
    return value.lower().replace("_", "-").replace(".", "-")


def installed_notice_distributions() -> list[metadata.Distribution]:
    selected = []
    for distribution in metadata.distributions():
        name = distribution.metadata.get("Name", "")
        if normalized_name(name) in NOTICE_PACKAGES:
            selected.append(distribution)
    return sorted(selected, key=lambda item: item.metadata.get("Name", "").lower())


def license_paths(distribution: metadata.Distribution) -> list[Path]:
    paths: list[Path] = []
    seen: set[Path] = set()

    for entry in distribution.files or []:
        if not Path(str(entry)).name.upper().startswith(LICENSE_PREFIXES):
            continue
        path = Path(distribution.locate_file(entry)).resolve()
        if path.is_file() and path not in seen:
            seen.add(path)
            paths.append(path)

    return sorted(paths, key=lambda item: str(item).lower())


def python_license_path() -> Path | None:
    candidates = [
        Path(sys.base_prefix) / "LICENSE.txt",
        Path(sys.prefix) / "LICENSE.txt",
        Path(sysconfig.get_paths()["stdlib"]).parent / "LICENSE.txt",
        Path(sysconfig.get_paths()["stdlib"]).parent.parent / "LICENSE.txt",
    ]
    return next((path for path in candidates if path.is_file()), None)


def write_third_party_licenses(output: Path, platform_label: str) -> None:
    sections = [
        "Image2PDF third-party licenses",
        f"Platform: {platform_label}",
        f"Python: {sys.version.split()[0]}",
        "",
        "This file was generated from the packages installed on the build runner.",
    ]

    python_license = python_license_path()
    if python_license:
        sections.extend([
            "",
            "=" * 80,
            "Python",
            "=" * 80,
            python_license.read_text(encoding="utf-8", errors="replace").strip(),
        ])

    for distribution in installed_notice_distributions():
        package_name = distribution.metadata.get("Name", "Unknown package")
        license_expression = (
            distribution.metadata.get("License-Expression")
            or distribution.metadata.get("License")
            or "See the included upstream license text."
        )
        sections.extend([
            "",
            "=" * 80,
            f"{package_name} {distribution.version}",
            f"Declared license: {license_expression}",
            "=" * 80,
        ])

        package_licenses = license_paths(distribution)
        if not package_licenses:
            sections.append("No license file was exposed in the installed package metadata.")
            continue

        for path in package_licenses:
            sections.extend([
                "",
                f"--- {path.name} ---",
                path.read_text(encoding="utf-8", errors="replace").strip(),
            ])

    output.write_text("\n".join(sections).rstrip() + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare(platform: str) -> list[Path]:
    config = PLATFORMS[platform]
    source = Path(config["source"])
    if not source.is_file():
        raise SystemExit(f"Built executable not found: {source}")

    RELEASE_DIR.mkdir(parents=True, exist_ok=True)
    executable = RELEASE_DIR / str(config["output"])
    shutil.copy2(source, executable)
    if platform != "windows":
        executable.chmod(executable.stat().st_mode | 0o111)

    checksum = executable.with_name(f"{executable.name}.sha256")
    checksum.write_text(f"{sha256(executable)}  {executable.name}\n", encoding="utf-8")

    notices = RELEASE_DIR / f"THIRD_PARTY_LICENSES-{config['label']}.txt"
    write_third_party_licenses(notices, str(config["label"]))
    return [executable, checksum, notices]


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare one native release artifact.")
    parser.add_argument("--platform", choices=tuple(PLATFORMS), required=True)
    args = parser.parse_args()

    outputs = prepare(args.platform)
    print("Prepared release files:")
    for output in outputs:
        print(f"- {output}")


if __name__ == "__main__":
    main()
