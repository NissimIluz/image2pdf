# Contributing to Image2PDF

Thank you for considering a contribution. Bug reports, documentation fixes,
translations, tests, and code improvements are welcome.

## Development Setup

1. Fork and clone the repository.
2. Create a virtual environment.
3. Install the runtime dependencies:

   ```bash
   python -m pip install -r requirements.txt
   ```

4. Run the application:

   ```bash
   python app.py
   ```

5. Open `http://localhost:5000`.

## Before Submitting a Pull Request

Run the automated tests and syntax checks:

```bash
python -m unittest discover -s tests -v
python -m py_compile app.py create.py scripts/prepare_release.py
node --check static/app.js
```

Please also verify the affected workflow manually in both English and Hebrew.
For interface changes, check a desktop and a narrow mobile viewport.

## Pull Requests

- Keep each pull request focused on one change.
- Explain the problem and the chosen solution.
- Add or update tests when behavior changes.
- Update the README when commands, features, or supported platforms change.
- Do not commit generated `build/`, `dist/`, or `release/` directories.
- Only include images and other assets that you have permission to distribute.

## Translations

English and Hebrew strings are stored in `static/app.js`. Add a value to every
language whenever a translation key is introduced. Server-side validation
messages are stored in `app.py` and must remain aligned with the interface.

## Licensing

By submitting a contribution, you agree that it may be distributed under the
project's MIT License. Third-party code or assets must retain their original
license notices and must be compatible with this project.
