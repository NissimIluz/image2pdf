from __future__ import annotations

import hashlib
from pathlib import Path
import tempfile
import unittest

from scripts import prepare_release


class ReleasePreparationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.root = Path(self.temporary_directory.name)

        self.original_release_directory = prepare_release.RELEASE_DIR
        self.original_windows_source = prepare_release.PLATFORMS["windows"]["source"]
        prepare_release.RELEASE_DIR = self.root / "release"
        prepare_release.PLATFORMS["windows"]["source"] = self.root / "Image2PDF.exe"
        self.addCleanup(self.restore_configuration)

    def restore_configuration(self) -> None:
        prepare_release.RELEASE_DIR = self.original_release_directory
        prepare_release.PLATFORMS["windows"]["source"] = self.original_windows_source

    def test_prepare_creates_executable_checksum_and_notices(self) -> None:
        source = Path(prepare_release.PLATFORMS["windows"]["source"])
        source.write_bytes(b"test executable")

        executable, checksum, notices = prepare_release.prepare("windows")

        self.assertEqual(executable.name, "Image2PDF-Windows.exe")
        self.assertEqual(executable.read_bytes(), b"test executable")
        expected_digest = hashlib.sha256(b"test executable").hexdigest()
        self.assertEqual(
            checksum.read_text(encoding="utf-8"),
            f"{expected_digest}  Image2PDF-Windows.exe\n",
        )
        self.assertIn("Platform: Windows", notices.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
