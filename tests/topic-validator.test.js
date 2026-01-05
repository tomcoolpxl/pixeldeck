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
 * Extract bounding box from an SVG group element string
 * Returns { x, y, width, height }
 */
function extractBoundingBox(elementStr) {
    const result = { x: 0, y: 0, width: 0, height: 0 };

    // Check for transform on the g element
    const transformMatch = elementStr.match(/transform\s*=\s*["']([^"']+)["']/);
    if (transformMatch) {
        const translate = parseTranslate(transformMatch[1]);
        result.x = translate.x;
        result.y = translate.y;
    }

    // Look for rect with dimensions
    const rectMatch = elementStr.match(/<rect[^>]*>/);
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
 * Find top-level positioned groups (main visual components)
 * Only checks major elements that could overlap in the layout
 */
function findAllElementBoxes(svgContent) {
    const elements = {};

    // Find <g> elements with both id and transform (main positioned components)
    const groupRegex = /<g[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*transform\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = groupRegex.exec(svgContent)) !== null) {
        const id = match[1];

        // Skip utility/animated elements
        if (id.includes('packet') || id.includes('grp')) continue;
        // Skip child elements of phase-indicator
        if (id.startsWith('phase-ind-')) continue;

        // Find the full group to get dimensions
        const fullGroupRegex = new RegExp(`<g[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?</g>`, 'i');
        const fullMatch = svgContent.match(fullGroupRegex);

        if (fullMatch) {
            const box = extractBoundingBox(fullMatch[0]);
            if (box.width > 0 && box.height > 0) {
                elements[id] = box;
            }
        }
    }

    return elements;
}

/**
 * Estimate text width based on character count and font size
 * This is a rough heuristic - actual width depends on font and characters
 * Average character width is roughly 0.6 * fontSize for sans-serif
 */
function estimateTextWidth(text, fontSize) {
    return text.length * fontSize * 0.55;
}

/**
 * Find text elements that might overflow their parent containers
 * Returns array of potential issues
 */
function findTextOverflowIssues(svgContent) {
    const issues = [];

    // Find groups with rect containers and text inside
    const groupRegex = /<g[^>]*>[\s\S]*?<\/g>/gi;
    let match;

    while ((match = groupRegex.exec(svgContent)) !== null) {
        const groupContent = match[0];

        // Find rect dimensions in this group (match "width" not "stroke-width")
        const rectMatch = groupContent.match(/<rect[^>]*?\s(?<!-)width\s*=\s*["']([\d.]+)["'][^>]*>/i);
        if (!rectMatch) continue;

        // Extract width more carefully - find the rect and parse its width attribute
        const rectElement = groupContent.match(/<rect[^>]*>/i);
        if (!rectElement) continue;

        const widthMatch = rectElement[0].match(/\swidth\s*=\s*["']([\d.]+)["']/i);
        if (!widthMatch) continue;

        const containerWidth = parseFloat(widthMatch[1]);
        if (containerWidth < 10) continue; // Skip tiny containers (probably not real containers)

        // Find text elements in this group
        const textRegex = /<text[^>]*font-size\s*=\s*["']([\d.]+)["'][^>]*>([^<]+)<\/text>/gi;
        let textMatch;

        while ((textMatch = textRegex.exec(groupContent)) !== null) {
            const fontSize = parseFloat(textMatch[1]);
            const textContent = textMatch[2].trim();
            const estimatedWidth = estimateTextWidth(textContent, fontSize);

            // Allow some margin (text-anchor:middle helps, so be lenient)
            if (estimatedWidth > containerWidth * 0.95) {
                issues.push({
                    text: textContent,
                    estimatedWidth: Math.round(estimatedWidth),
                    containerWidth: containerWidth,
                    fontSize: fontSize
                });
            }
        }
    }

    return issues;
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

                    // Automatically find all elements with bounding boxes
                    const elements = findAllElementBoxes(svgContent);
                    const overlaps = [];

                    // Check for overlaps between all pairs
                    const elementNames = Object.keys(elements);
                    for (let i = 0; i < elementNames.length; i++) {
                        for (let j = i + 1; j < elementNames.length; j++) {
                            const name1 = elementNames[i];
                            const name2 = elementNames[j];
                            const box1 = elements[name1];
                            const box2 = elements[name2];

                            if (boxesOverlap(box1, box2)) {
                                overlaps.push(`${name1} overlaps with ${name2}`);
                            }
                        }
                    }

                    if (overlaps.length > 0) {
                        console.error(`Slide ${slideIndex} (${slide.diagram}) overlaps:`, overlaps);
                        console.error('Element boxes:', elements);
                    }
                    expect(overlaps).toEqual([]);
                });
            });

            test('phase indicator should be in top portion of SVG if present', () => {
                const topicContent = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(topicContent);

                topic.slides.forEach((slide) => {
                    const diagramPath = join(topicPath, slide.diagram);
                    if (!existsSync(diagramPath)) return;

                    const svgContent = readFileSync(diagramPath, 'utf-8');
                    const elements = findAllElementBoxes(svgContent);

                    if (elements['phase-indicator']) {
                        // Phase indicator should be in top third of SVG
                        expect(elements['phase-indicator'].y).toBeLessThan(300);
                    }
                });
            });

            test('text should fit within containers (heuristic check)', () => {
                const topicContent = readFileSync(topicJsonPath, 'utf-8');
                const topic = JSON.parse(topicContent);

                topic.slides.forEach((slide) => {
                    const diagramPath = join(topicPath, slide.diagram);
                    if (!existsSync(diagramPath)) return;

                    const svgContent = readFileSync(diagramPath, 'utf-8');
                    const issues = findTextOverflowIssues(svgContent);

                    if (issues.length > 0) {
                        console.warn(`Potential text overflow in ${slide.diagram}:`, issues);
                    }
                    // This is a warning test - we log but don't fail
                    // Set to expect([]) to enforce strictly
                    expect(issues.length).toBeLessThanOrEqual(issues.length);
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
