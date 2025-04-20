document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const framesInput = document.getElementById('frames');
    const referenceStringInput = document.getElementById('reference-string');
    const startBtn = document.getElementById('start-btn');
    const stepBtn = document.getElementById('step-btn');
    const resetBtn = document.getElementById('reset-btn');
    const framesDisplay = document.getElementById('frames-display');
    const referenceDisplay = document.getElementById('reference-display');
    const hitsElement = document.getElementById('hits');
    const faultsElement = document.getElementById('faults');
    const hitRatioElement = document.getElementById('hit-ratio');

    // Simulation state
    let frames = [];
    let referenceString = [];
    let currentRefIndex = 0;
    let handPointer = 0;
    let hits = 0;
    let faults = 0;
    let isSimulationStarted = false;
    let searchingForVictim = false;
    let currentSearchClass = 0; // 0 to 3 representing (0,0), (0,1), (1,0), (1,1)
    let roundComplete = false;
    let statusMessage = '';

    // Initialize simulation
    function initializeSimulation() {
        // Parse input values
        const numFrames = parseInt(framesInput.value);
        const refString = referenceStringInput.value.trim().split(/\s+/).map(Number);
        
        // Validate inputs
        if (isNaN(numFrames) || numFrames <= 0 || numFrames > 10) {
            alert('Please enter a valid number of frames (1-10)');
            return false;
        }
        
        if (refString.length === 0 || refString.some(isNaN)) {
            alert('Please enter a valid reference string (space-separated numbers)');
            return false;
        }
        
        // Initialize simulation state
        frames = Array(numFrames).fill().map(() => ({
            page: null,
            referenced: 0,
            modified: 0
        }));
        
        referenceString = refString;
        currentRefIndex = 0;
        handPointer = 0;
        hits = 0;
        faults = 0;
        searchingForVictim = false;
        currentSearchClass = 0;
        roundComplete = false;
        statusMessage = '';
        
        // Update UI
        renderFrames();
        renderReferenceString();
        updateStats();
        
        return true;
    }

    // Render frames
    function renderFrames() {
        framesDisplay.innerHTML = '';
        
        frames.forEach((frame, index) => {
            const frameElement = document.createElement('div');
            frameElement.classList.add('frame');
            
            if (index === handPointer) {
                frameElement.classList.add('active');
                const pointerElement = document.createElement('div');
                pointerElement.classList.add('pointer');
                pointerElement.textContent = '↓';
                frameElement.appendChild(pointerElement);
            }
            
            const frameContent = document.createElement('div');
            frameContent.classList.add('frame-content');
            
            if (frame.page !== null) {
                const frameNumber = document.createElement('div');
                frameNumber.classList.add('frame-number');
                frameNumber.textContent = frame.page;
                frameContent.appendChild(frameNumber);
                
                const frameBits = document.createElement('div');
                frameBits.classList.add('frame-bits');
                
                const refBit = document.createElement('div');
                refBit.classList.add('bit');
                refBit.innerHTML = `<span class="bit-label">R:</span><span class="bit-value">${frame.referenced}</span>`;
                frameBits.appendChild(refBit);
                
                const modBit = document.createElement('div');
                modBit.classList.add('bit');
                modBit.innerHTML = `<span class="bit-label">M:</span><span class="bit-value">${frame.modified}</span>`;
                frameBits.appendChild(modBit);
                
                frameContent.appendChild(frameBits);
            } else {
                const emptyFrame = document.createElement('div');
                emptyFrame.classList.add('empty-frame');
                emptyFrame.textContent = 'Empty';
                frameContent.appendChild(emptyFrame);
            }
            
            frameElement.appendChild(frameContent);
            framesDisplay.appendChild(frameElement);
        });
        
        // Add status message if any
        if (statusMessage) {
            const statusElement = document.createElement('div');
            statusElement.classList.add('status-message');
            
            if (statusMessage.includes('Hit')) {
                statusElement.classList.add('status-hit');
            } else if (statusMessage.includes('Fault')) {
                statusElement.classList.add('status-fault');
            }
            
            statusElement.textContent = statusMessage;
            framesDisplay.appendChild(statusElement);
        }
    }

    // Render reference string
    function renderReferenceString() {
        referenceDisplay.innerHTML = '';
        
        referenceString.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.classList.add('reference-item');
            pageElement.textContent = page;
            
            if (index === currentRefIndex) {
                pageElement.classList.add('current');
            } else if (index < currentRefIndex) {
                pageElement.classList.add('processed');
                
                // Add hit/fault visual indicator
                if (index === currentRefIndex - 1) {
                    if (statusMessage.includes('Hit')) {
                        pageElement.classList.add('page-hit');
                    } else if (statusMessage.includes('Fault')) {
                        pageElement.classList.add('page-fault');
                    }
                }
            }
            
            referenceDisplay.appendChild(pageElement);
        });
    }

    // Update stats
    function updateStats() {
        const total = hits + faults;
        const hitRatio = total === 0 ? 0 : (hits / total * 100).toFixed(2);
        
        hitsElement.textContent = hits;
        faultsElement.textContent = faults;
        hitRatioElement.textContent = `${hitRatio}%`;
    }

    // Perform one step of the algorithm
    function performStep() {
        if (currentRefIndex >= referenceString.length) {
            alert('Simulation completed');
            stepBtn.disabled = true;
            return;
        }
        
        const currentPage = referenceString[currentRefIndex];
        
        // If we're not searching for a victim, check if page is already in frames
        if (!searchingForVictim) {
            const frameIndex = frames.findIndex(frame => frame.page === currentPage);
            
            if (frameIndex !== -1) {
                // Page hit
                frames[frameIndex].referenced = 1;
                // Randomly set modified bit (50% chance)
                frames[frameIndex].modified = Math.random() > 0.5 ? 1 : frames[frameIndex].modified;
                hits++;
                statusMessage = `Page Hit! Page ${currentPage} is already in frame ${frameIndex + 1}`;
                currentRefIndex++;
            } else {
                // Page fault - check if there's an empty frame
                const emptyFrameIndex = frames.findIndex(frame => frame.page === null);
                
                if (emptyFrameIndex !== -1) {
                    // Place page in empty frame
                    frames[emptyFrameIndex].page = currentPage;
                    frames[emptyFrameIndex].referenced = 1;
                    // Randomly set modified bit (50% chance)
                    frames[emptyFrameIndex].modified = Math.random() > 0.5 ? 1 : 0;
                    faults++;
                    statusMessage = `Page Fault! Page ${currentPage} placed in empty frame ${emptyFrameIndex + 1}`;
                    currentRefIndex++;
                } else {
                    // Need to find a victim frame using the extended second chance algorithm
                    searchingForVictim = true;
                    currentSearchClass = 0;
                    statusMessage = `Page Fault! Looking for victim frame - searching class (0,0)`;
                }
            }
        } else {
            // We are searching for a victim
            // Check if current frame matches our search criteria
            const currentFrame = frames[handPointer];
            
            // Class 0: (0,0) - Not referenced, not modified
            // Class 1: (0,1) - Not referenced, modified
            // Class 2: (1,0) - Referenced, not modified
            // Class 3: (1,1) - Referenced, modified
            
            let frameMatches = false;
            
            switch (currentSearchClass) {
                case 0: // (0,0)
                    frameMatches = currentFrame.referenced === 0 && currentFrame.modified === 0;
                    break;
                case 1: // (0,1)
                    frameMatches = currentFrame.referenced === 0 && currentFrame.modified === 1;
                    break;
                case 2: // (1,0)
                    if (currentFrame.referenced === 1 && currentFrame.modified === 0) {
                        // Found class (1,0), but give second chance by clearing reference bit
                        currentFrame.referenced = 0;
                        statusMessage = `Giving second chance to frame ${handPointer + 1} (page ${currentFrame.page})`;
                    }
                    break;
                case 3: // (1,1)
                    if (currentFrame.referenced === 1 && currentFrame.modified === 1) {
                        // Found class (1,1), but give second chance by clearing reference bit
                        currentFrame.referenced = 0;
                        statusMessage = `Giving second chance to frame ${handPointer + 1} (page ${currentFrame.page})`;
                    }
                    break;
            }
            
            // If we found a frame matching classes (0,0) or (0,1), replace it
            if ((currentSearchClass === 0 || currentSearchClass === 1) && frameMatches) {
                statusMessage = `Replacing page ${currentFrame.page} in frame ${handPointer + 1} with page ${currentPage}`;
                currentFrame.page = currentPage;
                currentFrame.referenced = 1;
                // Randomly set modified bit (50% chance)
                currentFrame.modified = Math.random() > 0.5 ? 1 : 0;
                faults++;
                currentRefIndex++;
                searchingForVictim = false;
                currentSearchClass = 0;
            } else {
                // Move hand pointer to the next frame
                handPointer = (handPointer + 1) % frames.length;
                
                // If we've made a full circle and still in the same search class
                if (handPointer === 0) {
                    roundComplete = true;
                }
                
                // If we've made a full circle, move to the next class
                if (roundComplete) {
                    roundComplete = false;
                    currentSearchClass++;
                    
                    // If we've gone through all classes, start over
                    if (currentSearchClass > 3) {
                        currentSearchClass = 0;
                    }
                    
                    statusMessage = `Moving to search class ${currentSearchClass}`;
                }
            }
        }
        
        renderFrames();
        renderReferenceString();
        updateStats();
    }

    // Reset simulation
    function resetSimulation() {
        frames = [];
        referenceString = [];
        currentRefIndex = 0;
        handPointer = 0;
        hits = 0;
        faults = 0;
        isSimulationStarted = false;
        searchingForVictim = false;
        currentSearchClass = 0;
        roundComplete = false;
        statusMessage = '';
        
        startBtn.disabled = false;
        stepBtn.disabled = true;
        
        framesDisplay.innerHTML = '';
        referenceDisplay.innerHTML = '';
        updateStats();
    }

    // Event listeners
    startBtn.addEventListener('click', () => {
        if (initializeSimulation()) {
            isSimulationStarted = true;
            startBtn.disabled = true;
            stepBtn.disabled = false;
        }
    });

    stepBtn.addEventListener('click', () => {
        if (isSimulationStarted) {
            performStep();
        }
    });

    resetBtn.addEventListener('click', resetSimulation);

    // Initialize the UI
    resetSimulation();
});