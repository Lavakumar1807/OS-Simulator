// Tab switching functionality
function openTab(tabId) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabId}')"]`).classList.add('active');
}

// MFT Implementation
document.getElementById('mft-init-btn').addEventListener('click', function() {
    const totalMemory = parseInt(document.getElementById('mft-total-memory').value);
    const blockSize = parseInt(document.getElementById('mft-block-size').value);
    const numProcesses = parseInt(document.getElementById('mft-num-processes').value);
    
    if (!totalMemory || !blockSize || !numProcesses) {
        alert('Please fill all fields with valid numbers');
        return;
    }
    
    // Create process input fields
    const processInputsDiv = document.getElementById('mft-process-inputs');
    processInputsDiv.innerHTML = '';
    
    for (let i = 1; i <= numProcesses; i++) {
        const processDiv = document.createElement('div');
        processDiv.className = 'input-group';
        
        const label = document.createElement('label');
        label.htmlFor = `mft-process-${i}`;
        label.textContent = `Memory Required for Process ${i} (Bytes):`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `mft-process-${i}`;
        input.min = '1';
        
        processDiv.appendChild(label);
        processDiv.appendChild(input);
        processInputsDiv.appendChild(processDiv);
    }
    
    // Show process inputs and calculate button
    processInputsDiv.classList.remove('hidden');
    document.getElementById('mft-calculate-btn').classList.remove('hidden');
});

document.getElementById('mft-calculate-btn').addEventListener('click', function() {
    const totalMemory = parseInt(document.getElementById('mft-total-memory').value);
    const blockSize = parseInt(document.getElementById('mft-block-size').value);
    const numProcesses = parseInt(document.getElementById('mft-num-processes').value);
    
    // Calculate number of blocks
    const numBlocks = Math.floor(totalMemory / blockSize);
    document.getElementById('mft-num-blocks').textContent = `Number of Blocks available in memory: ${numBlocks}`;
    
    // Get process memory requirements
    const processes = [];
    for (let i = 1; i <= numProcesses; i++) {
        const memoryRequired = parseInt(document.getElementById(`mft-process-${i}`).value);
        if (!memoryRequired) {
            alert(`Please enter memory required for Process ${i}`);
            return;
        }
        processes.push({
            id: i,
            memoryRequired: memoryRequired,
            allocated: false,
            allocationReason: '',
            internalFragmentation: 0
        });
    }
    
    // Allocate memory to processes
    let allocatedBlocks = 0;
    let totalInternalFragmentation = 0;
    let memoryFull = false;
    
    for (let i = 0; i < processes.length; i++) {
        // Track which processes were considered before memory became full
        processes[i].considered = true;
        
        if (allocatedBlocks >= numBlocks) {
            // Memory is full
            memoryFull = true;
            processes[i].allocationReason = 'Memory Full';
            // Mark remaining processes as not considered
            for (let j = i; j < processes.length; j++) {
                processes[j].considered = j === i; // Only the first one that couldn't be allocated is considered
            }
            break;
        } else if (processes[i].memoryRequired > blockSize) {
            // Process exceeds block size
            processes[i].allocationReason = 'Exceeds Block Size';
        } else {
            // Memory allocation successful
            processes[i].allocated = true;
            processes[i].internalFragmentation = blockSize - processes[i].memoryRequired;
            totalInternalFragmentation += processes[i].internalFragmentation;
            allocatedBlocks++;
        }
    }
    
    // Calculate external fragmentation (remaining memory that cannot be allocated)
    const remainingBlocks = numBlocks - allocatedBlocks;
    const externalFragmentation = totalMemory - (numBlocks * blockSize) + (remainingBlocks * blockSize);
    
    // Display results
    const resultsTable = document.getElementById('mft-results-table').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = '';
    
    for (const process of processes) {
        // Only show processes that were considered during allocation
        if (process.considered) {
            const row = resultsTable.insertRow();
            row.insertCell(0).textContent = process.id;
            row.insertCell(1).textContent = process.memoryRequired;
            
            // Show allocation status and reason if applicable
            if (process.allocated) {
                row.insertCell(2).textContent = 'YES';
            } else {
                row.insertCell(2).textContent = `NO (${process.allocationReason})`;
            }
            
            row.insertCell(3).textContent = process.allocated ? process.internalFragmentation : '-----';
        }
    }
    
    // Show message if memory is full
    if (memoryFull) {
        document.getElementById('mft-memory-full').textContent = 'Memory is Full, Remaining Processes cannot be accommodated';
        document.getElementById('mft-memory-full').classList.remove('hidden');
    } else {
        document.getElementById('mft-memory-full').classList.add('hidden');
    }
    
    document.getElementById('mft-internal-frag').textContent = `Total Internal Fragmentation is ${totalInternalFragmentation}`;
    document.getElementById('mft-external-frag').textContent = `Total External Fragmentation is ${externalFragmentation}`;
    document.getElementById('mft-results').classList.remove('hidden');
});

// MFT Reset Button
document.getElementById('mft-reset-btn').addEventListener('click', function() {
    // Reset all input fields
    document.getElementById('mft-total-memory').value = '';
    document.getElementById('mft-block-size').value = '';
    document.getElementById('mft-num-processes').value = '';
    
    // Hide process inputs, calculate button, and results
    document.getElementById('mft-process-inputs').classList.add('hidden');
    document.getElementById('mft-process-inputs').innerHTML = '';
    document.getElementById('mft-calculate-btn').classList.add('hidden');
    document.getElementById('mft-results').classList.add('hidden');
});

// MVT Implementation
document.getElementById('mvt-init-btn').addEventListener('click', function() {
    const totalMemory = parseInt(document.getElementById('mvt-total-memory').value);
    
    if (!totalMemory) {
        alert('Please enter total memory available');
        return;
    }
    
    // Initialize MVT simulation
    document.getElementById('mvt-process-section').classList.remove('hidden');
    document.getElementById('mvt-process-number').textContent = '1';
    document.getElementById('mvt-process-memory').value = '';
    
    // Reset results
    document.getElementById('mvt-results-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('mvt-results').classList.add('hidden');
    document.getElementById('mvt-reset-btn').classList.add('hidden');
    
    // Store total memory in a variable accessible to all MVT functions
    window.mvtTotalMemory = totalMemory;
    window.mvtAllocatedMemory = 0;
    window.mvtProcesses = [];
    window.mvtCurrentProcess = 1;
});

document.getElementById('mvt-allocate-btn').addEventListener('click', function() {
    const processMemory = parseInt(document.getElementById('mvt-process-memory').value);
    
    if (!processMemory) {
        alert('Please enter memory required for the process');
        return;
    }
    
    const remainingMemory = window.mvtTotalMemory - window.mvtAllocatedMemory;
    
    if (processMemory <= remainingMemory) {
        // Memory allocation successful
        window.mvtProcesses.push({
            id: window.mvtCurrentProcess,
            memoryAllocated: processMemory
        });
        
        window.mvtAllocatedMemory += processMemory;
        document.getElementById('mvt-memory-status').textContent = 'Memory is allocated for Process ' + window.mvtCurrentProcess;
    } else {
        // Memory full
        document.getElementById('mvt-memory-status').textContent = 'Memory is Full';
    }
    
    // Display results
    updateMVTResults();
    
    // Show continue section only if there is still memory available
    if (window.mvtAllocatedMemory < window.mvtTotalMemory) {
        document.getElementById('mvt-continue-section').style.display = 'block';
    } else {
        document.getElementById('mvt-continue-section').style.display = 'none';
        document.getElementById('mvt-reset-btn').classList.remove('hidden');
    }
    
    document.getElementById('mvt-results').classList.remove('hidden');
});

document.getElementById('mvt-continue-yes').addEventListener('click', function() {
    if (window.mvtAllocatedMemory >= window.mvtTotalMemory) {
        alert('Memory is full. Cannot allocate more processes.');
        return;
    }
    
    window.mvtCurrentProcess++;
    document.getElementById('mvt-process-number').textContent = window.mvtCurrentProcess;
    document.getElementById('mvt-process-memory').value = '';
    document.getElementById('mvt-results').classList.add('hidden');
    document.getElementById('mvt-process-section').classList.remove('hidden');
});

document.getElementById('mvt-continue-no').addEventListener('click', function() {
    // Hide process section and continue section
    document.getElementById('mvt-process-section').classList.add('hidden');
    document.getElementById('mvt-continue-section').style.display = 'none';
    
    // Show final results and reset button
    updateMVTResults();
    document.getElementById('mvt-reset-btn').classList.remove('hidden');
});

// MVT Reset Button
document.getElementById('mvt-reset-btn').addEventListener('click', function() {
    // Reset input field
    document.getElementById('mvt-total-memory').value = '';
    
    // Hide process section and results
    document.getElementById('mvt-process-section').classList.add('hidden');
    document.getElementById('mvt-results').classList.add('hidden');
    document.getElementById('mvt-reset-btn').classList.add('hidden');
    
    // Reset global variables
    window.mvtTotalMemory = 0;
    window.mvtAllocatedMemory = 0;
    window.mvtProcesses = [];
    window.mvtCurrentProcess = 1;
});

function updateMVTResults() {
    const resultsTable = document.getElementById('mvt-results-table').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = '';
    
    for (const process of window.mvtProcesses) {
        const row = resultsTable.insertRow();
        row.insertCell(0).textContent = process.id;
        row.insertCell(1).textContent = process.memoryAllocated;
    }
    
    document.getElementById('mvt-total-memory-display').textContent = `Total Memory Available: ${window.mvtTotalMemory}`;
    document.getElementById('mvt-total-allocated').textContent = `Total Memory Allocated is ${window.mvtAllocatedMemory}`;
    
    const externalFragmentation = window.mvtTotalMemory - window.mvtAllocatedMemory;
    document.getElementById('mvt-external-frag').textContent = `Total External Fragmentation is ${externalFragmentation}`;
    
    document.getElementById('mvt-results').classList.remove('hidden');
}