# AGENTS instructions

These guidelines apply to the entire repository.

## Coding Style
- Indent HTML, CSS, and JavaScript with four spaces.
- Terminate JavaScript statements with semicolons.

## Pull Requests
- Summaries must briefly explain the code changes.
- Include a **Testing** section summarizing `npm test` and `pytest` results.
- If tests fail because of missing dependencies or other environment problems, mention it.

## Testing
- Run `npm install` to install Node dependencies.
- Execute `npm test` for JavaScript tests.
- Run `pytest` for Python tests.
- Note in the PR if no tests are present or if you encounter environment issues.
- `npm run browser-test` opens `index.html` in headless Chrome and prints console output while filtering WebGL/OpenGL warnings.

## Prerequisites
- Ensure Node.js (version 18 or higher) and npm are installed.
- `npm install` retrieves the `puppeteer` dependency for the browser test.

## Browser Test
- `npm run browser-test` launches a headless Chrome instance.
- A successful run prints `BROWSER log: Starting App` with no `PAGE ERROR` lines.
