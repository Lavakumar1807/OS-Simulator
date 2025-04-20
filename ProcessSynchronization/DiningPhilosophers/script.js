// Configuration
const NUM_PHILOSOPHERS = 5;

// State enums
const State = {
    THINKING: "THINKING",
    HUNGRY: "HUNGRY",
    EATING: "EATING"
};

// UI elements
const tableContainer = document.querySelector('.table-container');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const logElement = document.getElementById('log');
const statusElement = document.getElementById('status');
const speedSelect = document.getElementById('speed');
const stateTableBody = document.getElementById('state-body');
const criticalSectionElement = document.getElementById('critical-section');

// Colors
const COLORS = [
    '#3498db', // Blue
    '#e74c3c', // Red
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6'  // Purple
];

// STATE VARIABLES
let simulationSpeed = parseInt(speedSelect.value);
let running = false;
let philosophers = [];
let forks = [];
let timeoutIds = [];

// MONITOR IMPLEMENTATION
class DiningPhilosophersMonitor {
    constructor(numPhilosophers) {
        this.numPhilosophers = numPhilosophers;
        this.state = Array(numPhilosophers).fill(State.THINKING);
        this.inCriticalSection = null;
        this.waitingQueue = [];
    }

    // Helper method to check if a philosopher can eat
    canEat(id) {
        const left = (id + this.numPhilosophers - 1) % this.numPhilosophers;
        const right = (id + 1) % this.numPhilosophers;
        return this.state[id] === State.HUNGRY && 
               this.state[left] !== State.EATING && 
               this.state[right] !== State.EATING;
    }

    // Request to pickup forks (enter monitor)
    async pickup(id) {
        log(`Philosopher ${id} wants to eat and tries to enter monitor`);
        
        // Simulate entering monitor (critical section)
        await this.enterMonitor(id);
        
        // Inside monitor, change state to hungry
        this.state[id] = State.HUNGRY;
        log(`Philosopher ${id} is now HUNGRY`);
        updateUI();
        
        // Try to eat - if can't, wait
        if (this.canEat(id)) {
            this.state[id] = State.EATING;
            log(`Philosopher ${id} can eat now and takes both forks`);
            
            // Visual: pickup forks
            const leftForkId = id;
            const rightForkId = (id + this.numPhilosophers - 1) % this.numPhilosophers;
            pickupFork(leftForkId, id);
            pickupFork(rightForkId, id);
        } else {
            log(`Philosopher ${id} must wait (neighbors are eating)`);
        }
        
        // Release monitor
        this.exitMonitor();
        updateUI();
    }

    // Request to putdown forks (enter monitor)
    async putdown(id) {
        // Simulate entering monitor (critical section)
        await this.enterMonitor(id);
        
        // Inside monitor, change state to thinking
        this.state[id] = State.THINKING;
        log(`Philosopher ${id} finished eating and puts down forks`);
        
        // Visual: putdown forks
        const leftForkId = id;
        const rightForkId = (id + this.numPhilosophers - 1) % this.numPhilosophers;
        putdownFork(leftForkId);
        putdownFork(rightForkId);
        
        // Check if neighbors can eat now
        const left = (id + this.numPhilosophers - 1) % this.numPhilosophers;
        const right = (id + 1) % this.numPhilosophers;
        
        if (this.state[left] === State.HUNGRY && this.canEat(left)) {
            this.state[left] = State.EATING;
            log(`Philosopher ${left} can now eat (neighbor finished)`);
            
            // Visual: pickup forks for left neighbor
            const leftLeftForkId = left;
            const rightLeftForkId = (left + this.numPhilosophers - 1) % this.numPhilosophers;
            pickupFork(leftLeftForkId, left);
            pickupFork(rightLeftForkId, left);
        }
        
        if (this.state[right] === State.HUNGRY && this.canEat(right)) {
            this.state[right] = State.EATING;
            log(`Philosopher ${right} can now eat (neighbor finished)`);
            
            // Visual: pickup forks for right neighbor
            const leftRightForkId = right;
            const rightRightForkId = (right + this.numPhilosophers - 1) % this.numPhilosophers;
            pickupFork(leftRightForkId, right);
            pickupFork(rightRightForkId, right);
        }
        
        // Release monitor
        this.exitMonitor();
        updateUI();
    }

    // Simulate monitor mutual exclusion
    async enterMonitor(id) {
        return new Promise(resolve => {
            if (this.inCriticalSection === null) {
                // Monitor is free
                this.inCriticalSection = id;
                criticalSectionElement.textContent = `Philosopher ${id} in critical section (monitor)`;
                resolve();
            } else {
                // Monitor is busy, add to waiting queue
                this.waitingQueue.push(() => {
                    this.inCriticalSection = id;
                    criticalSectionElement.textContent = `Philosopher ${id} in critical section (monitor)`;
                    resolve();
                });
            }
        });
    }

    exitMonitor() {
        if (this.waitingQueue.length > 0) {
            // Wake up next waiting philosopher
            const nextPhilosopher = this.waitingQueue.shift();
            setTimeout(nextPhilosopher, 0);
        } else {
            // No one waiting
            this.inCriticalSection = null;
            criticalSectionElement.textContent = '';
        }
    }
}

// Create monitor
let monitor = new DiningPhilosophersMonitor(NUM_PHILOSOPHERS);

// INITIALIZATION FUNCTIONS
function initializeScene() {
    // Create philosophers
    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const angle = (i * 2 * Math.PI) / NUM_PHILOSOPHERS;
        const x = 200 + 120 * Math.cos(angle);
        const y = 200 + 120 * Math.sin(angle);
        
        const philosopher = document.createElement('div');
        philosopher.className = 'philosopher';
        philosopher.textContent = i;
        philosopher.style.left = `${x - 25}px`;
        philosopher.style.top = `${y - 25}px`;
        philosopher.style.backgroundColor = COLORS[i];
        
        philosophers.push({
            element: philosopher,
            id: i,
            state: State.THINKING
        });
        
        tableContainer.appendChild(philosopher);
    }
    
    // Create forks
    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const angle = ((i * 2 * Math.PI) / NUM_PHILOSOPHERS) + (Math.PI / NUM_PHILOSOPHERS);
        const x = 200 + 80 * Math.cos(angle);
        const y = 200 + 80 * Math.sin(angle);
        
        const fork = document.createElement('div');
        fork.className = 'fork';
        fork.style.left = `${x - 5}px`;
        fork.style.top = `${y - 20}px`;
        fork.style.transform = `rotate(${angle + Math.PI/2}rad)`;
        
        forks.push({
            element: fork,
            id: i,
            inUse: false,
            philosopher: null
        });
        
        tableContainer.appendChild(fork);
    }
    
    // Initialize state table
    updateStateTable();
}

function pickupFork(forkId, philosopherId) {
    const fork = forks[forkId];
    if (!fork.inUse) {
        fork.inUse = true;
        fork.philosopher = philosopherId;
        
        // Visually move the fork closer to the philosopher
        const philosopherAngle = (philosopherId * 2 * Math.PI) / NUM_PHILOSOPHERS;
        const philX = 200 + 120 * Math.cos(philosopherAngle);
        const philY = 200 + 120 * Math.sin(philosopherAngle);
        
        // Move fork 60% of the way from the table to the philosopher
        const forkAngle = ((forkId * 2 * Math.PI) / NUM_PHILOSOPHERS) + (Math.PI / NUM_PHILOSOPHERS);
        const tableX = 200 + 80 * Math.cos(forkAngle);
        const tableY = 200 + 80 * Math.sin(forkAngle);
        
        const newX = tableX + 0.4 * (philX - tableX);
        const newY = tableY + 0.4 * (philY - tableY);
        
        fork.element.style.left = `${newX - 5}px`;
        fork.element.style.top = `${newY - 20}px`;
        
        // Rotate fork to point toward philosopher
        const pointAngle = Math.atan2(philY - newY, philX - newX);
        fork.element.style.transform = `rotate(${pointAngle + Math.PI/2}rad)`;
    }
}

function putdownFork(forkId) {
    const fork = forks[forkId];
    if (fork.inUse) {
        fork.inUse = false;
        fork.philosopher = null;
        
        // Return fork to original position
        const angle = ((forkId * 2 * Math.PI) / NUM_PHILOSOPHERS) + (Math.PI / NUM_PHILOSOPHERS);
        const x = 200 + 80 * Math.cos(angle);
        const y = 200 + 80 * Math.sin(angle);
        
        fork.element.style.left = `${x - 5}px`;
        fork.element.style.top = `${y - 20}px`;
        fork.element.style.transform = `rotate(${angle + Math.PI/2}rad)`;
    }
}

// SIMULATION FUNCTIONS
async function philosopherCycle(id) {
    if (!running) return;
    
    // Think for a while
    philosophers[id].state = State.THINKING;
    log(`Philosopher ${id} is thinking`);
    updateUI();
    
    await sleep(randomTime(0.7 * simulationSpeed, 1.5 * simulationSpeed));
    if (!running) return;
    
    // Get hungry and try to eat
    philosophers[id].state = State.HUNGRY;
    await monitor.pickup(id);
    
    // If successfully got forks, eat
    if (monitor.state[id] === State.EATING) {
        log(`Philosopher ${id} is eating`);
        philosophers[id].state = State.EATING;
        updateUI();
        
        await sleep(randomTime(0.5 * simulationSpeed, simulationSpeed));
        if (!running) return;
        
        // Finish eating, put down forks
        await monitor.putdown(id);
    }
    
    // Schedule next cycle
    if (running) {
        const timeoutId = setTimeout(() => philosopherCycle(id), randomTime(100, 300));
        timeoutIds.push(timeoutId);
    }
}

function startSimulation() {
    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = true;
    statusElement.textContent = "Simulation running";
    
    // Start each philosopher's lifecycle
    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const timeoutId = setTimeout(() => philosopherCycle(i), randomTime(100, 500));
        timeoutIds.push(timeoutId);
    }
}

function stopSimulation() {
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    statusElement.textContent = "Simulation stopped";
    
    // Clear all scheduled actions
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
}

function resetSimulation() {
    // Clear the scene
    while (tableContainer.children.length > 1) {
        tableContainer.removeChild(tableContainer.lastChild);
    }
    
    // Reset state
    philosophers = [];
    forks = [];
    logElement.innerHTML = '';
    monitor = new DiningPhilosophersMonitor(NUM_PHILOSOPHERS);
    
    // Reinitialize
    initializeScene();
    statusElement.textContent = "Press Start to begin simulation";
}

// UTILITY FUNCTIONS
function updateUI() {
    // Update philosopher colors based on state
    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const philosopher = philosophers[i];
        
        // Sync philosopher state with monitor state
        philosopher.state = monitor.state[i];
        
        switch (philosopher.state) {
            case State.THINKING:
                philosopher.element.style.backgroundColor = COLORS[i];
                philosopher.element.style.opacity = '0.7';
                break;
            case State.HUNGRY:
                philosopher.element.style.backgroundColor = '#f1c40f'; // Yellow
                philosopher.element.style.opacity = '1';
                break;
            case State.EATING:
                philosopher.element.style.backgroundColor = COLORS[i];
                philosopher.element.style.opacity = '1';
                break;
        }
    }
    
    // Update state table
    updateStateTable();
}

function updateStateTable() {
    stateTableBody.innerHTML = '';
    
    for (let i = 0; i < NUM_PHILOSOPHERS; i++) {
        const row = document.createElement('tr');
        
        // Philosopher column
        const philosopherCell = document.createElement('td');
        philosopherCell.textContent = i;
        philosopherCell.style.backgroundColor = COLORS[i] + '40'; // Light version of color
        row.appendChild(philosopherCell);
        
        // State column
        const stateCell = document.createElement('td');
        stateCell.textContent = monitor.state[i];
        
        // Color code the state
        switch (monitor.state[i]) {
            case State.THINKING:
                stateCell.style.backgroundColor = '#e8f8e8'; // Light green
                break;
            case State.HUNGRY:
                stateCell.style.backgroundColor = '#fff8e0'; // Light yellow
                break;
            case State.EATING:
                stateCell.style.backgroundColor = '#f8e8e8'; // Light red
                break;
        }
        row.appendChild(stateCell);
        
        // Left fork column
        const leftForkId = i;
        const leftForkCell = document.createElement('td');
        if (forks[leftForkId].inUse) {
            if (forks[leftForkId].philosopher === i) {
                leftForkCell.textContent = 'In use (by me)';
                leftForkCell.style.backgroundColor = '#e8f8e8'; // Light green
            } else {
                leftForkCell.textContent = `In use (by ${forks[leftForkId].philosopher})`;
                leftForkCell.style.backgroundColor = '#f8e8e8'; // Light red
            }
        } else {
            leftForkCell.textContent = 'Available';
        }
        row.appendChild(leftForkCell);
        
        // Right fork column
        const rightForkId = (i + NUM_PHILOSOPHERS - 1) % NUM_PHILOSOPHERS;
        const rightForkCell = document.createElement('td');
        if (forks[rightForkId].inUse) {
            if (forks[rightForkId].philosopher === i) {
                rightForkCell.textContent = 'In use (by me)';
                rightForkCell.style.backgroundColor = '#e8f8e8'; // Light green
            } else {
                rightForkCell.textContent = `In use (by ${forks[rightForkId].philosopher})`;
                rightForkCell.style.backgroundColor = '#f8e8e8'; // Light red
            }
        } else {
            rightForkCell.textContent = 'Available';
        }
        row.appendChild(rightForkCell);
        
        stateTableBody.appendChild(row);
    }
}

function log(message) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3
    });
    
    const logItem = document.createElement('div');
    logItem.textContent = `[${timestamp}] ${message}`;
    logElement.appendChild(logItem);
    logElement.scrollTop = logElement.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => {
        const timeoutId = setTimeout(resolve, ms);
        timeoutIds.push(timeoutId);
    });
}

function randomTime(min, max) {
    return Math.random() * (max - min) + min;
}

// EVENT LISTENERS
startBtn.addEventListener('click', startSimulation);
stopBtn.addEventListener('click', stopSimulation);
resetBtn.addEventListener('click', resetSimulation);

speedSelect.addEventListener('change', () => {
    simulationSpeed = parseInt(speedSelect.value);
});

// INITIALIZE
initializeScene();
log('Simulation initialized. Press Start to begin.');
