# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PixelDeck** - Educational presentation system with interactive animated visualizations. Supports multiple topics, each containing slides with step-by-step animations. Currently includes CPU Architecture (Von Neumann fetch-execute cycle).

## Project Structure

```
/
├── index.html              # Topic selector home page
├── viewer.html             # Universal presentation viewer
├── css/
│   └── main.css            # Shared styles
├── js/
│   ├── app.js              # Main entry point
│   └── engine/
│       ├── state-machine.js    # Navigation state management
│       ├── animator.js         # GSAP animation helpers
│       ├── ui-controller.js    # Sidebar/controls updates
│       └── topic-loader.js     # Loads topic JSON + SVG
├── topics/
│   └── cpu-architecture/
│       ├── topic.json          # Topic definition (slides, steps, animations)
│       └── diagram.svg         # SVG diagram
├── assets/img/             # Static assets
└── cpu.html                # Legacy standalone version (deprecated)
```

## Running Locally

Requires a local server due to ES modules. Options:
- `npx serve .` (Node.js)
- `python -m http.server 8000` (Python 3)
- VS Code Live Server extension

Then open `http://localhost:PORT/` for topic selector, or `http://localhost:PORT/viewer.html#cpu-architecture` for direct topic access.

## Running Tests

```bash
npm install
npm test
```

Tests cover:
- State machine navigation logic (30 tests)
- Topic JSON validation (10 tests)
- Validates all topics in `topics/` directory

## Content Hierarchy

```
Topic (e.g., cpu-architecture)
  └── Slides (e.g., fetch-execute)
        └── Steps (intro, fetch-address, decode, execute, store)
              └── Animations (camera, packet, setValue, pulse)
```

## Adding New Topics

1. Create folder: `topics/{topic-id}/`
2. Create `topic.json` with slides, steps, and animations
3. Create `diagram.svg` with component elements
4. Topic auto-appears on index page

## Animation Types (topic.json)

- `camera`: Pan/zoom via SVG viewBox. `{"type": "camera", "to": [x, y, width, height]}`
- `packet`: Animate data packet along paths. `{"type": "packet", "text": "DATA", "from": [x,y], "paths": [...]}`
- `setValue`: Change text element. `{"type": "setValue", "target": "element_id", "value": "new text"}`
- `pulse`: Visual highlight effect. `{"type": "pulse", "target": "#node_id"}`

## Key Engine Components

- **StateMachine** (`js/engine/state-machine.js`): Tracks topic/slide/step indices, handles navigation logic (next, prev, replay)
- **Animator** (`js/engine/animator.js`): Interprets animation definitions, builds GSAP timelines
- **UIController** (`js/engine/ui-controller.js`): Updates sidebar content, progress display, button states
- **TopicLoader** (`js/engine/topic-loader.js`): Fetches topic.json, injects SVG diagrams

## Keyboard Shortcuts

- Right Arrow: Next step
- Left Arrow: Previous step
- Space: Replay current step
