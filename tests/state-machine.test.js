/**
 * State Machine Tests
 */

import { StateMachine } from '../js/engine/state-machine.js';

describe('StateMachine', () => {
    let sm;

    const mockTopicData = {
        id: 'test-topic',
        title: 'Test Topic',
        slides: [
            {
                id: 'slide-1',
                title: 'First Slide',
                steps: [
                    { id: 'step-1', ui: { title: 'Step 1' } },
                    { id: 'step-2', ui: { title: 'Step 2' } },
                    { id: 'step-3', ui: { title: 'Step 3' } }
                ]
            },
            {
                id: 'slide-2',
                title: 'Second Slide',
                steps: [
                    { id: 'step-a', ui: { title: 'Step A' } },
                    { id: 'step-b', ui: { title: 'Step B' } }
                ]
            }
        ]
    };

    beforeEach(() => {
        sm = new StateMachine();
        sm.setTopicData(mockTopicData);
    });

    describe('initialization', () => {
        test('should start at slide 0, step 0', () => {
            expect(sm.state.slideIndex).toBe(0);
            expect(sm.state.stepIndex).toBe(0);
        });

        test('should set topic id', () => {
            expect(sm.state.topic).toBe('test-topic');
        });
    });

    describe('getCounts', () => {
        test('should return correct counts at start', () => {
            const counts = sm.getCounts();
            expect(counts.currentStep).toBe(1);
            expect(counts.totalSteps).toBe(3);
            expect(counts.currentSlide).toBe(1);
            expect(counts.totalSlides).toBe(2);
        });

        test('should return correct counts after navigation', () => {
            sm.nextStep();
            sm.nextStep();
            const counts = sm.getCounts();
            expect(counts.currentStep).toBe(3);
            expect(counts.totalSteps).toBe(3);
        });
    });

    describe('getCurrentSlide', () => {
        test('should return current slide', () => {
            const slide = sm.getCurrentSlide();
            expect(slide.id).toBe('slide-1');
        });

        test('should return null if no topic data', () => {
            const emptySm = new StateMachine();
            expect(emptySm.getCurrentSlide()).toBeNull();
        });
    });

    describe('getCurrentStep', () => {
        test('should return current step', () => {
            const step = sm.getCurrentStep();
            expect(step.id).toBe('step-1');
        });

        test('should return correct step after navigation', () => {
            sm.nextStep();
            const step = sm.getCurrentStep();
            expect(step.id).toBe('step-2');
        });
    });

    describe('navigation checks', () => {
        test('canNextStep should be true when not at end', () => {
            expect(sm.canNextStep()).toBe(true);
        });

        test('canPrevStep should be false at start', () => {
            expect(sm.canPrevStep()).toBe(false);
        });

        test('canPrevStep should be true after moving forward', () => {
            sm.nextStep();
            expect(sm.canPrevStep()).toBe(true);
        });

        test('canNextSlide should be true when more slides exist', () => {
            expect(sm.canNextSlide()).toBe(true);
        });

        test('canPrevSlide should be false on first slide', () => {
            expect(sm.canPrevSlide()).toBe(false);
        });
    });

    describe('nextStep', () => {
        test('should advance step index', () => {
            const result = sm.nextStep();
            expect(sm.state.stepIndex).toBe(1);
            expect(result.type).toBe('step');
            expect(result.slideChanged).toBe(false);
        });

        test('should advance to next slide when at last step', () => {
            sm.state.stepIndex = 2; // Last step of slide 1
            const result = sm.nextStep();
            expect(sm.state.slideIndex).toBe(1);
            expect(sm.state.stepIndex).toBe(0);
            expect(result.slideChanged).toBe(true);
        });

        test('should return null when at end of topic', () => {
            sm.state.slideIndex = 1;
            sm.state.stepIndex = 1; // Last step of last slide
            const result = sm.nextStep();
            expect(result).toBeNull();
        });
    });

    describe('prevStep', () => {
        test('should go back one step', () => {
            sm.state.stepIndex = 2;
            const result = sm.prevStep();
            expect(sm.state.stepIndex).toBe(1);
            expect(result.type).toBe('step');
            expect(result.slideChanged).toBe(false);
        });

        test('should go to previous slide last step when at first step', () => {
            sm.state.slideIndex = 1;
            sm.state.stepIndex = 0;
            const result = sm.prevStep();
            expect(sm.state.slideIndex).toBe(0);
            expect(sm.state.stepIndex).toBe(2); // Last step of slide 1
            expect(result.slideChanged).toBe(true);
        });

        test('should return null when at start', () => {
            const result = sm.prevStep();
            expect(result).toBeNull();
        });
    });

    describe('nextSlide', () => {
        test('should advance to next slide', () => {
            const result = sm.nextSlide();
            expect(sm.state.slideIndex).toBe(1);
            expect(sm.state.stepIndex).toBe(0);
            expect(result.type).toBe('slide');
        });

        test('should return null on last slide', () => {
            sm.state.slideIndex = 1;
            const result = sm.nextSlide();
            expect(result).toBeNull();
        });
    });

    describe('prevSlide', () => {
        test('should go to previous slide', () => {
            sm.state.slideIndex = 1;
            const result = sm.prevSlide();
            expect(sm.state.slideIndex).toBe(0);
            expect(sm.state.stepIndex).toBe(0);
            expect(result.type).toBe('slide');
        });

        test('should return null on first slide', () => {
            const result = sm.prevSlide();
            expect(result).toBeNull();
        });
    });

    describe('restart', () => {
        test('should reset to beginning', () => {
            sm.state.slideIndex = 1;
            sm.state.stepIndex = 1;
            const result = sm.restart();
            expect(sm.state.slideIndex).toBe(0);
            expect(sm.state.stepIndex).toBe(0);
            expect(result.type).toBe('restart');
        });
    });

    describe('goToStep', () => {
        test('should jump to specific step', () => {
            const result = sm.goToStep(2);
            expect(sm.state.stepIndex).toBe(2);
            expect(result.type).toBe('jump');
        });

        test('should return null for invalid step', () => {
            const result = sm.goToStep(10);
            expect(result).toBeNull();
        });

        test('should return null for negative step', () => {
            const result = sm.goToStep(-1);
            expect(result).toBeNull();
        });
    });

    describe('subscribe', () => {
        test('should notify listeners on state change', () => {
            let callCount = 0;
            const listener = () => { callCount++; };
            sm.subscribe(listener);
            sm.nextStep();
            expect(callCount).toBeGreaterThan(0);
        });

        test('should return unsubscribe function', () => {
            let callCount = 0;
            const listener = () => { callCount++; };
            const unsubscribe = sm.subscribe(listener);
            unsubscribe();
            sm.nextStep();
            expect(callCount).toBe(0);
        });
    });
});
