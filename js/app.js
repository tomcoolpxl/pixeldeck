/**
 * Main Application Entry Point
 */

import { StateMachine } from './engine/state-machine.js';
import { Animator } from './engine/animator.js';
import { UIController } from './engine/ui-controller.js';
import { TopicLoader } from './engine/topic-loader.js';

class PresentationApp {
    constructor() {
        this.stateMachine = new StateMachine();
        this.animator = new Animator();
        this.ui = new UIController();
        this.loader = new TopicLoader();

        this.topicData = null;
        this.currentSlide = null;
        this.isAnimating = false;
    }

    async init() {
        this.ui.init();

        const topicId = this.getTopicId();
        if (!topicId) {
            this.showError('No topic specified. Add #cpu-architecture to the URL.');
            return;
        }

        try {
            this.topicData = await this.loader.loadTopic(topicId);
            this.stateMachine.setTopicData(this.topicData);
            this.ui.setTopicTitle(this.topicData.title);

            await this.loadSlide(0);
            this.showCurrentStep(false); // Don't animate on initial load

            this.bindControls();

            this.stateMachine.subscribe(() => {
                this.ui.updateProgress(this.stateMachine.getCounts());
                this.ui.updateButtons(this.stateMachine);
            });

            this.ui.updateProgress(this.stateMachine.getCounts());
            this.ui.updateButtons(this.stateMachine);

        } catch (error) {
            console.error('Failed to load topic:', error);
            this.showError(`Failed to load topic: ${error.message}`);
        }
    }

    getTopicId() {
        // Try query string first
        const params = new URLSearchParams(window.location.search);
        let topicId = params.get('topic');

        // Try hash
        if (!topicId) {
            const hash = window.location.hash;
            if (hash.startsWith('#')) {
                topicId = hash.substring(1);
            }
        }

        return topicId;
    }

    async loadSlide(slideIndex) {
        const slide = this.topicData.slides[slideIndex];
        if (!slide) return;

        this.currentSlide = slide;

        const stage = document.getElementById('stage');
        const svgText = await this.loader.loadDiagram(this.topicData, slide);
        const svg = this.loader.injectDiagram(svgText, stage);

        this.animator.init(svg);
        this.animator.resetCamera();
        this.loader.resetToInitialState(slide);
    }

    bindControls() {
        const handlers = {
            nextStep: () => this.handleNext(),
            prevStep: () => this.handlePrev(),
            replay: () => this.handleReplay(),
            nextSlide: () => this.handleNextSlide(),
            prevSlide: () => this.handlePrevSlide(),
            restart: () => this.handleRestart()
        };

        this.ui.bindButtons(handlers);
        this.ui.bindKeyboard(handlers);
    }

    async handleNext() {
        if (this.isAnimating) {
            this.animator.fastForward();
            return;
        }

        const result = this.stateMachine.nextStep();
        if (!result) return;

        if (result.slideChanged) {
            await this.loadSlide(this.stateMachine.state.slideIndex);
        }

        // Play animation for next step
        this.showCurrentStep(true);
    }

    handlePrev() {
        if (this.isAnimating) {
            this.animator.stop();
            this.isAnimating = false;
        }

        const result = this.stateMachine.prevStep();
        if (!result) return;

        if (result.slideChanged) {
            this.loadSlide(this.stateMachine.state.slideIndex).then(() => {
                this.showCurrentStep(false);
            });
        } else {
            this.showCurrentStep(false);
        }
    }

    handleReplay() {
        if (this.isAnimating) {
            this.animator.stop();
        }
        this.showCurrentStep(true);
    }

    async handleNextSlide() {
        if (this.isAnimating) {
            this.animator.stop();
            this.isAnimating = false;
        }

        const result = this.stateMachine.nextSlide();
        if (!result) return;

        await this.loadSlide(this.stateMachine.state.slideIndex);
        this.showCurrentStep(false);
    }

    async handlePrevSlide() {
        if (this.isAnimating) {
            this.animator.stop();
            this.isAnimating = false;
        }

        const result = this.stateMachine.prevSlide();
        if (!result) return;

        await this.loadSlide(this.stateMachine.state.slideIndex);
        this.showCurrentStep(false);
    }

    async handleRestart() {
        if (this.isAnimating) {
            this.animator.stop();
            this.isAnimating = false;
        }

        const result = this.stateMachine.restart();
        if (!result) return;

        await this.loadSlide(0);
        this.showCurrentStep(false);
    }

    /**
     * Show current step - either animate or just show end state
     */
    showCurrentStep(animate) {
        const slide = this.currentSlide;
        const stepIndex = this.stateMachine.state.stepIndex;
        const step = slide.steps[stepIndex];

        if (!step) return;

        // Update UI content
        this.ui.updateStepContent(step);

        // Reset to initial slide state (uses captured SVG state + slide overrides)
        this.loader.resetToInitialState(slide);
        this.animator.resetCamera();

        // Apply all finalStates up to current step to show cumulative state
        for (let i = 0; i <= stepIndex; i++) {
            const s = slide.steps[i];
            if (s.finalState) {
                this.animator.applyState(s.finalState);
            }
        }

        // If animating, play the current step's animation
        if (animate && step.animations && step.animations.length > 0) {
            // First reset to state BEFORE this step
            this.loader.resetToInitialState(slide);
            for (let i = 0; i < stepIndex; i++) {
                const s = slide.steps[i];
                if (s.finalState) {
                    this.animator.applyState(s.finalState);
                }
            }
            this.animator.resetCamera();

            this.isAnimating = true;
            this.animator.playStep(step, () => {
                this.isAnimating = false;
            });
        }
    }

    showError(message) {
        document.getElementById('step-title').textContent = 'Error';
        document.getElementById('step-desc').textContent = message;
        document.getElementById('phase-badge').textContent = 'ERROR';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PresentationApp();
    app.init();
});
