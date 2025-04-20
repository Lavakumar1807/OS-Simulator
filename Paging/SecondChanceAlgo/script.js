document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const framesContainer = document.getElementById('frames');
    const pagesSequence = document.getElementById('pages-sequence');
    const frameCountInput = document.getElementById('frame-count');
    const referenceStringInput = document.getElementById('reference-string');
    const speedSelect = document.getElementById('speed');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const stepBtn = document.getElementById('step-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const pageFaultsElement = document.getElementById('page-faults');
    const hitRatioElement = document.getElementById('hit-ratio');
    const pointerElement = document.getElementById('pointer');

    // Variables
    let frames = [];
    let referenceString = [];
    let currentIndex = 0;
    let pageFaults = 0;
    let intervalId = null;
    let pointerPosition = 0;
    let isRunning = false;

    function initialize() {
        frames = [];
        referenceString = referenceStringInput.value.split(',').map(page => page.trim());
        currentIndex = 0;
        pageFaults = 0;
        pointerPosition = 0;
        isRunning = false;

        updateFramesDisplay();
        updatePagesSequence();
        updateStats();
    }

    function updateFramesDisplay() {
        framesContainer.innerHTML = '';

        const frameCount = parseInt(frameCountInput.value);

        for (let i = 0; i < frameCount; i++) {
            const frameElement = document.createElement('div');
            frameElement.className = 'frame frame-empty';
            frameElement.id = `frame-${i}`;

            const frameNumberElement = document.createElement('div');
            frameNumberElement.className = 'frame-number';
            frameNumberElement.textContent = '-';

            const frameLabelElement = document.createElement('div');
            frameLabelElement.className = 'frame-label';
            frameLabelElement.textContent = `Frame ${i + 1}`;

            const referenceBitElement = document.createElement('div');
            referenceBitElement.className = 'reference-bit';

            frameElement.appendChild(frameNumberElement);
            frameElement.appendChild(frameLabelElement);
            frameElement.appendChild(referenceBitElement);
            framesContainer.appendChild(frameElement);
        }

        updatePointer();
    }

    function updatePagesSequence() {
        pagesSequence.innerHTML = '';

        referenceString.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'page';
            pageElement.textContent = page;
            pageElement.dataset.index = index;

            if (index < currentIndex) {
                if (document.querySelector(`.frame .frame-number[data-original-index="${index}"]`)) {
                    pageElement.classList.add('hit');
                } else {
                    pageElement.classList.add('fault');
                }
            }

            if (index === currentIndex) {
                pageElement.classList.add('active');
            }

            pagesSequence.appendChild(pageElement);
        });
    }

    function updateFrameState() {
        const frameElements = document.querySelectorAll('.frame');

        frameElements.forEach((frameElement, index) => {
            if (index < frames.length) {
                const frame = frames[index];
                frameElement.classList.remove('frame-empty');

                const frameNumberElement = frameElement.querySelector('.frame-number');
                frameNumberElement.textContent = frame.page;
                frameNumberElement.dataset.originalIndex = frame.originalIndex;

                const referenceBitElement = frameElement.querySelector('.reference-bit');
                if (frame.referenceBit) {
                    referenceBitElement.classList.add('active');
                } else {
                    referenceBitElement.classList.remove('active');
                }
            } else {
                frameElement.classList.add('frame-empty');
                const frameNumberElement = frameElement.querySelector('.frame-number');
                frameNumberElement.textContent = '-';
                delete frameNumberElement.dataset.originalIndex;

                const referenceBitElement = frameElement.querySelector('.reference-bit');
                referenceBitElement.classList.remove('active');
            }
        });

        updatePointer();
    }

    function updatePointer() {
        const currentFrame = document.getElementById(`frame-${pointerPosition}`);
        if (currentFrame) {
            const leftPosition = (currentFrame.offsetLeft + currentFrame.offsetWidth / 2) - (pointerElement.offsetWidth / 2);
            pointerElement.style.position = 'absolute';
            pointerElement.style.left = `${leftPosition}px`;
            pointerElement.style.transform = 'none';
        }
    }

    function updateStats() {
        pageFaultsElement.textContent = `Page Faults: ${pageFaults}`;
        const hitRatio = currentIndex > 0 ? ((currentIndex - pageFaults) / currentIndex * 100).toFixed(2) : 0;
        hitRatioElement.textContent = `Hit Ratio: ${hitRatio}%`;
    }

    function step() {
        if (currentIndex >= referenceString.length) {
            clearInterval(intervalId);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            return;
        }

        const currentPage = referenceString[currentIndex];
        let pageFound = false;

        // Check if page is already in a frame
        for (let i = 0; i < frames.length; i++) {
            if (frames[i].page === currentPage) {
                frames[i].referenceBit = 1;
                frames[i].originalIndex = currentIndex;
                pageFound = true;
                break;
            }
        }

        if (!pageFound) {
            pageFaults++;
            const frameCount = parseInt(frameCountInput.value);

            if (frames.length < frameCount) {
                frames.push({
                    page: currentPage,
                    referenceBit: 1,
                    originalIndex: currentIndex
                });
            } else {
                let victimFound = false;
                while (!victimFound) {
                    if (frames[pointerPosition].referenceBit === 0) {
                        frames[pointerPosition] = {
                            page: currentPage,
                            referenceBit: 1,
                            originalIndex: currentIndex
                        };
                        victimFound = true;
                        // 🔧 Move pointer after replacement
                        pointerPosition = (pointerPosition + 1) % frameCount;
                    } else {
                        frames[pointerPosition].referenceBit = 0;
                        pointerPosition = (pointerPosition + 1) % frameCount;
                    }
                }
            }
        }

        updateFrameState();
        currentIndex++;
        updatePagesSequence();
        updateStats();
    }

    function startSimulation() {
        if (isRunning) return;

        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        const speed = parseInt(speedSelect.value);
        intervalId = setInterval(step, speed);
    }

    function pauseSimulation() {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    function resetSimulation() {
        clearInterval(intervalId);
        initialize();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // Event listeners
    startBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);
    stepBtn.addEventListener('click', step);
    pauseBtn.addEventListener('click', pauseSimulation);

    frameCountInput.addEventListener('change', function () {
        if (isRunning) pauseSimulation();
        resetSimulation();
    });

    referenceStringInput.addEventListener('change', function () {
        if (isRunning) pauseSimulation();
        resetSimulation();
    });

    initialize();
});
