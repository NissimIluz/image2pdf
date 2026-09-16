from __future__ import annotations

from io import BytesIO
import os
from pathlib import Path
import sys
from threading import Timer
from typing import Iterable
import webbrowser

from flask import Flask, render_template, request, send_file
from PIL import Image, UnidentifiedImageError
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.serving import make_server

BASE_DIR = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
)

# Total request size limit: 40 MB
app.config["MAX_CONTENT_LENGTH"] = 40 * 1024 * 1024

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

MESSAGES = {
    "he": {
        "invalid_extension": "הקובץ '{filename}' אינו בפורמט נתמך.",
        "invalid_image": "הקובץ '{filename}' אינו תמונה תקינה.",
        "no_images": "לא נבחרו תמונות.",
        "too_large": "הקבצים גדולים מדי. ניתן להעלות עד 40MB בכל בקשה.",
    },
    "en": {
        "invalid_extension": "The file '{filename}' is not in a supported format.",
        "invalid_image": "The file '{filename}' is not a valid image.",
        "no_images": "No images were selected.",
        "too_large": "The files are too large. You can upload up to 40MB per request.",
    },
}


def is_allowed_filename(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def get_request_language() -> str:
    language = request.args.get("lang")
    if not language:
        try:
            language = request.form.get("lang")
        except RequestEntityTooLarge:
            language = None
    language = language or "he"
    return language if language in MESSAGES else "he"


def message(language: str, key: str, **values) -> str:
    return MESSAGES.get(language, MESSAGES["he"])[key].format(**values)


def load_images(files: Iterable, language: str = "he") -> list[Image.Image]:
    images: list[Image.Image] = []

    for uploaded_file in files:
        if not uploaded_file or not uploaded_file.filename:
            continue

        if not is_allowed_filename(uploaded_file.filename):
            raise ValueError(message(
                language,
                "invalid_extension",
                filename=uploaded_file.filename,
            ))

        try:
            uploaded_file.stream.seek(0)
            image = Image.open(uploaded_file.stream)
            image.load()
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError(message(
                language,
                "invalid_image",
                filename=uploaded_file.filename,
            )) from exc

        # PDF export through Pillow requires RGB/L mode.
        # Images with transparency are placed over a white background.
        if image.mode in ("RGBA", "LA") or (
            image.mode == "P" and "transparency" in image.info
        ):
            rgba = image.convert("RGBA")
            background = Image.new("RGB", rgba.size, "white")
            background.paste(rgba, mask=rgba.getchannel("A"))
            image = background
        else:
            image = image.convert("RGB")

        images.append(image)

    if not images:
        raise ValueError(message(language, "no_images"))

    return images


def build_pdf(images: list[Image.Image]) -> BytesIO:
    output = BytesIO()

    first, *rest = images
    first.save(
        output,
        format="PDF",
        save_all=True,
        append_images=rest,
        resolution=150.0,
    )

    output.seek(0)
    return output


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/create-pdf")
def create_pdf():
    language = get_request_language()
    try:
        uploaded_files = request.files.getlist("images")
        images = load_images(uploaded_files, language)
        pdf = build_pdf(images)

        return send_file(
            pdf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="images.pdf",
        )
    except ValueError as exc:
        return render_template("index.html", error=str(exc)), 400


@app.errorhandler(413)
def too_large(_error):
    language = get_request_language()
    return render_template(
        "index.html",
        error=message(language, "too_large"),
    ), 413


def run_desktop_app() -> None:
    server = make_server("127.0.0.1", 0, app)
    url = f"http://127.0.0.1:{server.server_port}"
    print(f"Image2PDF is running at {url}")
    print("Close this window or press Ctrl+C to stop the application.")
    Timer(1.0, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()


if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        run_desktop_app()
    else:
        host = os.environ.get("HOST", "127.0.0.1")
        port = int(os.environ.get("PORT", "5000"))
        debug = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
        app.run(host=host, port=port, debug=debug)
