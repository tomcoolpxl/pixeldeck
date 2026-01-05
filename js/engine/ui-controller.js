/**
 * UI Controller - Updates sidebar and controls based on state
 */

export class UIController {
    constructor() {
        this.elements = {};
    }

    init() {
        this.elements = {
            topicTitle: document.getElementById('topic-title'),
            stepProgress: document.getElementById('step-progress'),
            slideProgress: document.getElementById('slide-progress'),
            phaseBadge: document.getElementById('phase-badge'),
            phaseExplanation: document.getElementById('phase-explanation'),
            stepTitle: document.getElementById('step-title'),
            stepDesc: document.getElementById('step-desc'),
            ddTitle: document.getElementById('dd-title'),
            ddText: document.getElementById('dd-text'),
            // Primary buttons
            nextBtn: document.getElementById('nextBtn'),
            replayBtn: document.getElementById('replayBtn'),
            // Secondary buttons
            restartBtn: document.getElementById('restartBtn'),
            prevStepBtn: document.getElementById('prevStepBtn'),
            nextStepBtn: document.getElementById('nextStepBtn')
        };
    }

    setTopicTitle(title) {
        if (this.elements.topicTitle) {
            this.elements.topicTitle.textContent = title;
        }
    }

    updateProgress(counts) {
        if (this.elements.stepProgress) {
            this.elements.stepProgress.textContent =
                `Step ${counts.currentStep} of ${counts.totalSteps}`;
        }
        if (this.elements.slideProgress) {
            this.elements.slideProgress.textContent =
                `Slide ${counts.currentSlide} of ${counts.totalSlides}`;
        }
    }

    updateStepContent(step) {
        if (!step || !step.ui) return;

        const { phase, phaseExplanation, title, description, noteTitle, note } = step.ui;

        // Determine which phase is active
        let activePhase = null;
        if (phase) {
            const phaseLower = phase.toLowerCase();
            if (phaseLower.includes('fetch')) {
                activePhase = 'fetch';
            } else if (phaseLower.includes('decode')) {
                activePhase = 'decode';
            } else if (phaseLower.includes('execute')) {
                activePhase = 'execute';
            } else if (phaseLower.includes('store')) {
                activePhase = 'store';
            }
        }

        if (this.elements.phaseBadge) {
            this.elements.phaseBadge.textContent = phase || '';

            // Remove all phase classes
            this.elements.phaseBadge.classList.remove(
                'phase-fetch', 'phase-decode', 'phase-execute', 'phase-store'
            );

            // Add phase-specific class
            if (activePhase) {
                this.elements.phaseBadge.classList.add(`phase-${activePhase}`);
            }
        }

        // Update SVG phase indicator
        this.updatePhaseIndicator(activePhase);
        if (this.elements.phaseExplanation) {
            if (phaseExplanation) {
                this.elements.phaseExplanation.innerHTML = phaseExplanation;
                this.elements.phaseExplanation.style.display = 'block';
            } else {
                this.elements.phaseExplanation.style.display = 'none';
            }
        }
        if (this.elements.stepTitle) {
            this.elements.stepTitle.textContent = title || '';
        }
        if (this.elements.stepDesc) {
            this.elements.stepDesc.innerHTML = description || '';
        }
        if (this.elements.ddTitle) {
            this.elements.ddTitle.textContent = noteTitle || 'Note';
        }
        if (this.elements.ddText) {
            this.elements.ddText.innerHTML = note || '';
        }
    }

    updateButtons(stateMachine) {
        const canNext = stateMachine.canNextStep();
        const canPrev = stateMachine.canPrevStep();
        const hasStep = stateMachine.getCurrentStep() !== null;

        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = !canNext;
        }
        if (this.elements.replayBtn) {
            this.elements.replayBtn.disabled = !hasStep;
        }
        if (this.elements.restartBtn) {
            this.elements.restartBtn.disabled = !canPrev;
        }
        if (this.elements.prevStepBtn) {
            this.elements.prevStepBtn.disabled = !canPrev;
        }
        if (this.elements.nextStepBtn) {
            this.elements.nextStepBtn.disabled = !canNext;
        }
    }

    bindButtons(handlers) {
        // Primary
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', handlers.nextStep);
        }
        if (this.elements.replayBtn) {
            this.elements.replayBtn.addEventListener('click', handlers.replay);
        }
        // Secondary
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', handlers.restart);
        }
        if (this.elements.prevStepBtn) {
            this.elements.prevStepBtn.addEventListener('click', handlers.prevStep);
        }
        if (this.elements.nextStepBtn) {
            this.elements.nextStepBtn.addEventListener('click', handlers.nextStep);
        }
    }

    bindKeyboard(handlers) {
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.code) {
                case 'ArrowRight':
                    e.preventDefault();
                    handlers.nextStep();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handlers.prevStep();
                    break;
                case 'Space':
                    e.preventDefault();
                    handlers.replay();
                    break;
                case 'Home':
                    e.preventDefault();
                    handlers.restart();
                    break;
            }
        });
    }

    /**
     * Update the SVG phase indicator to highlight the active phase
     */
    updatePhaseIndicator(activePhase) {
        const phases = ['fetch', 'decode', 'execute', 'store'];
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

        // Active colors (bright) - different for light/dark theme
        const activeColors = isLightTheme ? {
            fetch: { bg: '#e0f2fe', border: '#0284c7', text: '#0369a1' },
            decode: { bg: '#fef9c3', border: '#ca8a04', text: '#a16207' },
            execute: { bg: '#fce7f3', border: '#db2777', text: '#be185d' },
            store: { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }
        } : {
            fetch: { bg: '#0c4a6e', border: '#38bdf8', text: '#38bdf8' },
            decode: { bg: '#422006', border: '#facc15', text: '#facc15' },
            execute: { bg: '#500724', border: '#f472b6', text: '#f472b6' },
            store: { bg: '#052e16', border: '#22c55e', text: '#22c55e' }
        };

        // Inactive colors (faded but readable) - different for light/dark theme
        const inactiveColors = isLightTheme ? {
            fetch: { text: '#0ea5e9' },    // medium blue (light)
            decode: { text: '#eab308' },   // medium yellow (light)
            execute: { text: '#ec4899' },  // medium pink (light)
            store: { text: '#22c55e' }     // medium green (light)
        } : {
            fetch: { text: '#38bdf8' },    // brighter blue (dark)
            decode: { text: '#facc15' },   // brighter yellow (dark)
            execute: { text: '#f472b6' },  // brighter pink (dark)
            store: { text: '#4ade80' }     // brighter green (dark)
        };

        phases.forEach(phase => {
            const bg = document.getElementById(`phase-bg-${phase}`);
            const text = document.getElementById(`phase-text-${phase}`);

            if (bg && text) {
                if (phase === activePhase) {
                    // Highlight active phase with full colors (use style to override CSS)
                    bg.style.fill = activeColors[phase].bg;
                    bg.style.stroke = activeColors[phase].border;
                    text.style.fill = activeColors[phase].text;
                    text.style.opacity = '1';
                } else {
                    // Faded phase-appropriate colors for inactive phases
                    bg.style.fill = 'transparent';
                    bg.style.stroke = 'transparent';
                    text.style.fill = inactiveColors[phase].text;
                    text.style.opacity = '0.5';
                }
            }
        });
    }
}
