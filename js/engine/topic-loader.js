/**
 * Topic Loader - Fetches and processes topic data
 */

export class TopicLoader {
    constructor(basePath = 'topics') {
        this.basePath = basePath;
        this.capturedInitialState = null;
    }

    /**
     * Load a topic by ID
     */
    async loadTopic(topicId) {
        const topicPath = `${this.basePath}/${topicId}`;

        // Load topic.json
        const response = await fetch(`${topicPath}/topic.json`);
        if (!response.ok) {
            throw new Error(`Failed to load topic: ${topicId}`);
        }

        const topicData = await response.json();
        topicData.basePath = topicPath;

        return topicData;
    }

    /**
     * Load SVG diagram for a slide
     */
    async loadDiagram(topicData, slide) {
        const diagramPath = `${topicData.basePath}/${slide.diagram}`;

        const response = await fetch(diagramPath);
        if (!response.ok) {
            throw new Error(`Failed to load diagram: ${slide.diagram}`);
        }

        const svgText = await response.text();
        return svgText;
    }

    /**
     * Inject SVG into the stage and capture initial state
     */
    injectDiagram(svgText, stageElement) {
        stageElement.innerHTML = svgText;

        const svg = stageElement.querySelector('svg');

        // Automatically capture initial state of all dynamic text elements
        // This captures elements with IDs starting with 'val_' or class 'comp-val'
        this.capturedInitialState = this.captureInitialState(svg);

        return svg;
    }

    /**
     * Capture the initial text content of all dynamic elements in the SVG
     * Looks for elements with IDs starting with 'val_' or with class 'comp-val'
     */
    captureInitialState(svg) {
        const state = {};

        // Capture all elements with IDs starting with 'val_'
        const valElements = svg.querySelectorAll('[id^="val_"]');
        valElements.forEach(el => {
            state[el.id] = el.textContent;
        });

        // Also capture elements with class 'comp-val' that have IDs
        const compValElements = svg.querySelectorAll('.comp-val[id]');
        compValElements.forEach(el => {
            state[el.id] = el.textContent;
        });

        return state;
    }

    /**
     * Reset all dynamic elements to their initial captured state
     * Then apply any slide-specific component overrides
     */
    resetToInitialState(slide) {
        // First restore the captured SVG initial state
        if (this.capturedInitialState) {
            Object.entries(this.capturedInitialState).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = value;
                }
            });
        }

        // Then apply slide-specific component overrides (if any)
        if (slide && slide.components) {
            Object.entries(slide.components).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = value;
                }
            });
        }
    }

    /**
     * Apply initial component values for a slide
     */
    applyInitialValues(slide) {
        if (!slide.components) return;

        Object.entries(slide.components).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
            }
        });
    }

    /**
     * Compute the cumulative state up to (but not including) a given step
     * This is used for replaying or jumping to a step
     */
    computeStateAtStep(slide, stepIndex) {
        // Start with slide's initial components
        const state = { ...slide.components };

        // Apply each step's finalState up to (but not including) the target step
        for (let i = 0; i < stepIndex; i++) {
            const step = slide.steps[i];
            if (step.finalState) {
                Object.assign(state, step.finalState);
            }
        }

        return state;
    }

    /**
     * List available topics (for index page)
     * This would typically load from a topics.json manifest
     */
    async listTopics() {
        try {
            const response = await fetch(`${this.basePath}/index.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            // Fall back to hardcoded list if no index exists
        }

        // Fallback: return known topics
        return [
            {
                id: 'cpu-architecture',
                title: 'CPU Architecture',
                description: 'Von Neumann fetch-execute cycle visualization'
            }
        ];
    }
}
