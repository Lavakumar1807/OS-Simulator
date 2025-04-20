// Constants
const READER_DURATION = 3000; // Time a reader spends reading
const WRITER_DURATION = 4000; // Time a writer spends writing
const READER_COLOR = '#3498db';
const WRITER_COLOR = '#e74c3c';

// State variables
let readerCounter = 0;
let writerCounter = 0;
let readersWaiting = 0;
let readersReading = 0;
let writersWaiting = 0;
let writerWriting = false;
let resource = { content: "Initial data", version: 0 };
let speedFactor = 1;
let processes = []; // Array to store all process objects

// DOM Elements
const addReaderBtn = document.getElementById('add-reader');
const addWriterBtn = document.getElementById('add-writer');
const resetBtn = document.getElementById('reset');
const speedControl = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const readersList = document.getElementById('readers-list');
const writersList = document.getElementById('writers-list');
const resourceContent = document.getElementById('resource-content');
const resourceStatus = document.getElementById('resource-status').querySelector('span');
const readersWaitingEl = document.getElementById('readers-waiting');
const readersReadingEl = document.getElementById('readers-reading');
const writersWaitingEl = document.getElementById('writers-waiting');
const writerWritingEl = document.getElementById('writer-writing');
const logEl = document.getElementById('log');

// Event Listeners
addReaderBtn.addEventListener('click', createReader);
addWriterBtn.addEventListener('click', createWriter);
resetBtn.addEventListener('click', resetSimulation);
speedControl.addEventListener('input', updateSpeed);

// Functions
function updateSpeed() {
    speedFactor = parseFloat(speedControl.value);
    speedValue.textContent = `${speedFactor}x`;
}

function updateStats() {
    readersWaitingEl.textContent = readersWaiting;
    readersReadingEl.textContent = readersReading;
    writersWaitingEl.textContent = writersWaiting;
    writerWritingEl.textContent = writerWriting ? 'Yes' : 'No';
    
    if (writerWriting) {
        resourceStatus.textContent = 'Being written to';
        resourceStatus.className = 'busy';
        resourceContent.classList.add('resource-writing');
        resourceContent.classList.remove('resource-reading');
    } else if (readersReading > 0) {
        resourceStatus.textContent = 'Being read';
        resourceStatus.className = 'busy';
        resourceContent.classList.add('resource-reading');
        resourceContent.classList.remove('resource-writing');
    } else {
        resourceStatus.textContent = 'Free';
        resourceStatus.className = 'free';
        resourceContent.classList.remove('resource-reading');
        resourceContent.classList.remove('resource-writing');
    }
}

function updateResourceContent() {
    resourceContent.textContent = `${resource.content} (Version: ${resource.version})`;
}

function logActivity(message, type = 'system') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logEl.appendChild(logEntry);
    logEl.scrollTop = logEl.scrollHeight;
}

function createReader() {
    const readerId = ++readerCounter;
    const reader = {
        id: readerId,
        type: 'reader',
        status: 'waiting',
        element: null
    };
    
    // Create DOM element
    const readerElement = document.createElement('div');
    readerElement.className = 'process reader waiting';
    readerElement.innerHTML = `
        <div class="process-info">
            <span>Reader ${readerId}</span>
            <span class="process-status waiting">Waiting</span>
        </div>
    `;
    readersList.appendChild(readerElement);
    reader.element = readerElement;
    
    // Add to processes array
    processes.push(reader);
    
    // Update stats
    readersWaiting++;
    updateStats();
    
    logActivity(`Reader ${readerId} created and waiting`, 'reader');
    
    // Try to start reading
    setTimeout(() => tryRead(reader), 500 / speedFactor);
}

function createWriter() {
    const writerId = ++writerCounter;
    const writer = {
        id: writerId,
        type: 'writer',
        status: 'waiting',
        element: null
    };
    
    // Create DOM element
    const writerElement = document.createElement('div');
    writerElement.className = 'process writer waiting';
    writerElement.innerHTML = `
        <div class="process-info">
            <span>Writer ${writerId}</span>
            <span class="process-status waiting">Waiting</span>
        </div>
    `;
    writersList.appendChild(writerElement);
    writer.element = writerElement;
    
    // Add to processes array
    processes.push(writer);
    
    // Update stats
    writersWaiting++;
    updateStats();
    
    logActivity(`Writer ${writerId} created and waiting`, 'writer');
    
    // Try to start writing
    setTimeout(() => tryWrite(writer), 500 / speedFactor);
}

function tryRead(reader) {
    // Check if writer is currently writing
    if (writerWriting) {
        logActivity(`Reader ${reader.id} must wait because a writer is writing`, 'reader');
        setTimeout(() => tryRead(reader), 1000 / speedFactor);
        return;
    }
    
    // Start reading
    reader.status = 'reading';
    reader.element.classList.remove('waiting');
    reader.element.classList.add('active');
    reader.element.querySelector('.process-status').textContent = 'Reading';
    reader.element.querySelector('.process-status').className = 'process-status reading';
    
    readersWaiting--;
    readersReading++;
    updateStats();
    
    logActivity(`Reader ${reader.id} started reading (Version: ${resource.version})`, 'reader');
    
    // Finish reading after READER_DURATION
    setTimeout(() => {
        reader.status = 'completed';
        reader.element.classList.remove('active');
        reader.element.classList.add('completed');
        reader.element.querySelector('.process-status').textContent = 'Completed';
        reader.element.querySelector('.process-status').className = 'process-status completed';
        
        readersReading--;
        updateStats();
        
        logActivity(`Reader ${reader.id} finished reading`, 'reader');
    }, READER_DURATION / speedFactor);
}

function tryWrite(writer) {
    // Check if any readers are reading or another writer is writing
    if (readersReading > 0 || writerWriting) {
        const reason = readersReading > 0 ? "readers are reading" : "another writer is writing";
        logActivity(`Writer ${writer.id} must wait because ${reason}`, 'writer');
        setTimeout(() => tryWrite(writer), 1000 / speedFactor);
        return;
    }
    
    // Start writing
    writer.status = 'writing';
    writer.element.classList.remove('waiting');
    writer.element.classList.add('active');
    writer.element.querySelector('.process-status').textContent = 'Writing';
    writer.element.querySelector('.process-status').className = 'process-status writing';
    
    writersWaiting--;
    writerWriting = true;
    updateStats();
    
    logActivity(`Writer ${writer.id} started writing`, 'writer');
    
    // Finish writing after WRITER_DURATION
    setTimeout(() => {
        // Update the resource
        resource.version++;
        resource.content = `Data modified by Writer ${writer.id}`;
        updateResourceContent();
        
        writer.status = 'completed';
        writer.element.classList.remove('active');
        writer.element.classList.add('completed');
        writer.element.querySelector('.process-status').textContent = 'Completed';
        writer.element.querySelector('.process-status').className = 'process-status completed';
        
        writerWriting = false;
        updateStats();
        
        logActivity(`Writer ${writer.id} finished writing (New Version: ${resource.version})`, 'writer');
    }, WRITER_DURATION / speedFactor);
}

function resetSimulation() {
    // Reset all state variables
    readerCounter = 0;
    writerCounter = 0;
    readersWaiting = 0;
    readersReading = 0;
    writersWaiting = 0;
    writerWriting = false;
    processes = [];
    resource = { content: "Initial data", version: 0 };
    
    // Clear DOM elements
    readersList.innerHTML = '';
    writersList.innerHTML = '';
    logEl.innerHTML = '';
    updateResourceContent();
    updateStats();
    
    logActivity('Simulation reset', 'system');
}

// Initialize
updateResourceContent();
updateStats();
logActivity('Reader-Writer Problem Simulation started', 'system');

// Optional: Add some initial processes
setTimeout(() => {
    createReader();
    setTimeout(() => createReader(), 1000);
    setTimeout(() => createWriter(), 2000);
}, 500);