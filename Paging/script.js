document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const algorithmSelect = document.getElementById('algorithm');
    const framesInput = document.getElementById('frames');
    const initializeBtn = document.getElementById('initialize');
    const pageNumberInput = document.getElementById('page-number');
    const accessPageBtn = document.getElementById('access-page');
    const resetBtn = document.getElementById('reset');
    const simulationDiv = document.getElementById('simulation');
    const framesContainer = document.getElementById('frames-container');
    const historyContainer = document.getElementById('history-container');
    const pageFaultsSpan = document.getElementById('page-faults');
    const accessStatusSpan = document.getElementById('access-status');
    const currentAlgorithmSpan = document.getElementById('current-algorithm');
    const algorithmDescriptionSpan = document.getElementById('algorithm-description');
    const optimalSequenceContainer = document.getElementById('optimal-sequence-container');
    const optimalSequenceInput = document.getElementById('optimal-sequence');
    const optimalSetupSection = document.getElementById('optimal-setup-section');
    const descriptions = { // desc of algos 
        'fifo': '',
        'lru': '',
        'lfu': '',
        'random': '',
        'optimal': ''
    };
    algorithmSelect.addEventListener('change', function() { // updating 
        const selectedAlgorithm = algorithmSelect.value;
        algorithmDescriptionSpan.textContent = descriptions[selectedAlgorithm];
        if (selectedAlgorithm === 'optimal') {
            optimalSetupSection.classList.remove('hidden');
        } else {
            optimalSetupSection.classList.add('hidden');
        }
        if (!simulationDiv.classList.contains('hidden')) {
            if (confirm('changing the algorithm will reset the simulation!')) {
                simulationDiv.classList.add('hidden');
            } else {
                algorithmSelect.value = currentAlgorithm;
                algorithmDescriptionSpan.textContent = descriptions[currentAlgorithm];
                if (currentAlgorithm === 'optimal') {
                    optimalSetupSection.classList.remove('hidden');
                } else {
                    optimalSetupSection.classList.add('hidden');
                }
            }
        }
    });
    algorithmDescriptionSpan.textContent = descriptions[algorithmSelect.value];
    let memory = []; // variables 
    let pageOrder = []; 
    let pageUsage = {}; 
    let pageFrequency = {}; 
    let pageFaults = 0;
    let currentAlgorithm = '';
    let futureSequence = []; 
    let currentIndex = 0; 
    initializeBtn.addEventListener('click', function() { // hiding simluation until initaliised 
        simulationDiv.classList.remove('hidden');
        memory = [];
        pageOrder = [];
        pageUsage = {};
        pageFrequency = {};
        pageFaults = 0;
        currentIndex = 0;
        const numFrames = parseInt(framesInput.value);
        currentAlgorithm = algorithmSelect.value;
        if (currentAlgorithm === 'optimal') {
            const sequenceStr = optimalSequenceInput.value.trim();
            if (!sequenceStr) {
                alert('Please enter the future page sequence for Optimal algorithm!');
                simulationDiv.classList.add('hidden');
                return;
            }
            futureSequence = sequenceStr.split(',').map(function(item) {
                return parseInt(item.trim());
            }).filter(function(item) {
                return !isNaN(item);
            });
            if (futureSequence.length === 0) {
                alert('Please enter a valid comma-separated sequence of page numbers!');
                simulationDiv.classList.add('hidden');
                return;
            }
            displayOptimalSequence();
        }
        currentAlgorithmSpan.textContent = algorithmSelect.options[algorithmSelect.selectedIndex].text;
        pageFaultsSpan.textContent = '0';
        accessStatusSpan.textContent = 'None';
        framesContainer.innerHTML = '';
        historyContainer.innerHTML = '';
        for (let i = 0; i < numFrames; i++) {
            const frame = document.createElement('div');
            frame.className = 'frame empty';
            frame.textContent = 'Empty';
            framesContainer.appendChild(frame);
        }
        if (currentAlgorithm === 'optimal' && futureSequence.length > 0) {
            pageNumberInput.value = futureSequence[0];
            pageNumberInput.disabled = true;
        } else {
            pageNumberInput.disabled = false;
        }
    });
    function displayOptimalSequence() {
        optimalSequenceContainer.innerHTML = '';
        
        futureSequence.forEach((page, index) => {
            const sequenceItem = document.createElement('div');
            sequenceItem.className = 'sequence-item';
            if (index === currentIndex) {
                sequenceItem.classList.add('current');
            } else if (index < currentIndex) {
                sequenceItem.classList.add('processed');
            }
            sequenceItem.textContent = page;
            optimalSequenceContainer.appendChild(sequenceItem);
        });
    }
    accessPageBtn.addEventListener('click', function() {
        if (simulationDiv.classList.contains('hidden')) {
            alert('Please initialize the simulation first!');
            return;
        }
        
        let pageNum;
        if (currentAlgorithm === 'optimal') {
            if (currentIndex >= futureSequence.length) {
                alert('End of sequence reached!');
                return;
            }
            
            pageNum = futureSequence[currentIndex];
            currentIndex++;
            displayOptimalSequence();
            
            // Update the page number input to show the current page
            if (currentIndex < futureSequence.length) {
                pageNumberInput.value = futureSequence[currentIndex];
            }
        } else {
            pageNum = parseInt(pageNumberInput.value);
            if (isNaN(pageNum)) {
                alert('Please enter a valid page number!');
                return;
            }
        }
        
        // hit
        const pageIndex = memory.indexOf(pageNum);
        
        if (pageIndex !== -1) {
            // Hit
            accessStatusSpan.textContent = 'Hit';
            
            // Highlighting part 
            const frames = framesContainer.querySelectorAll('.frame');
            frames[pageIndex].classList.add('highlight');
            setTimeout(() => {
                frames[pageIndex].classList.remove('highlight');
            }, 1000);
            if (currentAlgorithm === 'lru') {
                pageUsage[pageNum] = Date.now();
            }
            if (currentAlgorithm === 'lfu') {
                pageFrequency[pageNum]++;
            }
            addToHistory(pageNum, true);
        } else {
            // Miss
            pageFaults++;
            pageFaultsSpan.textContent = pageFaults;
            accessStatusSpan.textContent = 'Miss';
            if (memory.length < framesContainer.children.length) { // if full 
               
                memory.push(pageNum);
                
                
                const emptyFrame = framesContainer.querySelector('.frame.empty');
                emptyFrame.textContent = pageNum;
                emptyFrame.classList.remove('empty');
                pageOrder.push(pageNum);
                if (currentAlgorithm === 'lru') {
                    pageUsage[pageNum] = Date.now();
                }
                if (currentAlgorithm === 'lfu') {
                    pageFrequency[pageNum] = 1;
                }
            } else {
                let replaceIndex;
                switch(currentAlgorithm) {
                    case 'fifo':
                        const oldestPage = pageOrder.shift();
                        replaceIndex = memory.indexOf(oldestPage);
                        pageOrder.push(pageNum);
                        break;
                    
                    case 'lru':
                        let leastRecentUsage = Infinity;
                        memory.forEach((page, index) => {
                            if (pageUsage[page] < leastRecentUsage) {
                                leastRecentUsage = pageUsage[page];
                                replaceIndex = index;
                            }
                        });
                        pageUsage[pageNum] = Date.now();
                        break;
                    
                    case 'lfu':
                        
                        let leastFrequency = Infinity;
                        let leastFreqPages = [];
                        
                        
                        memory.forEach(page => {
                            if (pageFrequency[page] < leastFrequency) {
                                leastFrequency = pageFrequency[page];
                            }
                        });
                        
                        memory.forEach(page => {
                            if (pageFrequency[page] === leastFrequency) {
                                leastFreqPages.push(page);
                            }
                        });
                        
                        if (leastFreqPages.length > 1) {
                            
                            let oldestLeastFreqPage = null;
                            let oldestIndex = Infinity;
                            
                            
                            leastFreqPages.forEach(page => {
                                const indexInOrder = pageOrder.indexOf(page);
                                if (indexInOrder < oldestIndex) {
                                    oldestIndex = indexInOrder;
                                    oldestLeastFreqPage = page;
                                }
                            });
                            
                            replaceIndex = memory.indexOf(oldestLeastFreqPage);
                        } else {
                           
                            replaceIndex = memory.indexOf(leastFreqPages[0]);
                        }
                        
                       
                        const replacedPage = memory[replaceIndex];
                        pageOrder.splice(pageOrder.indexOf(replacedPage), 1);
                        pageOrder.push(pageNum);
                        
                        
                        pageFrequency[pageNum] = 1;
                        break;
                    
                    case 'optimal':
                        
                        let farthestUseIndex = -1;
                        let farthestPage = -1;
                        
                        
                        for (let i = 0; i < memory.length; i++) {
                            const page = memory[i];
                            
                            
                            let nextUseIndex = futureSequence.indexOf(page, currentIndex);
                            
                            
                            if (nextUseIndex === -1) {
                                replaceIndex = i;
                                farthestPage = page;
                                break;
                            }
                            
                            
                            if (nextUseIndex > farthestUseIndex) {
                                farthestUseIndex = nextUseIndex;
                                farthestPage = page;
                                replaceIndex = i;
                            }
                        }
                        break;
                        
                    case 'random':
                        replaceIndex = Math.floor(Math.random() * memory.length);
                        break;
                }
                const frames = framesContainer.querySelectorAll('.frame');
                frames[replaceIndex].classList.add('replaced');
                setTimeout(() => {
                    frames[replaceIndex].textContent = pageNum;
                    frames[replaceIndex].classList.remove('replaced');
                }, 1000);
                memory[replaceIndex] = pageNum;
            }
            addToHistory(pageNum, false);
        }
    });
    resetBtn.addEventListener('click', function() {
        simulationDiv.classList.add('hidden');
        framesInput.value = '3';
        pageNumberInput.disabled = false;
    });
    function addToHistory(pageNum, isHit) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${isHit ? 'history-hit' : 'history-miss'}`;
        historyItem.textContent = pageNum;
        historyContainer.appendChild(historyItem);
        if (historyContainer.children.length > 20) {
            historyContainer.removeChild(historyContainer.firstChild);
        }
    }
});