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

/**
 * Parse transform="translate(x, y)" to get x, y values
 */
function parseTranslate(transform) {
    if (!transform) return { x: 0, y: 0 };
    const match = transform.match(/translate\s*\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
    if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return { x: 0, y: 0 };
}

/**
 * Extract bounding box from an SVG element string
 * Returns { x, y, width, height } or null if not determinable
 */
function extractBoundingBox(elementMatch, svgContent) {
    const result = { x: 0, y: 0, width: 0, height: 0 };

    // Check for transform on parent g element
    const transformMatch = elementMatch.match(/transform\s*=\s*["']([^"']+)["']/);
    if (transformMatch) {
        const translate = parseTranslate(transformMatch[1]);
        result.x = translate.x;
        result.y = translate.y;
    }

    // Look for rect or explicit dimensions
    const rectMatch = elementMatch.match(/<rect[^>]*>/);
    if (rectMatch) {
        const xMatch = rectMatch[0].match(/\bx\s*=\s*["']([\d.-]+)["']/);
        const yMatch = rectMatch[0].match(/\by\s*=\s*["']([\d.-]+)["']/);
        const wMatch = rectMatch[0].match(/\bwidth\s*=\s*["']([\d.-]+)["']/);
        const hMatch = rectMatch[0].match(/\bheight\s*=\s*["']([\d.-]+)["']/);

        if (xMatch) result.x += parseFloat(xMatch[1]);
        if (yMatch) result.y += parseFloat(yMatch[1]);
        if (wMatch) result.width = parseFloat(wMatch[1]);
        if (hMatch) result.height = parseFloat(hMatch[1]);
    }

    return result;
}

/**
 * Check if two bounding boxes overlap
 */
function boxesOverlap(box1, box2) {
    return !(
        box1.x + box1.width <= box2.x ||
        box2.x + box2.width <= box1.x ||
        box1.y + box1.height <= box2.y ||
        box2.y + box2.height <= box1.y
    );
}

/**
 * Extract element with its bounding box from SVG by ID pattern
 */
function getElementBox(svgContent, idPattern) {
    // Find the element group by ID
    const groupRegex = new RegExp(`<g[^>]*id\\s*=\\s*["']${idPattern}["'][^>]*>[\\s\\S]*?</g>`, 'i');
    const match = svgContent.match(groupRegex);

    if (match) {
        return extractBoundingBox(match[0], svgContent);
    }
    return null;
}

/**
 * Get text element position
 */
function getTextPosition(svgContent, textContent) {
    const regex = new RegExp(`<text[^>]*>\\s*${textContent}\\s*</text>`, 'i');
    const match = svgContent.match(regex);

    if (match) {
        const xMatch = match[0].match(/\bx\s*=\s*["']([\d.-]+)["']/);
        const yMatch = match[0].match(/\by\s*=\s*["']([\d.-]+)["']/);
        const fontSize = match[0].match(/font-size\s*=\s*["']([\d]+)["']/);

        return {
            x: xMatch ? parseFloat(xMatch[1]) : 0,
            y: yMatch ? parseFloat(yMatch[1]) : 0,
            width: textContent.length * 8, // Approximate width
            height: fontSize ? parseFloat(fontSize[1]) : 14
        };
    }
    return null;
}

describe('SVG Layout Validation', () => {
    const topicDirs = readdirSync(topicsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    topicDirs.forEach(topicId => {
        describe(`Topic: ${topicId}`, () => {
            const topicPath = join(topicsDir, topicId);
            const topicJsonPath = join(topicPath, 'topic.json');

            test('SVG elements should not overlap', () => {
                const topicContent = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(topicContent);

                topic.slides.forEach((slide, slideIndex) => {
                    const diagramPath = join(topicPath, slide.diagram);
                    if (!existsSync(diagramPath)) return;

                    const svgContent = readFileSync(diagramPath, 'utf-8');
                    const overlaps = [];

                    // Get key element bounding boxes
                    const elements = {};

                    // Phase indicator
                    const phaseIndicator = getElementBox(svgContent, 'phase-indicator');
                    if (phaseIndicator) elements['phase-indicator'] = phaseIndicator;

                    // RAM node
                    const ram = getElementBox(svgContent, 'node_ram');
                    if (ram) elements['node_ram'] = ram;

                    // CPU components
                    const pc = getElementBox(svgContent, 'node_pc');
                    if (pc) elements['node_pc'] = pc;

                    const ir = getElementBox(svgContent, 'node_ir');
                    if (ir) elements['node_ir'] = ir;

                    // DATA BUS label
                    const dataBus = getTextPosition(svgContent, 'DATA BUS');
                    if (dataBus) elements['DATA BUS label'] = dataBus;

                    // Check for overlaps between all pairs
                    const elementNames = Object.keys(elements);
                    for (let i = 0; i < elementNames.length; i++) {
                        for (let j = i + 1; j < elementNames.length; j++) {
                            const name1 = elementNames[i];
                            const name2 = elementNames[j];
                            const box1 = elements[name1];
                            const box2 = elements[name2];

                            if (box1 && box2 && box1.width > 0 && box2.width > 0) {
                                if (boxesOverlap(box1, box2)) {
                                    overlaps.push(`${name1} overlaps with ${name2}`);
                                }
                            }
                        }
                    }

                    if (overlaps.length > 0) {
                        console.error(`Slide ${slideIndex} overlaps:`, overlaps);
                        console.error('Element boxes:', elements);
                    }
                    expect(overlaps).toEqual([]);
                });
            });

            test('phase indicator should be in top portion of SVG', () => {
                const topicContent = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(topicContent);

                topic.slides.forEach((slide) => {
                    const diagramPath = join(topicPath, slide.diagram);
                    if (!existsSync(diagramPath)) return;

                    const svgContent = readFileSync(diagramPath, 'utf-8');
                    const phaseIndicator = getElementBox(svgContent, 'phase-indicator');

                    if (phaseIndicator) {
                        // Phase indicator should be in top third of 900px height SVG
                        expect(phaseIndicator.y).toBeLessThan(300);
                    }
                });
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
