// Peterson's Solution Simulator
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const speedSlider = document.getElementById('speed');
    const flag0Element = document.getElementById('flag0');
    const flag1Element = document.getElementById('flag1');
    const turnElement = document.getElementById('turn');
    const criticalSectionElement = document.getElementById('critical-section');
    const state0Element = document.getElementById('state0');
    const state1Element = document.getElementById('state1');
    const logElement = document.getElementById('simulation-log');
    const pointer0 = document.getElementById('pointer0');
    const pointer1 = document.getElementById('pointer1');
    const code0Element = document.getElementById('code0');
    const code1Element = document.getElementById('code1');

    // Simulation state
    let isRunning = false;
    let flag = [false, false];
    let turn = 0;
    let process0Lines = code0Element.textContent.split('\n');
    let process1Lines = code1Element.textContent.split('\n');
    let process0CurrentLine = 3; // Skip initialization
    let process1CurrentLine = 3; // Skip initialization
    let process0State = 'Ready';
    let process1State = 'Ready';
    let process0Waiting = false;
    let process1Waiting = false;
    let intervalId;
    let simulationSpeed = 11 - speedSlider.value; // Invert so higher value = faster

    // Initial process line heights for pointer positioning
    const process0LineHeight = 24;
    const process1LineHeight = 24;

    // Initialize visual state
    updateVisualState();

    // Event listeners
    startBtn.addEventListener('click', toggleSimulation);
    resetBtn.addEventListener('click', resetSimulation);
    speedSlider.addEventListener('input', updateSpeed);

    function toggleSimulation() {
        if (isRunning) {
            pauseSimulation();
            startBtn.textContent = 'Resume Simulation';
        } else {
            startSimulation();
            startBtn.textContent = 'Pause Simulation';
        }
    }

    function startSimulation() {
        isRunning = true;
        intervalId = setInterval(simulationStep, simulationSpeed * 100);
    }

    function pauseSimulation() {
        isRunning = false;
        clearInterval(intervalId);
    }

    function resetSimulation() {
        pauseSimulation();
        startBtn.textContent = 'Start Simulation';
        
        // Reset state
        flag = [false, false];
        turn = 0;
        process0CurrentLine = 3;
        process1CurrentLine = 3;
        process0State = 'Ready';
        process1State = 'Ready';
        process0Waiting = false;
        process1Waiting = false;
        
        // Clear log
        logElement.innerHTML = '';
        
        // Update UI
        updateVisualState();
        log('Simulation reset');
    }

    function updateSpeed() {
        simulationSpeed = 11 - speedSlider.value;
        if (isRunning) {
            clearInterval(intervalId);
            intervalId = setInterval(simulationStep, simulationSpeed * 100);
        }
    }

    function simulationStep() {
        // Process 0 execution
        if (!process0Waiting) {
            executeProcess0Line();
        }
        
        // Process 1 execution
        if (!process1Waiting) {
            executeProcess1Line();
        }
        
        // Check busy wait conditions
        checkWaitConditions();
        
        // Update visual state
        updateVisualState();
    }

    function executeProcess0Line() {
        const line = process0Lines[process0CurrentLine].trim();
        
        if (line.includes('flag[0] = true')) {
            flag[0] = true;
            log('Process 0: Setting flag[0] to true');
            process0CurrentLine++;
        } else if (line.includes('turn = 1')) {
            turn = 1;
            log('Process 0: Setting turn to 1');
            process0CurrentLine++;
        } else if (line.includes('while(flag[1] && turn == 1)')) {
            if (flag[1] && turn === 1) {
                process0Waiting = true;
                process0State = 'Waiting';
                log('Process 0: Busy waiting (flag[1]=' + flag[1] + ', turn=' + turn + ')');
            } else {
                log('Process 0: Proceeding (wait condition false)');
                process0CurrentLine++;
            }
        } else if (line.includes('// critical section')) {
            process0State = 'Critical Section';
            criticalSectionElement.textContent = 'Process 0 in critical section';
            criticalSectionElement.className = 'cs-process0';
            log('Process 0: Entered critical section');
            process0CurrentLine++;
            
            // Simulate work in critical section
            setTimeout(() => {
                if (process0State === 'Critical Section') {
                    process0CurrentLine++;
                }
            }, simulationSpeed * 300);
        } else if (line.includes('flag[0] = false')) {
            flag[0] = false;
            process0State = 'Completed';
            criticalSectionElement.textContent = 'No process in critical section';
            criticalSectionElement.className = 'cs-empty';
            log('Process 0: Setting flag[0] to false, exiting critical section');
            process0CurrentLine++;
            
            // Reset process after completion
            setTimeout(() => {
                if (process0State === 'Completed') {
                    process0CurrentLine = 3;
                    process0State = 'Ready';
                    log('Process 0: Reset and ready');
                }
            }, simulationSpeed * 500);
        } else if (line !== '') {
            // Skip comments or empty lines
            process0CurrentLine++;
        } else {
            process0CurrentLine++;
        }
    }

    function executeProcess1Line() {
        const line = process1Lines[process1CurrentLine].trim();
        
        if (line.includes('flag[1] = true')) {
            flag[1] = true;
            log('Process 1: Setting flag[1] to true');
            process1CurrentLine++;
        } else if (line.includes('turn = 0')) {
            turn = 0;
            log('Process 1: Setting turn to 0');
            process1CurrentLine++;
        } else if (line.includes('while(flag[0] && turn == 0)')) {
            if (flag[0] && turn === 0) {
                process1Waiting = true;
                process1State = 'Waiting';
                log('Process 1: Busy waiting (flag[0]=' + flag[0] + ', turn=' + turn + ')');
            } else {
                log('Process 1: Proceeding (wait condition false)');
                process1CurrentLine++;
            }
        } else if (line.includes('// critical section')) {
            process1State = 'Critical Section';
            criticalSectionElement.textContent = 'Process 1 in critical section';
            criticalSectionElement.className = 'cs-process1';
            log('Process 1: Entered critical section');
            process1CurrentLine++;
            
            // Simulate work in critical section
            setTimeout(() => {
                if (process1State === 'Critical Section') {
                    process1CurrentLine++;
                }
            }, simulationSpeed * 300);
        } else if (line.includes('flag[1] = false')) {
            flag[1] = false;
            process1State = 'Completed';
            criticalSectionElement.textContent = 'No process in critical section';
            criticalSectionElement.className = 'cs-empty';
            log('Process 1: Setting flag[1] to false, exiting critical section');
            process1CurrentLine++;
            
            // Reset process after completion
            setTimeout(() => {
                if (process1State === 'Completed') {
                    process1CurrentLine = 3;
                    process1State = 'Ready';
                    log('Process 1: Reset and ready');
                }
            }, simulationSpeed * 500);
        } else if (line !== '') {
            // Skip comments or empty lines
            process1CurrentLine++;
        } else {
            process1CurrentLine++;
        }
    }

    function checkWaitConditions() {
        // Check if process 0 can proceed
        if (process0Waiting && !(flag[1] && turn === 1)) {
            process0Waiting = false;
            process0State = 'Running';
            process0CurrentLine++;
            log('Process 0: Wait condition resolved, proceeding');
        }
        
        // Check if process 1 can proceed
        if (process1Waiting && !(flag[0] && turn === 0)) {
            process1Waiting = false;
            process1State = 'Running';
            process1CurrentLine++;
            log('Process 1: Wait condition resolved, proceeding');
        }
    }

    function updateVisualState() {
        // Update variable displays
        flag0Element.textContent = flag[0].toString();
        flag1Element.textContent = flag[1].toString();
        turnElement.textContent = turn.toString();
        
        // Update process states
        state0Element.textContent = process0State;
        state1Element.textContent = process1State;
        
        // Update execution pointer positions
        updatePointer(pointer0, process0CurrentLine, process0LineHeight);
        updatePointer(pointer1, process1CurrentLine, process1LineHeight);
        
        // Highlight active lines
        highlightActiveLine('code0', process0CurrentLine);
        highlightActiveLine('code1', process1CurrentLine);
    }

    function updatePointer(pointerElement, currentLine, lineHeight) {
        const top = (currentLine * lineHeight) + 15;
        pointerElement.style.top = top + 'px';
        pointerElement.style.opacity = '1';
    }

    function highlightActiveLine(codeElementId, currentLine) {
        // Remove previous highlights
        const codeElement = document.getElementById(codeElementId);
        const lines = codeElement.querySelectorAll('.active-line');
        lines.forEach(line => line.classList.remove('active-line'));
        
        // Add new highlight
        const codeLines = codeElement.textContent.split('\n');
        if (currentLine < codeLines.length) {
            // Create a span for each line if not exists
            if (codeElement.innerHTML.indexOf('<span') === -1) {
                const formattedCode = codeLines.map(line => 
                    `<span class="code-line">${line}</span>`
                ).join('\n');
                codeElement.innerHTML = formattedCode;
            }
            
            const lineElements = codeElement.querySelectorAll('.code-line');
            if (lineElements[currentLine]) {
                lineElements[currentLine].classList.add('active-line');
            }
        }
    }

    function log(message) {
        const entry = document.createElement('li');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logElement.prepend(entry);
        
        // Limit log entries
        if (logElement.children.length > 50) {
            logElement.removeChild(logElement.lastChild);
        }
    }

    // Initial log
    log('Simulation initialized');
});