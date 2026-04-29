// Configuration
const targetCount = 16;
const targetTimeSeconds = 10;

const hitSounds = [
    new Audio('assets/hit1.ogg'),
    new Audio('assets/hit2.ogg'),
    new Audio('assets/hit3.ogg'),
    new Audio('assets/hit4.ogg'),
    new Audio('assets/hit5.ogg'),
    new Audio('assets/hit6.ogg'),
    new Audio('assets/hit7.ogg'),
    new Audio('assets/hit8.ogg'),
];

(function init() {
    createListeners();
})()

function createListeners() {
    window.addEventListener('message', onMessage);
    const skipButton = document.getElementById('skip');
    skipButton.addEventListener('click', onSkip);
}

function onSkip(event) {
    const instructions = document.getElementById('instructions');
    event.target.style.display = 'none';
    instructions.style.display = 'block';
    startGame(targetCount, targetTimeSeconds);
}

function onMessage(event) {
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

function playHitSound(clickNumber) {
    hitSounds[clickNumber % hitSounds.length].play();
}

const targetAnimation = [
    { transform: "scale(1)" },
    { transform: "scale(0.9)" },
    { transform: "scale(1)" },
];

const elementRotationTiming = {
    duration: 1000,
    iterations: targetTimeSeconds
};

function rotateElement(element) {
    element.animate(targetAnimation, elementRotationTiming);
}

function cleanup() {
    const target = document.getElementById("target");
    const timer = document.getElementById("timer");
    const instructions = document.getElementById("instructions");
    const counter = document.getElementById("counter");

    target.removeEventListener('click', onTarget);
    target.style.display = "none";
    timer.style.display = "none";
    instructions.style.display = "none";
    counter.style.display = 'none';
    if (timerIntervalId != null) {
        clearInterval(timerIntervalId);
    }
}

function startGame(targetCount, targetTimeMs) {
    const overlayContainer = document.getElementById("overlay-container");
    const target = document.getElementById("target");
    const instructions = document.getElementById("instructions");
    const timer = document.getElementById("timer");
    const counter = document.getElementById("counter");
    
    // Bounds of target.
    const maxX = overlayContainer.offsetWidth - target.naturalWidth;
    const minY = instructions.offsetTop + instructions.offsetHeight;
    const maxY = overlayContainer.offsetHeight - target.naturalHeight;
    
    // Initial state.
    moveTarget();
    
    target.style.display = 'block';
    rotateElement(target);
    
    timer.style.display = 'block';
    const timerLabel = 'Time: ';
    timer.textContent = timerLabel + targetTimeSeconds;
    let time = targetTimeSeconds;
    let timerIntervalId = null;
    
    counter.style.display = 'block';
    const counterLabel = 'Targets left: ';
    counter.textContent = counterLabel + targetCount;
    
    let clicks = 0;
    
    function onTarget() {
        playHitSound(clicks);
        clicks++;
        counter.textContent = counterLabel + (targetCount - clicks);
        if (clicks >= targetCount) {
            cleanup();
            adSuccess();
            return;
        }
        moveTarget();
    }
    
    // Call when game ends.
    function cleanup() {
        target.removeEventListener('click', onTarget);
        target.style.display = "none";
        timer.style.display = "none";
        instructions.style.display = "none";
        counter.style.display = 'none';
        if (timerIntervalId != null) {
            clearInterval(timerIntervalId);
        }
    }
    
    function updateTimer() {
        time--;
        if (time < 0) {
            cleanup();
            adFail();
            return;
        }
        timer.textContent = timerLabel + time;
    }
    
    // Moves target to random location.
    function moveTarget() {
        let x = Math.random() * maxX;
        let y = Math.random() * (maxY - minY) + minY;
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
    }
    
    target.addEventListener('click', onTarget);
    timerIntervalId = setInterval(updateTimer, 1000);
}
