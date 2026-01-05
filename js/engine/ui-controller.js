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

        if (this.elements.phaseBadge) {
            this.elements.phaseBadge.textContent = phase || '';

            // Remove all phase classes
            this.elements.phaseBadge.classList.remove(
                'phase-fetch', 'phase-decode', 'phase-execute', 'phase-store'
            );

            // Add phase-specific class based on phase text
            if (phase) {
                const phaseLower = phase.toLowerCase();
                if (phaseLower.includes('fetch')) {
                    this.elements.phaseBadge.classList.add('phase-fetch');
                } else if (phaseLower.includes('decode')) {
                    this.elements.phaseBadge.classList.add('phase-decode');
                } else if (phaseLower.includes('execute')) {
                    this.elements.phaseBadge.classList.add('phase-execute');
                } else if (phaseLower.includes('store')) {
                    this.elements.phaseBadge.classList.add('phase-store');
                }
            }
        }
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
}
