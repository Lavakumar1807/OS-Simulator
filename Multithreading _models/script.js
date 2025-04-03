// DOM Elements
const modelSelect = document.getElementById('model-select');
const threadCount = document.getElementById('thread-count');
const threadCountValue = document.getElementById('thread-count-value');
const taskComplexity = document.getElementById('task-complexity');
const taskComplexityValue = document.getElementById('task-complexity-value');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const currentModel = document.getElementById('current-model');
const modelDescription = document.getElementById('model-description');
const userThreadsDisplay = document.getElementById('user-threads-display');
const kernelThreadsDisplay = document.getElementById('kernel-threads-display');
const cpuCoresDisplay = document.getElementById('cpu-cores-display');
const throughputDisplay = document.getElementById('throughput');
const latencyDisplay = document.getElementById('latency');
const utilizationDisplay = document.getElementById('utilization');

// Simulation state
let isSimulationRunning = false;
let simulationInterval;
let tasks = [];
let completedTasks = 0;
let simulationStartTime;
let totalLatency = 0;

// Configuration
const CPU_CORES = 4; // Fixed number of CPU cores
let userThreads = [];
let kernelThreads = [];
let cpuCores = [];

// Model descriptions
const modelDescriptions = {
    'one-to-one': 'In this model, each user thread is mapped to a corresponding kernel thread. This provides true parallelism but can be resource-intensive with many threads.',
    'one-to-many': 'In this model, a single user thread is mapped to multiple kernel threads, allowing for better resource management and scheduling flexibility.',
    'many-to-one': 'In this model, multiple user threads are mapped to a single kernel thread. This is efficient for thread management but can block the entire process on system calls.',
    'many-to-many': 'In this model, multiple user threads are mapped to a smaller or equal number of kernel threads, combining the advantages of both thread management and parallelism.'
};

// Update UI based on slider changes
threadCount.addEventListener('input', () => {
    threadCountValue.textContent = threadCount.value;
});

taskComplexity.addEventListener('input', () => {
    taskComplexityValue.textContent = taskComplexity.value;
});

// Update model description when selection changes
modelSelect.addEventListener('change', () => {
    currentModel.textContent = modelSelect.options[modelSelect.selectedIndex].text;
    modelDescription.textContent = modelDescriptions[modelSelect.value];
});

// Start simulation
startBtn.addEventListener('click', () => {
    if (isSimulationRunning) return;
    
    isSimulationRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    initializeSimulation();
    simulationStartTime = Date.now();
    completedTasks = 0;
    totalLatency = 0;
    
    simulationInterval = setInterval(runSimulation, 100);
});

// Stop simulation
stopBtn.addEventListener('click', () => {
    if (!isSimulationRunning) return;
    
    clearInterval(simulationInterval);
    isSimulationRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

// Initialize simulation components based on selected model
function initializeSimulation() {
    const model = modelSelect.value;
    const threadNum = parseInt(threadCount.value);
    
    // Clear displays
    userThreadsDisplay.innerHTML = '';
    kernelThreadsDisplay.innerHTML = '';
    cpuCoresDisplay.innerHTML = '';
    
    // Initialize arrays
    userThreads = [];
    kernelThreads = [];
    cpuCores = [];
    tasks = [];
    
    // Create CPU cores (fixed at 4)
    for (let i = 0; i < CPU_CORES; i++) {
        cpuCores.push({
            id: i,
            busy: false,
            element: createCPUCore(i)
        });
    }
    
    // Create user threads
    for (let i = 0; i < threadNum; i++) {
        userThreads.push({
            id: i,
            busy: false,
            task: null,
            element: createUserThread(i)
        });
    }
    
    // Create kernel threads based on model
    let kernelThreadNum;
    
    switch(model) {
        case 'one-to-one':
            kernelThreadNum = threadNum;
            break;
        case 'many-to-one':
            kernelThreadNum = 1;
            break;
        case 'one-to-many':
            kernelThreadNum = Math.min(threadNum * 2, 10); // Double the user threads, but max 10
            break;
        case 'many-to-many':
            kernelThreadNum = Math.min(threadNum, CPU_CORES); // Equal to CPU cores or user threads, whichever is smaller
            break;
    }
    
    for (let i = 0; i < kernelThreadNum; i++) {
        kernelThreads.push({
            id: i,
            busy: false,
            userThreadId: model === 'one-to-one' ? i : null,
            element: createKernelThread(i)
        });
    }
    
    // Generate initial tasks
    generateTasks();
}

// Create UI elements
function createUserThread(id) {
    const thread = document.createElement('div');
    thread.className = 'thread user-thread thread-idle';
    thread.textContent = `UT-${id}`;
    thread.id = `user-thread-${id}`;
    userThreadsDisplay.appendChild(thread);
    return thread;
}

function createKernelThread(id) {
    const thread = document.createElement('div');
    thread.className = 'thread kernel-thread thread-idle';
    thread.textContent = `KT-${id}`;
    thread.id = `kernel-thread-${id}`;
    kernelThreadsDisplay.appendChild(thread);
    return thread;
}

function createCPUCore(id) {
    const core = document.createElement('div');
    core.className = 'cpu-core thread-idle';
    core.textContent = `Core ${id}`;
    core.id = `cpu-core-${id}`;
    cpuCoresDisplay.appendChild(core);
    return core;
}

// Generate new tasks based on complexity
function generateTasks() {
    const complexity = parseInt(taskComplexity.value);
    const taskCount = Math.floor(Math.random() * 3) + complexity;
    
    for (let i = 0; i < taskCount; i++) {
        tasks.push({
            id: `task-${Date.now()}-${i}`,
            complexity: Math.floor(Math.random() * complexity) + 1,
            progress: 0,
            startTime: null,
            endTime: null
        });
    }
}

// Main simulation loop
function runSimulation() {
    const model = modelSelect.value;
    
    // Occasionally generate new tasks
    if (Math.random() < 0.3) {
        generateTasks();
    }
    
    // Assign tasks to user threads if they're free
    for (let i = 0; i < userThreads.length; i++) {
        const thread = userThreads[i];
        if (!thread.busy && tasks.length > 0) {
            const task = tasks.shift();
            thread.busy = true;
            thread.task = task;
            task.startTime = Date.now();
            thread.element.classList.remove('thread-idle');
            thread.element.classList.add('thread-active');
            
            // Add task indicator
            const taskIndicator = document.createElement('div');
            taskIndicator.className = 'thread-task';
            taskIndicator.textContent = `Task: ${task.complexity}`;
            taskIndicator.id = `task-indicator-${task.id}`;
            thread.element.appendChild(taskIndicator);
        }
    }
    
    // Handle thread mapping based on model
    switch(model) {
        case 'one-to-one':
            handleOneToOneModel();
            break;
        case 'many-to-one':
            handleManyToOneModel();
            break;
        case 'one-to-many':
            handleOneToManyModel();
            break;
        case 'many-to-many':
            handleManyToManyModel();
            break;
    }
    
    // Update metrics
    updateMetrics();
}

// Model-specific handlers
function handleOneToOneModel() {
    // In one-to-one, each user thread maps directly to its kernel thread
    for (let i = 0; i < userThreads.length && i < kernelThreads.length; i++) {
        const userThread = userThreads[i];
        const kernelThread = kernelThreads[i];
        
        if (userThread.busy && !kernelThread.busy) {
            // Map user thread to kernel thread
            kernelThread.busy = true;
            kernelThread.element.classList.remove('thread-idle');
            kernelThread.element.classList.add('thread-active');
            
            // Find an available CPU core
            const availableCore = cpuCores.find(core => !core.busy);
            if (availableCore) {
                availableCore.busy = true;
                availableCore.element.classList.remove('thread-idle');
                availableCore.element.classList.add('thread-active');
                
                // Process the task
                userThread.task.progress += 1;
                
                // Check if task is complete
                if (userThread.task.progress >= userThread.task.complexity) {
                    completeTask(userThread, kernelThread, availableCore);
                }
            }
        }
    }
}

function handleManyToOneModel() {
    // In many-to-one, all user threads map to a single kernel thread
    const kernelThread = kernelThreads[0];
    
    if (!kernelThread.busy) {
        // Find a busy user thread
        const busyUserThread = userThreads.find(thread => thread.busy);
        
        if (busyUserThread) {
            kernelThread.busy = true;
            kernelThread.element.classList.remove('thread-idle');
            kernelThread.element.classList.add('thread-active');
            
            // Find an available CPU core
            const availableCore = cpuCores.find(core => !core.busy);
            if (availableCore) {
                availableCore.busy = true;
                availableCore.element.classList.remove('thread-idle');
                availableCore.element.classList.add('thread-active');
                
                // Process the task
                busyUserThread.task.progress += 1;
                
                // Check if task is complete
                if (busyUserThread.task.progress >= busyUserThread.task.complexity) {
                    completeTask(busyUserThread, kernelThread, availableCore);
                } else {
                    // Free resources for other threads even if task isn't complete
                    setTimeout(() => {
                        kernelThread.busy = false;
                        kernelThread.element.classList.remove('thread-active');
                        kernelThread.element.classList.add('thread-idle');
                        
                        availableCore.busy = false;
                        availableCore.element.classList.remove('thread-active');
                        availableCore.element.classList.add('thread-idle');
                    }, 50);
                }
            }
        }
    }
}

function handleOneToManyModel() {
    // In one-to-many, each user thread can use multiple kernel threads
    for (let i = 0; i < userThreads.length; i++) {
        const userThread = userThreads[i];
        
        if (userThread.busy) {
            // Find available kernel threads
            const availableKernelThreads = kernelThreads.filter(kt => !kt.busy);
            
            if (availableKernelThreads.length > 0) {
                // Use up to 2 kernel threads per user thread
                const usedKernelThreads = availableKernelThreads.slice(0, 2);
                
                usedKernelThreads.forEach(kernelThread => {
                    kernelThread.busy = true;
                    kernelThread.element.classList.remove('thread-idle');
                    kernelThread.element.classList.add('thread-active');
                    
                    // Find an available CPU core
                    const availableCore = cpuCores.find(core => !core.busy);
                    if (availableCore) {
                        availableCore.busy = true;
                        availableCore.element.classList.remove('thread-idle');
                        availableCore.element.classList.add('thread-active');
                        
                        // Process the task (faster progress due to multiple kernel threads)
                        userThread.task.progress += 0.5;
                        
                        // Check if task is complete
                        if (userThread.task.progress >= userThread.task.complexity) {
                            completeTask(userThread, kernelThread, availableCore);
                            
                            // Free other kernel threads as well
                            usedKernelThreads.forEach(kt => {
                                if (kt !== kernelThread) {
                                    kt.busy = false;
                                    kt.element.classList.remove('thread-active');
                                    kt.element.classList.add('thread-idle');
                                }
                            });
                        } else {
                            // Free resources after a short time
                            setTimeout(() => {
                                kernelThread.busy = false;
                                kernelThread.element.classList.remove('thread-active');
                                kernelThread.element.classList.add('thread-idle');
                                
                                availableCore.busy = false;
                                availableCore.element.classList.remove('thread-active');
                                availableCore.element.classList.add('thread-idle');
                            }, 50);
                        }
                    }
                });
            }
        }
    }
}

function handleManyToManyModel() {
    // In many-to-many, multiple user threads share a pool of kernel threads
    
    // Find busy user threads
    const busyUserThreads = userThreads.filter(ut => ut.busy);
    
    for (let i = 0; i < busyUserThreads.length; i++) {
        const userThread = busyUserThreads[i];
        
        // Find an available kernel thread
        const kernelThread = kernelThreads.find(kt => !kt.busy);
        
        if (kernelThread) {
            kernelThread.busy = true;
            kernelThread.element.classList.remove('thread-idle');
            kernelThread.element.classList.add('thread-active');
            
            // Find an available CPU core
            const availableCore = cpuCores.find(core => !core.busy);
            if (availableCore) {
                availableCore.busy = true;
                availableCore.element.classList.remove('thread-idle');
                availableCore.element.classList.add('thread-active');
                
                // Process the task
                userThread.task.progress += 1;
                
                // Check if task is complete
                if (userThread.task.progress >= userThread.task.complexity) {
                    completeTask(userThread, kernelThread, availableCore);
                } else {
                    // Free resources after a short time
                    setTimeout(() => {
                        kernelThread.busy = false;
                        kernelThread.element.classList.remove('thread-active');
                        kernelThread.element.classList.add('thread-idle');
                        
                        availableCore.busy = false;
                        availableCore.element.classList.remove('thread-active');
                        availableCore.element.classList.add('thread-idle');
                    }, 50);
                }
            }
        }
    }
}

// Complete a task and free resources
function completeTask(userThread, kernelThread, cpuCore) {
    const task = userThread.task;
    task.endTime = Date.now();
    
    // Calculate latency
    const latency = task.endTime - task.startTime;
    totalLatency += latency;
    
    // Update completion counter
    completedTasks++;
    
    // Free resources
    userThread.busy = false;
    userThread.task = null;
    userThread.element.classList.remove('thread-active');
    userThread.element.classList.add('thread-idle');
    
    kernelThread.busy = false;
    kernelThread.element.classList.remove('thread-active');
    kernelThread.element.classList.add('thread-idle');
    
    cpuCore.busy = false;
    cpuCore.element.classList.remove('thread-active');
    cpuCore.element.classList.add('thread-idle');
    
    // Remove task indicator
    const taskIndicator = document.getElementById(`task-indicator-${task.id}`);
    if (taskIndicator) {
        taskIndicator.remove();
    }
}

// Update performance metrics
function updateMetrics() {
    // Calculate elapsed time in seconds
    const elapsedTime = (Date.now() - simulationStartTime) / 1000;
    
    // Calculate throughput (tasks per second)
    const throughput = elapsedTime > 0 ? (completedTasks / elapsedTime).toFixed(2) : 0;
    throughputDisplay.textContent = `${throughput} tasks/sec`;
    
    // Calculate average latency
    const avgLatency = completedTasks > 0 ? (totalLatency / completedTasks).toFixed(2) : 0;
    latencyDisplay.textContent = `${avgLatency} ms`;
    
    // Calculate CPU utilization
    const busyCores = cpuCores.filter(core => core.busy).length;
    const utilization = (busyCores / cpuCores.length) * 100;
    utilizationDisplay.textContent = `${utilization.toFixed(0)}%`;
}

// Initialize with default settings
window.addEventListener('load', () => {
    currentModel.textContent = modelSelect.options[modelSelect.selectedIndex].text;
    modelDescription.textContent = modelDescriptions[modelSelect.value];
    threadCountValue.textContent = threadCount.value;
    taskComplexityValue.textContent = taskComplexity.value;
});
