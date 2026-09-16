from __future__ import annotations

from io import BytesIO
import unittest

from PIL import Image

from app import app


def png_file(color: str, filename: str) -> tuple[BytesIO, str]:
    stream = BytesIO()
    Image.new("RGB", (16, 16), color).save(stream, format="PNG")
    stream.seek(0)
    return stream, filename


class Image2PDFTests(unittest.TestCase):
    def setUp(self) -> None:
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_index_and_static_assets_are_available(self) -> None:
        responses = [
            self.client.get("/"),
            self.client.get("/static/app.js"),
            self.client.get("/static/style.css"),
        ]
        try:
            self.assertTrue(all(response.status_code == 200 for response in responses))
        finally:
            for response in responses:
                response.close()

    def test_empty_upload_is_localized_in_english(self) -> None:
        response = self.client.post(
            "/create-pdf?lang=en",
            data={"lang": "en"},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn(b"No images were selected.", response.data)

    def test_empty_upload_is_localized_in_hebrew(self) -> None:
        response = self.client.post(
            "/create-pdf?lang=he",
            data={"lang": "he"},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("לא נבחרו תמונות.".encode(), response.data)

    def test_unsupported_extension_is_rejected(self) -> None:
        response = self.client.post(
            "/create-pdf?lang=en",
            data={
                "lang": "en",
                "images": (BytesIO(b"plain text"), "notes.txt"),
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn(b"not in a supported format", response.data)

    def test_multiple_images_create_a_pdf(self) -> None:
        response = self.client.post(
            "/create-pdf?lang=en",
            data={
                "lang": "en",
                "images": [
                    png_file("red", "first.png"),
                    png_file("blue", "second.png"),
                ],
            },
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "application/pdf")
        self.assertTrue(response.data.startswith(b"%PDF-"))
        self.assertIn("images.pdf", response.headers["Content-Disposition"])


if __name__ == "__main__":
    unittest.main()
