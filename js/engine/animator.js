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
     */
    applyState(stateSnapshot) {
        if (!stateSnapshot) return;

        Object.entries(stateSnapshot).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
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

        // Hide packet initially
        if (this.packet) {
            gsap.set(this.packet, { opacity: 0 });
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
