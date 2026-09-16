# Third-Party Notices

Image2PDF is licensed under the MIT License. It uses the following third-party
open-source projects. Each project remains subject to its own license.

| Project | Purpose | License |
| --- | --- | --- |
| Flask | Web application framework | BSD-3-Clause |
| Pillow | Image decoding and PDF generation | MIT-CMU |
| Gunicorn | Production WSGI server used by Docker | MIT |
| PyInstaller | Native executable builder | GPL-2.0-or-later with the PyInstaller Bootloader Exception |
| Werkzeug | WSGI utilities used by Flask | BSD-3-Clause |
| Jinja | HTML templates used by Flask | BSD-3-Clause |
| MarkupSafe | Escaping support used by Jinja | BSD-3-Clause |
| ItsDangerous | Signing utilities used by Flask | BSD-3-Clause |
| Click | Command-line utilities used by Flask | BSD-3-Clause |
| Blinker | Signals used by Flask | MIT |

PyInstaller's Bootloader Exception permits applications produced with its
bootloader to be distributed under the application's own license. PyInstaller
itself and modifications to PyInstaller remain subject to its own licensing
terms.

The executable build process generates a platform-specific
`THIRD_PARTY_LICENSES-<Platform>.txt` file from the packages installed on the
build runner. That file is distributed alongside each executable and contains
the available full license texts and package versions for that build.

This summary is provided for convenience. The generated platform-specific
license file and the license files shipped by the upstream projects are the
authoritative notices for redistributed dependencies.

## Upstream License Sources

- Flask: <https://flask.palletsprojects.com/en/stable/license/>
- Pillow: <https://github.com/python-pillow/Pillow/blob/main/LICENSE>
- Gunicorn: <https://github.com/benoitc/gunicorn/blob/master/LICENSE>
- PyInstaller: <https://github.com/pyinstaller/pyinstaller/blob/develop/COPYING.txt>
