# 3D Rack Builder

This repository contains a simple Three.js based demo that lets you design a server rack layout in the browser.

Open `index.html` in a modern browser. Use the form in the top left corner to choose an equipment type, label, starting rack unit and height in U. Click **Add Equipment** to place the item in the virtual rack. 

Equipment types are rendered with different colors:

- Servers: gray
- Routers: blue
- Patch panels: green
- Blanking plates: black

The page loads Three.js from a CDN, so just open [proj.peter.lol](https://proj.peter.lol) in your browser to try the demo.
If you want to run it locally, serve the files using an HTTP server such as:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/index.html`.