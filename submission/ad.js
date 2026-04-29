// Configuration
const targetCount = 16;
const targetTimeSeconds = 10;

class Game {
    // Elements
    #target = document.getElementById('target');
    #timer = document.getElementById('timer');
    #instructions = document.getElementById('instructions');
    #counter = document.getElementById('counter');

    // Bounds of target
    #targetMaxX = 0;
    #targetMinY = 0;
    #targetMaxY = 0;

    // Runtime variables
    #timeRemaining = targetTimeSeconds;
    #timerIntervalId = null;
    #clickCount = 0;

    // Labels
    #timerLabel = 'Time: ';
    #counterLabel = 'Targets left: ';

    #hitSounds = [
        new Audio('assets/hit1.ogg'),
        new Audio('assets/hit2.ogg'),
        new Audio('assets/hit3.ogg'),
        new Audio('assets/hit4.ogg'),
        new Audio('assets/hit5.ogg'),
        new Audio('assets/hit6.ogg'),
        new Audio('assets/hit7.ogg'),
        new Audio('assets/hit8.ogg'),
    ];

    #targetAnimation = [
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1)' },
    ];

    #targetRotationTiming = {
        duration: 1000,
        iterations: targetTimeSeconds
    };

    start() {
        this.initializeState();
        this.#target.addEventListener('click', this.onTarget.bind(this));
        this.#timerIntervalId = setInterval(this.updateTimer.bind(this), 1000);
    }

    initializeState() {
        // Instructions
        this.#instructions.style.display = 'block';

        // Timer
        this.#timer.style.display = 'block';
        this.#timer.textContent = this.#timerLabel + this.#timeRemaining;

        // Counter
        this.#counter.style.display = 'block';
        this.#counter.textContent = this.#counterLabel + targetCount;

        // Target
        this.#target.style.display = 'block';
        this.animateTarget();
        // Target bounds
        this.#targetMaxX = document.getElementById('overlay-container').offsetWidth - this.#target.naturalWidth;
        this.#targetMinY = this.#instructions.offsetTop + this.#instructions.offsetHeight;
        this.#targetMaxY = this.#timer.offsetTop - this.#target.naturalHeight;

        this.moveTarget();
    }

    // Moves target to random location.
    moveTarget() {
        let x = Math.random() * this.#targetMaxX;
        let y = Math.random() * (this.#targetMaxY - this.#targetMinY) + this.#targetMinY;
        
        this.#target.style.left = x + 'px';
        this.#target.style.top = y + 'px';
    }

    cleanup() {
        this.#target.removeEventListener('click', this.onTarget);
        this.#target.style.display = "none";
        this.#timer.style.display = "none";
        this.#instructions.style.display = "none";
        this.#counter.style.display = 'none';
        if (this.#timerIntervalId != null) {
            clearInterval(this.#timerIntervalId);
        }
    }

    playHitSound() {
        this.#hitSounds[this.#clickCount % this.#hitSounds.length].play();
    }

    animateTarget() {
        this.#target.animate(this.#targetAnimation, this.#targetRotationTiming);
    }

    onTarget() {
        this.playHitSound();
        this.#clickCount++;
        this.#counter.textContent = this.#counterLabel + (targetCount - this.#clickCount);
        if (this.#clickCount >= targetCount) {
            this.cleanup();
            adSuccess();
            return;
        }
        this.moveTarget();
    }

    updateTimer() {
        this.#timeRemaining--;
        if (this.#timeRemaining < 0) {
            this.cleanup();
            adFail();
            return;
        }
        this.#timer.textContent = this.#timerLabel + this.#timeRemaining;
    }
}

(function init() {
    const game = new Game;
    createListeners(game);
})()

function createListeners(game) {
    window.addEventListener('message', (event) => onMessage(event, game));
    document.getElementById('skip').addEventListener('click', (event) => onSkip(event, game));
}

function onSkip(event, game) {
    event.target.style.display = 'none';
    game.start();
}

function onMessage(event, game) {
    const skipButton = document.getElementById('skip');
    if (!event.data || !event.data.type) return;
    
    if (event.data.type === 'adStarted') {
        skipButton.style.display = 'block';
    }
    
    // By default, if the user doesn't "skip" the ad before the video ends,
    // we call fail to restart. You're welcome to replace this with a survey
    // or other interaction instead (see examples/survey).
    if (event.data.type === 'adFinished') {
        skipButton.style.display = 'none';
        window.top.postMessage({ type: 'fail' }, '*');
        game.cleanup();
    }
}

// This is how you tell the parent window that the ad was successfully skipped.
function adSuccess() {
    window.top.postMessage({ type: 'success' }, '*');
}

function adFail() {
    document.getElementById('skip').style.display = 'none';
    window.top.postMessage({ type: 'fail' }, '*');
}
