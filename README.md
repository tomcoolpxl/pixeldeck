# PixelDeck

Interactive animated visualizations for learning.

**Live Demo:** [https://tomcoolpxl.github.io/pixeldeck/](https://tomcoolpxl.github.io/pixeldeck/)

## Features

- Step-by-step animated presentations
- Multiple topics support
- Dark and light themes
- Keyboard navigation
- Works offline (static files)
- GitHub Pages ready

## Getting Started

### Running Locally

1. Clone the repository
2. Serve with any static file server:

```bash
# Using npx
npx serve .

# Using Python
python -m http.server 8000
```

3. Open `http://localhost:5000` (or your port)

### Running Tests

```bash
npm install
npm test
```

## Creating Your Own Slides

### 1. Create a Topic Folder

Create a new folder under `topics/` with your topic ID:

```
topics/
└── my-topic/
    ├── topic.json
    └── diagram.svg
```

### 2. Create the SVG Diagram

Create `diagram.svg` with your visual components. Each component that will be animated needs an `id`:

```svg
<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
    <!-- Wires/connections -->
    <path id="wire_a_to_b" class="wire" d="M 100 100 L 400 100" />

    <!-- Components -->
    <g id="node_a" transform="translate(50, 50)">
        <rect class="comp-bg type-blue" width="100" height="100" rx="8"/>
        <text class="comp-label text-blue" x="50" y="30">Node A</text>
        <text id="val_a" class="comp-val" x="50" y="70">--</text>
    </g>

    <!-- Data packet for animations -->
    <g id="packet-grp">
        <rect class="packet-bg" x="-40" y="-20" width="80" height="40" rx="10"/>
        <text id="packet-text" class="packet-text" x="0" y="0">DATA</text>
    </g>
</svg>
```

**CSS Classes:**
- `.wire` - Connection lines
- `.comp-bg` - Component background
- `.comp-label` - Component label text
- `.comp-val` - Component value text (animated)
- `.type-blue`, `.type-yellow`, `.type-pink` - Color variants
- `.text-blue`, `.text-yellow`, `.text-pink` - Text color variants

### 3. Create topic.json

Define your slides and steps:

```json
{
  "id": "my-topic",
  "title": "My Topic Title",
  "description": "Brief description for the index page",
  "slides": [
    {
      "id": "slide-1",
      "title": "First Slide",
      "diagram": "diagram.svg",
      "components": {
        "val_a": "initial",
        "val_b": "--"
      },
      "steps": [
        {
          "id": "intro",
          "ui": {
            "phase": "INTRODUCTION",
            "title": "Welcome",
            "description": "This is the intro step. Press <strong>Next</strong> to begin.",
            "noteTitle": "Overview",
            "note": "Additional context shown in the sidebar."
          },
          "animations": []
        },
        {
          "id": "step-1",
          "ui": {
            "phase": "PHASE 1",
            "title": "First Action",
            "description": "Something happens here.",
            "noteTitle": "Details",
            "note": "More information about this step."
          },
          "finalState": {
            "val_a": "done"
          },
          "animations": [
            { "type": "camera", "to": [0, 0, 800, 450] },
            { "type": "packet", "text": "DATA", "from": [100, 100], "paths": ["#wire_a_to_b"] },
            { "type": "pulse", "target": "#node_b" },
            { "type": "setValue", "target": "val_a", "value": "done" },
            { "type": "camera", "to": [0, 0, 1600, 900] }
          ]
        }
      ]
    }
  ]
}
```

### 4. Animation Types

#### Camera
Pan and zoom the viewport:
```json
{ "type": "camera", "to": [x, y, width, height] }
```

#### Packet
Animate a data packet along paths:
```json
{
  "type": "packet",
  "text": "DATA",
  "from": [startX, startY],
  "paths": [
    "#simple_path",
    { "path": "#path_id", "start": 0, "end": 1, "duration": 2.0 }
  ]
}
```

#### setValue
Change a text element's content:
```json
{ "type": "setValue", "target": "element_id", "value": "new text" }
```

#### Pulse
Highlight a component:
```json
{ "type": "pulse", "target": "#node_id" }
```

#### Wait
Pause between animations:
```json
{ "type": "wait", "duration": 0.5 }
```

### 5. Add to Index Page

Add your topic card to `index.html`:

```html
<a class="topic-card" href="./viewer.html#my-topic">
    <h2>My Topic Title</h2>
    <p>Brief description</p>
    <div class="meta">Click to start</div>
</a>
```

### Step Properties

| Property | Required | Description |
|----------|----------|-------------|
| `id` | Yes | Unique step identifier |
| `ui.phase` | Yes | Phase badge text (e.g., "PHASE 1") |
| `ui.title` | Yes | Step title |
| `ui.description` | Yes | HTML description in sidebar |
| `ui.noteTitle` | No | Title for the note box |
| `ui.note` | No | HTML content for note box |
| `initialState` | No | Component values at step start (for replay) |
| `finalState` | No | Component values after step completes |
| `animations` | No | Array of animation definitions |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| → | Next step |
| ← | Previous step |
| Space | Replay current step |
| Home | Restart topic |

## Project Structure

```
├── index.html              # Topic selector
├── viewer.html             # Presentation viewer
├── css/main.css            # Styles (dark/light themes)
├── js/
│   ├── app.js              # Main application
│   └── engine/
│       ├── state-machine.js
│       ├── animator.js
│       ├── ui-controller.js
│       └── topic-loader.js
├── topics/
│   └── {topic-id}/
│       ├── topic.json
│       └── diagram.svg
└── tests/                  # Jest tests
```

## License

MIT
