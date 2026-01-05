/**
 * Animator - Handles GSAP animations from declarative definitions
 */

export class Animator {
    constructor() {
        this.timeline = null;
        this.camera = { x: 0, y: 0, w: 1600, h: 900 };
        this.svg = null;
        this.packet = null;
        this.packetText = null;
        this.onComplete = null;
    }

    /**
     * Initialize with DOM references
     */
    init(svgElement) {
        this.svg = svgElement;
        this.packet = document.getElementById('packet-grp');
        this.packetText = document.getElementById('packet-text');
        this.packet2 = document.getElementById('packet-grp-2');
        this.packetText2 = document.getElementById('packet-text-2');

        // Register GSAP plugins
        if (typeof gsap !== 'undefined' && typeof MotionPathPlugin !== 'undefined') {
            gsap.registerPlugin(MotionPathPlugin);
        }
    }

    /**
     * Reset camera to default view
     */
    resetCamera() {
        this.camera = { x: 0, y: 0, w: 1600, h: 900 };
        if (this.svg) {
            this.svg.setAttribute('viewBox', '0 0 1600 900');
        }
    }

    /**
     * Apply component values from a state snapshot
     * Supports both text content (string values) and SVG attributes (object values)
     */
    applyState(stateSnapshot) {
        if (!stateSnapshot) return;

        Object.entries(stateSnapshot).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) return;

            if (typeof value === 'string') {
                // Simple text content
                el.textContent = value;
            } else if (typeof value === 'object') {
                // Object with SVG attributes (transform, fill, filter, etc.)
                Object.entries(value).forEach(([attr, attrValue]) => {
                    el.setAttribute(attr, attrValue);
                });
            }
        });
    }

    /**
     * Build and play animations for a step
     */
    playStep(step, onComplete) {
        this.onComplete = onComplete;

        // Kill any existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }

        // Create new timeline
        this.timeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        });

        // Hide packets initially
        if (this.packet) {
            gsap.set(this.packet, { opacity: 0 });
        }
        if (this.packet2) {
            gsap.set(this.packet2, { opacity: 0 });
        }

        // Process animation definitions
        const animations = step.animations || [];

        animations.forEach(anim => {
            switch (anim.type) {
                case 'camera':
                    this.addCameraAnimation(anim);
                    break;
                case 'packet':
                    this.addPacketAnimation(anim);
                    break;
                case 'setValue':
                    this.addSetValue(anim);
                    break;
                case 'pulse':
                    this.addPulse(anim);
                    break;
                case 'wait':
                    this.addWait(anim);
                    break;
                case 'anim':
                    this.addGenericAnimation(anim);
                    break;
                case 'parallel':
                    this.addParallelAnimations(anim);
                    break;
            }
        });

        // Start playing
        this.timeline.play();
    }

    /**
     * Add camera pan/zoom animation
     */
    addCameraAnimation(anim) {
        const [x, y, w, h] = anim.to;
        const duration = anim.duration || 1.5;

        this.timeline.to(this.camera, {
            x, y, w, h,
            duration,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.svg.setAttribute('viewBox',
                    `${this.camera.x} ${this.camera.y} ${this.camera.w} ${this.camera.h}`);
            }
        });
    }

    /**
     * Add packet movement animation
     */
    addPacketAnimation(anim) {
        const { text, from, paths } = anim;

        // Position and show packet
        if (from) {
            this.timeline.set(this.packet, { opacity: 1, x: from[0], y: from[1] });
        } else {
            this.timeline.set(this.packet, { opacity: 1 });
        }

        // Set packet text
        if (text) {
            this.timeline.call(() => {
                this.packetText.textContent = text;
            });
        }

        // Animate along paths
        paths.forEach(pathSpec => {
            const pathInfo = this.parsePathSpec(pathSpec);
            const duration = pathInfo.duration || 1.0;

            this.timeline.to(this.packet, {
                motionPath: {
                    path: pathInfo.path,
                    autoRotate: false,
                    start: pathInfo.start,
                    end: pathInfo.end
                },
                duration,
                ease: pathInfo.ease || 'none'
            });
        });

        // Hide packet at end
        this.timeline.set(this.packet, { opacity: 0 });
    }

    /**
     * Parse path specification string
     * Format: "#path_id" or "#path_id:start:end" or "#path_id:start:end:duration"
     */
    parsePathSpec(spec) {
        if (typeof spec === 'object') {
            return {
                path: spec.path,
                start: spec.start ?? 0,
                end: spec.end ?? 1,
                duration: spec.duration || 1.0,
                ease: spec.ease
            };
        }

        const parts = spec.split(':');
        return {
            path: parts[0],
            start: parts[1] !== undefined ? parseFloat(parts[1]) : 0,
            end: parts[2] !== undefined ? parseFloat(parts[2]) : 1,
            duration: parts[3] !== undefined ? parseFloat(parts[3]) : 1.0
        };
    }

    /**
     * Add set value action
     */
    addSetValue(anim) {
        this.timeline.call(() => {
            const el = document.getElementById(anim.target.replace('#', ''));
            if (el) {
                el.textContent = anim.value;
            }
        });
    }

    /**
     * Add pulse effect
     */
    addPulse(anim) {
        const target = anim.target;
        this.timeline.call(() => {
            // Find the rect/path inside the group
            const group = document.querySelector(target);
            if (group) {
                const shape = group.querySelector('rect, path');
                if (shape) {
                    gsap.fromTo(shape,
                        { strokeWidth: 3, filter: 'brightness(1)' },
                        { strokeWidth: 6, filter: 'brightness(2)', duration: 0.2, yoyo: true, repeat: 3 }
                    );
                }
            }
        });
    }

    /**
     * Add wait/pause
     */
    addWait(anim) {
        const duration = anim.duration || 0.5;
        this.timeline.to({}, { duration });
    }

    /**
     * Add generic animation for any SVG attribute (transform, fill, filter, etc.)
     */
    addGenericAnimation(anim) {
        const target = document.querySelector(anim.target);
        if (!target) return;

        const duration = anim.duration || 0.5;
        const to = anim.to || {};

        // Build GSAP properties object
        const gsapProps = { duration, ease: anim.ease || 'power2.inOut' };

        // Handle different property types
        Object.entries(to).forEach(([prop, value]) => {
            if (prop === 'transform') {
                // SVG transform attribute - use attr plugin
                gsapProps.attr = gsapProps.attr || {};
                gsapProps.attr.transform = value;
            } else if (prop === 'fill' || prop === 'stroke' || prop === 'filter') {
                // SVG presentation attributes
                gsapProps.attr = gsapProps.attr || {};
                gsapProps.attr[prop] = value;
            } else {
                // Other CSS properties
                gsapProps[prop] = value;
            }
        });

        this.timeline.to(target, gsapProps);
    }

    /**
     * Add parallel animations - multiple animations that run simultaneously
     * Usage: { "type": "parallel", "animations": [...] }
     */
    addParallelAnimations(anim) {
        const animations = anim.animations || [];
        if (animations.length === 0) return;

        // Get the current timeline position
        const startLabel = `parallel_${Date.now()}`;
        this.timeline.addLabel(startLabel);

        // Track which packet we're using for parallel packet animations
        let packetIndex = 0;
        const packets = [
            { el: this.packet, text: this.packetText },
            { el: this.packet2, text: this.packetText2 }
        ];

        // Add each animation at the same position
        animations.forEach((subAnim) => {
            const position = startLabel;

            switch (subAnim.type) {
                case 'packet':
                    // Use alternating packets for true parallel animation
                    const pkt = packets[packetIndex % packets.length];
                    if (pkt.el) {
                        this.addPacketAnimationWithElement(subAnim, position, pkt.el, pkt.text);
                        packetIndex++;
                    }
                    break;
                case 'setValue':
                    this.timeline.call(() => {
                        const el = document.getElementById(subAnim.target.replace('#', ''));
                        if (el) el.textContent = subAnim.value;
                    }, null, position);
                    break;
                case 'pulse':
                    this.addPulseAt(subAnim, position);
                    break;
                case 'anim':
                    this.addGenericAnimationAt(subAnim, position);
                    break;
            }
        });
    }

    /**
     * Add packet animation at specific timeline position (uses default packet)
     */
    addPacketAnimationAt(anim, position) {
        this.addPacketAnimationWithElement(anim, position, this.packet, this.packetText);
    }

    /**
     * Add packet animation with specific packet element
     */
    addPacketAnimationWithElement(anim, position, packetEl, packetTextEl) {
        const { text, from, paths } = anim;
        if (!packetEl) return;

        // Position and show packet
        if (from) {
            this.timeline.set(packetEl, { opacity: 1, x: from[0], y: from[1] }, position);
        } else {
            this.timeline.set(packetEl, { opacity: 1 }, position);
        }

        // Set packet text
        if (text && packetTextEl) {
            this.timeline.call(() => {
                packetTextEl.textContent = text;
            }, null, position);
        }

        // Animate along paths
        paths.forEach((pathSpec, idx) => {
            const pathInfo = this.parsePathSpec(pathSpec);
            const duration = pathInfo.duration || 1.0;

            this.timeline.to(packetEl, {
                motionPath: {
                    path: pathInfo.path,
                    autoRotate: false,
                    start: pathInfo.start,
                    end: pathInfo.end
                },
                duration,
                ease: pathInfo.ease || 'none'
            }, idx === 0 ? position : '>');
        });

        // Hide packet at end
        this.timeline.set(packetEl, { opacity: 0 });
    }

    /**
     * Add pulse at specific timeline position
     */
    addPulseAt(anim, position) {
        const target = anim.target;
        this.timeline.call(() => {
            const group = document.querySelector(target);
            if (group) {
                const shape = group.querySelector('rect, path');
                if (shape) {
                    gsap.fromTo(shape,
                        { strokeWidth: 3, filter: 'brightness(1)' },
                        { strokeWidth: 6, filter: 'brightness(2)', duration: 0.2, yoyo: true, repeat: 3 }
                    );
                }
            }
        }, null, position);
    }

    /**
     * Add generic animation at specific timeline position
     */
    addGenericAnimationAt(anim, position) {
        const target = document.querySelector(anim.target);
        if (!target) return;

        const duration = anim.duration || 0.5;
        const to = anim.to || {};

        const gsapProps = { duration, ease: anim.ease || 'power2.inOut' };

        Object.entries(to).forEach(([prop, value]) => {
            if (prop === 'transform' || prop === 'fill' || prop === 'stroke' || prop === 'filter') {
                gsapProps.attr = gsapProps.attr || {};
                gsapProps.attr[prop] = value;
            } else {
                gsapProps[prop] = value;
            }
        });

        this.timeline.to(target, gsapProps, position);
    }

    /**
     * Fast forward to end of current animation
     */
    fastForward() {
        if (this.timeline) {
            this.timeline.timeScale(10);
        }
    }

    /**
     * Stop current animation
     */
    stop() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }
        // Hide packet
        if (this.packet) {
            gsap.set(this.packet, { opacity: 0 });
        }
    }

    /**
     * Check if currently playing
     */
    isPlaying() {
        return this.timeline && this.timeline.isActive();
    }
}
