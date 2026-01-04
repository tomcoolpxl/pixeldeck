/**
 * State Machine for presentation navigation
 * Simple state tracking - no animation logic here
 */

export class StateMachine {
    constructor() {
        this.state = {
            topic: null,
            slideIndex: 0,
            stepIndex: 0
        };

        this.topicData = null;
        this.listeners = [];
    }

    setTopicData(topicData) {
        this.topicData = topicData;
        this.state.topic = topicData.id;
        this.state.slideIndex = 0;
        this.state.stepIndex = 0;
        this.notify();
    }

    getCurrentSlide() {
        if (!this.topicData) return null;
        return this.topicData.slides[this.state.slideIndex] || null;
    }

    getCurrentStep() {
        const slide = this.getCurrentSlide();
        if (!slide) return null;
        return slide.steps[this.state.stepIndex] || null;
    }

    getCounts() {
        const slide = this.getCurrentSlide();
        return {
            currentStep: this.state.stepIndex + 1,
            totalSteps: slide ? slide.steps.length : 0,
            currentSlide: this.state.slideIndex + 1,
            totalSlides: this.topicData ? this.topicData.slides.length : 0
        };
    }

    // Navigation checks
    canNextStep() {
        const slide = this.getCurrentSlide();
        if (!slide) return false;
        return this.state.stepIndex < slide.steps.length - 1 ||
               this.state.slideIndex < this.topicData.slides.length - 1;
    }

    canPrevStep() {
        return this.state.stepIndex > 0 || this.state.slideIndex > 0;
    }

    canNextSlide() {
        if (!this.topicData) return false;
        return this.state.slideIndex < this.topicData.slides.length - 1;
    }

    canPrevSlide() {
        return this.state.slideIndex > 0;
    }

    // Navigation actions - just update state, return what changed
    nextStep() {
        const slide = this.getCurrentSlide();
        if (!slide) return null;

        if (this.state.stepIndex < slide.steps.length - 1) {
            this.state.stepIndex++;
            this.notify();
            return { type: 'step', slideChanged: false };
        } else if (this.canNextSlide()) {
            this.state.slideIndex++;
            this.state.stepIndex = 0;
            this.notify();
            return { type: 'step', slideChanged: true };
        }
        return null;
    }

    prevStep() {
        if (this.state.stepIndex > 0) {
            this.state.stepIndex--;
            this.notify();
            return { type: 'step', slideChanged: false };
        } else if (this.state.slideIndex > 0) {
            this.state.slideIndex--;
            const slide = this.getCurrentSlide();
            this.state.stepIndex = slide.steps.length - 1;
            this.notify();
            return { type: 'step', slideChanged: true };
        }
        return null;
    }

    nextSlide() {
        if (!this.canNextSlide()) return null;
        this.state.slideIndex++;
        this.state.stepIndex = 0;
        this.notify();
        return { type: 'slide' };
    }

    prevSlide() {
        if (!this.canPrevSlide()) return null;
        this.state.slideIndex--;
        this.state.stepIndex = 0;
        this.notify();
        return { type: 'slide' };
    }

    restart() {
        this.state.slideIndex = 0;
        this.state.stepIndex = 0;
        this.notify();
        return { type: 'restart' };
    }

    goToStep(stepIndex) {
        const slide = this.getCurrentSlide();
        if (!slide || stepIndex < 0 || stepIndex >= slide.steps.length) return null;
        this.state.stepIndex = stepIndex;
        this.notify();
        return { type: 'jump' };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        const state = { ...this.state };
        const counts = this.getCounts();
        this.listeners.forEach(l => l(state, counts));
    }
}
