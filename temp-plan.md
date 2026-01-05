This is an exciting next step for PixelDeck. Moving from the high-level architecture down to the fundamental building blocks creates a cohesive learning path.

To maintain the tone of the CPU lesson, we will use:

1. **Consistent Visuals:** The same glowing lines, color palettes, and the "data packet" animation style.
2. **Analogy-Driven Text:** Explaining complex electronic concepts using simpler mechanical metaphors (like water pipes or toll booths).
3. **Focus on Function, not Physics:** We will treat a transistor purely as an electrically controlled switch, ignoring semiconductor physics.

Here is the complete setup for the new topic.

### 1. Directory Structure

Create the folder: `topics/logic-gates/`

### 2. diagram.svg

This SVG visualizes two separate circuits side-by-side: an AND gate (series circuit) on the left, and an OR gate (parallel circuit) on the right.

We introduce a new visual element: The **Transistor "Gate"**. It's a barrier in the wire that slides out of the way when activated by an input signal.

**Save as: `topics/logic-gates/diagram.svg**`

```xml
<svg id="main-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="glow-blue"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-pink"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-green"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-power"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    <rect x="100" y="50" width="1400" height="40" rx="10" fill="#fde047" filter="url(#glow-power)" opacity="0.8"/>
    <text x="800" y="75" fill="#A16207" font-size="20" font-weight="bold" text-anchor="middle">+ POWER SOURCE (CURRENT)</text>

    <g id="grp_and_gate" transform="translate(200, 0)">
        <text x="200" y="150" fill="#fff" font-size="36" font-weight="bold" text-anchor="middle">AND GATE (Series)</text>
        <text x="200" y="180" fill="#94a3b8" font-size="18" text-anchor="middle">Both A AND B must be ON</text>

        <path id="path_and_pwr_to_a" class="wire" d="M 200 90 L 200 250" stroke="#38bdf8" stroke-width="6"/>
        <path id="path_and_a_to_b"   class="wire" d="M 200 350 L 200 500" stroke="#38bdf8" stroke-width="6"/>
        <path id="path_and_b_to_out" class="wire" d="M 200 600 L 200 750" stroke="#38bdf8" stroke-width="6"/>

        <g id="node_trx_and_a" transform="translate(100, 250)">
            <rect class="comp-bg type-blue" x="-80" y="20" width="80" height="60" rx="8" filter="url(#glow-blue)"/>
            <text class="comp-label text-blue" x="-40" y="45" text-anchor="middle">INPUT A</text>
            <text id="val_input_a_and" class="comp-val" x="-40" y="70" text-anchor="middle">0</text>
            <line x1="0" y1="50" x2="50" y2="50" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5 3"/>
            <rect x="50" y="0" width="100" height="100" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <g id="gate_barrier_and_a">
                 <rect x="60" y="35" width="80" height="30" rx="4" fill="#f472b6" filter="url(#glow-pink)"/>
                 <text x="100" y="55" fill="#701a45" font-size="12" font-weight="bold" text-anchor="middle">GATE A</text>
            </g>
        </g>

        <g id="node_trx_and_b" transform="translate(100, 500)">
            <rect class="comp-bg type-blue" x="-80" y="20" width="80" height="60" rx="8" filter="url(#glow-blue)"/>
            <text class="comp-label text-blue" x="-40" y="45" text-anchor="middle">INPUT B</text>
            <text id="val_input_b_and" class="comp-val" x="-40" y="70" text-anchor="middle">0</text>
            <line x1="0" y1="50" x2="50" y2="50" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5 3"/>
            <rect x="50" y="0" width="100" height="100" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
             <g id="gate_barrier_and_b">
                 <rect x="60" y="35" width="80" height="30" rx="4" fill="#f472b6" filter="url(#glow-pink)"/>
                 <text x="100" y="55" fill="#701a45" font-size="12" font-weight="bold" text-anchor="middle">GATE B</text>
            </g>
        </g>

        <g id="node_led_and" transform="translate(150, 750)">
             <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <circle id="led_bulb_and" cx="50" cy="50" r="30" fill="#065f46"/>
            <text x="50" y="110" fill="#94a3b8" font-size="16" font-weight="bold" text-anchor="middle">OUTPUT</text>
            <text id="val_output_and" x="50" y="55" fill="#fff" font-size="18" font-weight="bold" text-anchor="middle">OFF</text>
        </g>
    </g>


    <g id="grp_or_gate" transform="translate(900, 0)">
        <text x="300" y="150" fill="#fff" font-size="36" font-weight="bold" text-anchor="middle">OR GATE (Parallel)</text>
        <text x="300" y="180" fill="#94a3b8" font-size="18" text-anchor="middle">Either A OR B must be ON</text>

        <path id="path_or_pwr_split" class="wire" d="M 300 90 L 300 200 M 300 200 L 100 200 L 100 250 M 300 200 L 500 200 L 500 250" stroke="#38bdf8" stroke-width="6" fill="none"/>

        <path id="path_or_branch_a" class="wire" d="M 100 350 L 100 600" stroke="#38bdf8" stroke-width="6"/>
        <path id="path_or_branch_b" class="wire" d="M 500 350 L 500 600" stroke="#38bdf8" stroke-width="6"/>

        <path id="path_or_join_out" class="wire" d="M 100 600 L 100 650 L 500 650 L 500 600 M 300 650 L 300 750" stroke="#38bdf8" stroke-width="6" fill="none"/>


        <g id="node_trx_or_a" transform="translate(0, 250)">
            <rect class="comp-bg type-yellow" x="-80" y="20" width="80" height="60" rx="8" filter="url(#glow-yellow)"/>
            <text class="comp-label text-yellow" x="-40" y="45" text-anchor="middle">INPUT A</text>
            <text id="val_input_a_or" class="comp-val" x="-40" y="70" text-anchor="middle">0</text>
            <line x1="0" y1="50" x2="50" y2="50" stroke="#fde047" stroke-width="3" stroke-dasharray="5 3"/>
            <rect x="50" y="0" width="100" height="100" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
             <g id="gate_barrier_or_a">
                 <rect x="60" y="35" width="80" height="30" rx="4" fill="#fde047" filter="url(#glow-yellow)"/>
                 <text x="100" y="55" fill="#713f12" font-size="12" font-weight="bold" text-anchor="middle">GATE A</text>
            </g>
        </g>

        <g id="node_trx_or_b" transform="translate(400, 250)">
            <rect class="comp-bg type-yellow" x="180" y="20" width="80" height="60" rx="8" filter="url(#glow-yellow)"/>
            <text class="comp-label text-yellow" x="220" y="45" text-anchor="middle">INPUT B</text>
            <text id="val_input_b_or" class="comp-val" x="220" y="70" text-anchor="middle">0</text>
            <line x1="150" y1="50" x2="180" y2="50" stroke="#fde047" stroke-width="3" stroke-dasharray="5 3"/>
            <rect x="50" y="0" width="100" height="100" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2"/>
             <g id="gate_barrier_or_b">
                 <rect x="60" y="35" width="80" height="30" rx="4" fill="#fde047" filter="url(#glow-yellow)"/>
                 <text x="100" y="55" fill="#713f12" font-size="12" font-weight="bold" text-anchor="middle">GATE B</text>
            </g>
        </g>

        <g id="node_led_or" transform="translate(250, 750)">
            <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <circle id="led_bulb_or" cx="50" cy="50" r="30" fill="#065f46"/>
            <text x="50" y="110" fill="#94a3b8" font-size="16" font-weight="bold" text-anchor="middle">OUTPUT</text>
            <text id="val_output_or" x="50" y="55" fill="#fff" font-size="18" font-weight="bold" text-anchor="middle">OFF</text>
        </g>
    </g>

    <g id="packet-grp" style="display:none">
        <rect class="packet-bg" x="-30" y="-15" width="60" height="30" rx="15" fill="#fde047" filter="url(#glow-power)"/>
        <path class="packet-text" d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#713f12" stroke-width="3"/>
    </g>
</svg>

```

### 3. topic.json

This defines the narrative arc. It introduces the transistor concept using the top half of the AND gate, then demonstrates the AND logic, and finally pans over to demonstrate the OR logic.

**Save as: `topics/logic-gates/topic.json**`

```json
{
  "id": "logic-gates",
  "title": "Transistors & Logic Gates",
  "description": "Building digital logic (AND/OR) using transistor switches.",
  "slides": [
    {
      "id": "slide-and-gate",
      "title": "The Transistor & AND Logic",
      "diagram": "diagram.svg",
      "components": {
        "val_input_a_and": "0",
        "val_input_b_and": "0",
        "val_output_and": "OFF",
        "gate_barrier_and_a": { "transform": "translate(0,0)" },
        "gate_barrier_and_b": { "transform": "translate(0,0)" }
      },
      "steps": [
        {
          "id": "intro-transistor",
          "ui": {
            "phase": "BUILDING BLOCK",
            "title": "The Transistor as a Switch",
            "description": "Before we build complex logic, we need a switch. This is a <span class='hl'>Transistor</span>.<br><br>Think of it like a toll gate. When the Input is <b>0 (OFF)</b>, the gate is down, blocking the current from the power source above.",
            "noteTitle": "The Digital World",
            "note": "Computers only understand two states: On (1) and Off (0). Transistors are the physical devices that create these states by controlling the flow of electricity."
          },
          "initialState": {
             "val_input_a_and": "0",
             "gate_barrier_and_a": { "transform": "translate(0,0)" }
          },
          "animations": [
            { "type": "camera", "to": [250, 200, 500, 300] },
            { "type": "pulse", "target": "#node_trx_and_a" }
          ]
        },
        {
          "id": "transistor-on",
          "ui": {
            "phase": "ACTION",
            "title": "Opening the Gate",
            "description": "When we change the Input to <b>1 (ON)</b>, it applies a small signal that opens the gate.<br><br>Watch how the barrier slides away, allowing current to pass through.",
             "noteTitle": "No Moving Parts",
             "note": "In a real silicon chip, nothing actually moves physically. The 'gate' opens using electrical fields that allow electrons to jump across a gap. We visualized it as a sliding barrier to make it easier to understand."
          },
          "finalState": {
            "val_input_a_and": "1",
            "gate_barrier_and_a": { "transform": "translate(85,0)" }
          },
          "animations": [
            { "type": "setValue", "target": "val_input_a_and", "value": "1" },
            { "type": "wait", "duration": 0.3 },
            { "type": "anim", "target": "#gate_barrier_and_a", "to": { "transform": "translate(85,0)" }, "duration": 1.0 },
            {
              "type": "packet",
              "from": [400, 90],
              "paths": [ "#path_and_pwr_to_a", "#path_and_a_to_b" ]
            }
          ]
        },
        {
          "id": "and-gate-intro",
          "ui": {
            "phase": "AND GATE",
            "title": "The Series Circuit",
            "description": "Now, let's stack two transistors one after another. This creates an <span class='hl'>AND Gate</span>.<br><br>Currently, Input A is ON, but Input B is OFF. The current gets past the first gate but is blocked by the second.",
            "noteTitle": "Why is it called 'AND'?",
            "note": "Because for the current to reach the bottom, you need Input A <b>AND</b> Input B to be open."
          },
          "finalState": {
             "val_input_a_and": "1",
             "val_input_b_and": "0",
             "gate_barrier_and_a": { "transform": "translate(85,0)" },
             "gate_barrier_and_b": { "transform": "translate(0,0)" }
          },
          "animations": [
            { "type": "camera", "to": [150, 100, 700, 800] },
             {
              "type": "packet",
              "from": [400, 90],
              "paths": [
                "#path_and_pwr_to_a",
                { "path": "#path_and_a_to_b", "end": 0.5 }
              ]
            },
             { "type": "pulse", "target": "#node_trx_and_b" }
          ]
        },
        {
          "id": "and-gate-complete",
          "ui": {
            "phase": "AND GATE",
            "title": "Completing the Circuit",
            "description": "Let's turn Input B ON (1).<br><br>Now both gates are open. The current flows all the way from the power source to the Output, turning it ON.",
             "noteTitle": "Truth Table",
             "note": "A=0, B=0 → OFF<br>A=1, B=0 → OFF<br>A=0, B=1 → OFF<br><b>A=1, B=1 → ON</b>"
          },
           "finalState": {
             "val_input_b_and": "1",
             "gate_barrier_and_b": { "transform": "translate(85,0)" },
             "val_output_and": "ON",
             "led_bulb_and": { "fill": "#10b981", "filter": "url(#glow-green)" }
          },
          "animations": [
            { "type": "setValue", "target": "val_input_b_and", "value": "1" },
            { "type": "wait", "duration": 0.3 },
            { "type": "anim", "target": "#gate_barrier_and_b", "to": { "transform": "translate(85,0)" }, "duration": 1.0 },
             {
              "type": "packet",
              "from": [400, 350],
              "paths": [ "#path_and_a_to_b", "#path_and_b_to_out" ]
            },
            { "type": "pulse", "target": "#node_led_and" },
            { "type": "setValue", "target": "val_output_and", "value": "ON" },
            { "type": "anim", "target": "#led_bulb_and", "to": { "fill": "#10b981", "filter": "url(#glow-green)" }, "duration": 0.5 }
          ]
        }
      ]
    },
    {
      "id": "slide-or-gate",
      "title": "The OR Logic Gate",
      "diagram": "diagram.svg",
      "components": {
        "val_input_a_or": "0",
        "val_input_b_or": "0",
        "val_output_or": "OFF",
        "gate_barrier_or_a": { "transform": "translate(0,0)" },
        "gate_barrier_or_b": { "transform": "translate(0,0)" },
        "led_bulb_or": { "fill": "#065f46", "filter": "none" }
      },
      "steps": [
        {
          "id": "or-gate-intro",
          "ui": {
            "phase": "OR GATE",
            "title": "The Parallel Circuit",
            "description": "This is an <span class='hl'>OR Gate</span>. Instead of stacking transistors in a line, we place them side-by-side (in parallel).<br><br>The current splits and has two possible paths to reach the output.",
            "noteTitle": "Why 'OR'?",
            "note": "The output turns ON if Input A <b>OR</b> Input B (or both!) are open."
          },
          "animations": [
            { "type": "camera", "to": [850, 100, 1000, 800] },
            {
              "type": "packet",
              "from": [1200, 90],
              "paths": [
                { "path": "#path_or_pwr_split", "end": 0.3 }
              ]
            }
          ]
        },
        {
          "id": "or-gate-path-a",
          "ui": {
            "phase": "PATH A",
            "title": "Input A is ON",
            "description": "Let's turn on just Input A.<br><br>The current takes the left path through Transistor A and reaches the output.",
             "noteTitle": null,
             "note": null
          },
          "finalState": {
             "val_input_a_or": "1",
             "gate_barrier_or_a": { "transform": "translate(85,0)" },
             "val_output_or": "ON",
             "led_bulb_or": { "fill": "#10b981", "filter": "url(#glow-green)" }
          },
          "animations": [
            { "type": "setValue", "target": "val_input_a_or", "value": "1" },
            { "type": "anim", "target": "#gate_barrier_or_a", "to": { "transform": "translate(85,0)" }, "duration": 0.8 },
            {
              "type": "packet",
              "from": [1200, 90],
              "paths": [
                 { "path": "#path_or_pwr_split", "end": 0.45 },
                 "#path_or_branch_a",
                 { "path": "#path_or_join_out", "start": 0, "end": 0.5 }
              ]
            },
            { "type": "pulse", "target": "#node_led_or" },
             { "type": "setValue", "target": "val_output_or", "value": "ON" },
            { "type": "anim", "target": "#led_bulb_or", "to": { "fill": "#10b981", "filter": "url(#glow-green)" }, "duration": 0.5 }
          ]
        },
        {
          "id": "or-gate-path-b",
          "ui": {
            "phase": "PATH B",
            "title": "Switching Paths",
            "description": "Now we turn Input A OFF, and turn Input B ON.<br><br>The first path is blocked, but the current simply takes the second path through Transistor B. The output stays ON.",
             "noteTitle": "Truth Table",
             "note": "A=0, B=0 → OFF<br>A=1, B=0 → ON<br>A=0, B=1 → ON<br>A=1, B=1 → ON"
          },
           "finalState": {
             "val_input_a_or": "0",
             "val_input_b_or": "1",
             "gate_barrier_or_a": { "transform": "translate(0,0)" },
             "gate_barrier_or_b": { "transform": "translate(85,0)" },
             "val_output_or": "ON",
             "led_bulb_or": { "fill": "#10b981", "filter": "url(#glow-green)" }
          },
          "animations": [
             // Reset A
            { "type": "setValue", "target": "val_input_a_or", "value": "0" },
            { "type": "anim", "target": "#gate_barrier_or_a", "to": { "transform": "translate(0,0)" }, "duration": 0.5 },
            { "type": "wait", "duration": 0.3 },
             // Set B
            { "type": "setValue", "target": "val_input_b_or", "value": "1" },
            { "type": "anim", "target": "#gate_barrier_or_b", "to": { "transform": "translate(85,0)" }, "duration": 0.8 },
             // Animate Packet down path B
            {
              "type": "packet",
              "from": [1200, 90],
              "paths": [
                 { "path": "#path_or_pwr_split", "start": 0, "end": 0.3 },
                 { "path": "#path_or_pwr_split", "start": 0.6, "end": 1.0 },
                 "#path_or_branch_b",
                 { "path": "#path_or_join_out", "start": 0.5, "end": 1.0 }
              ]
            },
            { "type": "pulse", "target": "#node_led_or" }
          ]
        },
         {
          "id": "conclusion",
          "ui": {
            "phase": "CONCLUSION",
            "title": "Building Complexity",
            "description": "By arranging these simple electrical switches in series (AND) or parallel (OR), we can create decision-making circuits.<br><br>Modern CPUs contain billions of tiny transistors arranged into millions of these gates to perform complex calculations.",
             "noteTitle": null,
             "note": null
          },
          "animations": [
            { "type": "camera", "to": [0, 0, 1600, 900] }
          ]
        }
      ]
    }
  ]
}

```