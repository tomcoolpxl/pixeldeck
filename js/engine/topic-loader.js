/**
 * Topic Loader - Fetches and processes topic data
 */

export class TopicLoader {
    constructor(basePath = 'topics') {
        this.basePath = basePath;
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
     * Inject SVG into the stage
     */
    injectDiagram(svgText, stageElement) {
        stageElement.innerHTML = svgText;

        // Return reference to SVG element
        return stageElement.querySelector('svg');
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
