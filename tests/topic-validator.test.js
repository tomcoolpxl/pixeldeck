/**
 * Topic JSON Validation Tests
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const topicsDir = join(__dirname, '..', 'topics');

/**
 * Validate a topic JSON structure
 */
function validateTopic(topic, topicId) {
    const errors = [];

    // Required top-level fields
    if (!topic.id) errors.push('Missing required field: id');
    if (!topic.title) errors.push('Missing required field: title');
    if (!topic.slides || !Array.isArray(topic.slides)) {
        errors.push('Missing or invalid field: slides (must be array)');
        return errors;
    }

    if (topic.slides.length === 0) {
        errors.push('Topic must have at least one slide');
    }

    // Validate each slide
    topic.slides.forEach((slide, slideIndex) => {
        const slidePrefix = `slides[${slideIndex}]`;

        if (!slide.id) errors.push(`${slidePrefix}: Missing required field: id`);
        if (!slide.title) errors.push(`${slidePrefix}: Missing required field: title`);
        if (!slide.diagram) errors.push(`${slidePrefix}: Missing required field: diagram`);

        if (!slide.steps || !Array.isArray(slide.steps)) {
            errors.push(`${slidePrefix}: Missing or invalid field: steps (must be array)`);
            return;
        }

        if (slide.steps.length === 0) {
            errors.push(`${slidePrefix}: Slide must have at least one step`);
        }

        // Validate each step
        slide.steps.forEach((step, stepIndex) => {
            const stepPrefix = `${slidePrefix}.steps[${stepIndex}]`;

            if (!step.id) errors.push(`${stepPrefix}: Missing required field: id`);
            if (!step.ui) {
                errors.push(`${stepPrefix}: Missing required field: ui`);
            } else {
                if (!step.ui.title) errors.push(`${stepPrefix}.ui: Missing required field: title`);
                if (!step.ui.phase) errors.push(`${stepPrefix}.ui: Missing required field: phase`);
            }

            // Validate animations if present
            if (step.animations && Array.isArray(step.animations)) {
                step.animations.forEach((anim, animIndex) => {
                    const animPrefix = `${stepPrefix}.animations[${animIndex}]`;
                    if (!anim.type) {
                        errors.push(`${animPrefix}: Missing required field: type`);
                    } else {
                        const validTypes = ['camera', 'packet', 'setValue', 'pulse', 'wait'];
                        if (!validTypes.includes(anim.type)) {
                            errors.push(`${animPrefix}: Invalid animation type: ${anim.type}`);
                        }
                    }
                });
            }
        });
    });

    return errors;
}

/**
 * Check that referenced diagram file exists
 */
function validateDiagramExists(topic, topicPath) {
    const errors = [];

    topic.slides.forEach((slide, index) => {
        if (slide.diagram) {
            const diagramPath = join(topicPath, slide.diagram);
            if (!existsSync(diagramPath)) {
                errors.push(`slides[${index}]: Diagram file not found: ${slide.diagram}`);
            }
        }
    });

    return errors;
}

describe('Topic Validation', () => {
    // Get all topic directories
    const topicDirs = readdirSync(topicsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    test('topics directory should exist', () => {
        expect(existsSync(topicsDir)).toBe(true);
    });

    test('should have at least one topic', () => {
        expect(topicDirs.length).toBeGreaterThan(0);
    });

    // Test each topic
    topicDirs.forEach(topicId => {
        describe(`Topic: ${topicId}`, () => {
            const topicPath = join(topicsDir, topicId);
            const topicJsonPath = join(topicPath, 'topic.json');

            test('should have topic.json file', () => {
                expect(existsSync(topicJsonPath)).toBe(true);
            });

            test('topic.json should be valid JSON', () => {
                const content = readFileSync(topicJsonPath, 'utf-8');
                expect(() => JSON.parse(content)).not.toThrow();
            });

            test('topic.json should have valid structure', () => {
                const content = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(content);
                const errors = validateTopic(topic, topicId);

                if (errors.length > 0) {
                    console.error(`Validation errors for ${topicId}:`, errors);
                }
                expect(errors).toEqual([]);
            });

            test('topic id should match directory name', () => {
                const content = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(content);
                expect(topic.id).toBe(topicId);
            });

            test('referenced diagram files should exist', () => {
                const content = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(content);
                const errors = validateDiagramExists(topic, topicPath);

                if (errors.length > 0) {
                    console.error(`Missing diagrams for ${topicId}:`, errors);
                }
                expect(errors).toEqual([]);
            });
        });
    });
});

describe('Animation Definitions', () => {
    test('camera animation should have "to" array with 4 numbers', () => {
        const validCamera = { type: 'camera', to: [0, 0, 1600, 900] };
        expect(validCamera.to).toHaveLength(4);
        expect(validCamera.to.every(n => typeof n === 'number')).toBe(true);
    });

    test('packet animation should have paths array', () => {
        const validPacket = {
            type: 'packet',
            text: 'DATA',
            from: [100, 200],
            paths: ['#path1', '#path2']
        };
        expect(Array.isArray(validPacket.paths)).toBe(true);
    });

    test('setValue animation should have target and value', () => {
        const validSetValue = {
            type: 'setValue',
            target: 'val_test',
            value: 'new value'
        };
        expect(validSetValue.target).toBeDefined();
        expect(validSetValue.value).toBeDefined();
    });

    test('pulse animation should have target', () => {
        const validPulse = { type: 'pulse', target: '#node_test' };
        expect(validPulse.target).toBeDefined();
    });
});
