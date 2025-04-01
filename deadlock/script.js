// System variables
let resources = []; // Array of resource types {id: "R1", number: 1, instances: 4, available: 4}
let processes = []; // Array of processes {id: "P1", maxClaim: {}, allocation: {}, need: {}}
let requestMatrix = {}; // Process requests
let processHoldings = {}; // For prevention - tracking resource holdings by order

// UI helper functions
function openTab(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    // Update relevant graphs for each tab - only draw graph for setup tab
    if (tabName === "setup") {
        drawGraph("setupGraph");
    } else if (tabName === "avoidance") {
        updateAvoidanceTab();
    } else if (tabName === "detection") {
        updateDetectionTab();
    } else if (tabName === "prevention") {
        updatePreventionTab();
    }
}

function generateResourceInputs() {
    const numResources = parseInt(document.getElementById("numResources").value);
    let html = '<table><tr><th>Resource Type</th><th>Resource Number</th><th>Number of Instances</th></tr>';
    
    for (let i = 1; i <= numResources; i++) {
        html += `
            <tr>
                <td>R${i}</td>
                <td>${i}</td>
                <td><input type="number" id="resource${i}Instances" min="1" value="4"></td>
            </tr>
        `;
    }
    
    html += '</table>';
    document.getElementById("resourceInstancesInputs").innerHTML = html;
}

function generateProcessInputs() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const numResources = parseInt(document.getElementById("numResources").value);
    
    if (numResources <= 0) {
        alert("Please define resources first!");
        return;
    }
    
    let html = '<table><tr><th>Process</th>';
    for (let i = 1; i <= numResources; i++) {
        html += `<th>Max Claim R${i}</th>`;
    }
    html += '</tr>';
    
    for (let i = 1; i <= numProcesses; i++) {
        html += `<tr><td>P${i}</td>`;
        for (let j = 1; j <= numResources; j++) {
            // Set reasonable max values based on resource instances
            const maxInstance = document.getElementById(`resource${j}Instances`).value || 4;
            const defaultMax = Math.min(Math.floor(maxInstance * 0.7), 3); // Default to 70% of total or 3, whichever is smaller
            html += `<td><input type="number" id="p${i}r${j}max" min="0" max="${maxInstance}" value="${defaultMax}"></td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    document.getElementById("processMaxClaimInputs").innerHTML = html;
    
    // Also generate allocation inputs
    generateAllocationInputs(numProcesses, numResources);
}

function generateAllocationInputs(numProcesses, numResources) {
    let html = '<table><tr><th>Process</th>';
    for (let i = 1; i <= numResources; i++) {
        html += `<th>Current Allocation R${i}</th>`;
    }
    html += '</tr>';
    
    for (let i = 1; i <= numProcesses; i++) {
        html += `<tr><td>P${i}</td>`;
        for (let j = 1; j <= numResources; j++) {
            // Default to 0 allocation
            html += `<td><input type="number" id="p${i}r${j}alloc" min="0" value="0"></td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    document.getElementById("allocationInputs").innerHTML = html;
}

function setupResources() {
    resources = [];
    const numResources = parseInt(document.getElementById("numResources").value);
    
    for (let i = 1; i <= numResources; i++) {
        const instances = parseInt(document.getElementById(`resource${i}Instances`).value);
        resources.push({
            id: `R${i}`,
            number: i, // Resource ordering number for prevention
            instances: instances,
            available: instances
        });
    }
    
    // Update resource selection dropdowns
    updateSelectOptions("preventionResource", resources.map(r => r.id));
    
    renderAvailableResources();
    drawGraph("setupGraph");
}

function setupProcesses() {
    processes = [];
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const numResources = parseInt(document.getElementById("numResources").value);
    
    for (let i = 1; i <= numProcesses; i++) {
        const process = {
            id: `P${i}`,
            maxClaim: {},
            allocation: {},
            need: {}
        };
        
        for (let j = 1; j <= numResources; j++) {
            const max = parseInt(document.getElementById(`p${i}r${j}max`).value) || 0;
            const resourceId = `R${j}`;
            process.maxClaim[resourceId] = max;
            process.allocation[resourceId] = 0; // Initialize with zero allocation
            process.need[resourceId] = max;
        }
        
        processes.push(process);
    }
    
    // Initialize process holdings for prevention
    processHoldings = {};
    processes.forEach(process => {
        processHoldings[process.id] = [];
    });
    
    // Update process selection dropdowns
    updateSelectOptions("bankerProcess", processes.map(p => p.id));
    updateSelectOptions("requestProcess", processes.map(p => p.id));
    updateSelectOptions("preventionProcess", processes.map(p => p.id));
    
    // Generate banker resource inputs
    generateBankerResourceInputs();
    
    // Generate request resource inputs
    generateRequestResourceInputs();
    
    renderTables();
    drawGraph("setupGraph");
}

function setupAllocation() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const numResources = parseInt(document.getElementById("numResources").value);
    
    // Reset available resources first
    resources.forEach(resource => {
        resource.available = resource.instances;
    });
    
    // Update allocations and needs for each process
    for (let i = 1; i <= numProcesses; i++) {
        const process = processes[i-1];
        
        for (let j = 1; j <= numResources; j++) {
            const alloc = parseInt(document.getElementById(`p${i}r${j}alloc`).value) || 0;
            const resourceId = `R${j}`;
            const max = process.maxClaim[resourceId];
            
            // Check if allocation exceeds max claim
            if (alloc > max) {
                alert(`Allocation for P${i} of R${j} (${alloc}) exceeds max claim (${max})!`);
                return;
            }
            
            process.allocation[resourceId] = alloc;
            process.need[resourceId] = max - alloc;
            
            // Deduct from available resources
            const resource = resources.find(r => r.id === resourceId);
            resource.available -= alloc;
            
            // Check if we've allocated more than total instances
            if (resource.available < 0) {
                alert(`Total allocation of R${j} exceeds available instances!`);
                return;
            }
        }
    }
    
    // Initialize the prevention table
    updateProcessHoldingsTable();
    
    // Render all tables and graphs
    renderTables();
    drawGraph("setupGraph");
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '';
    
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.text = option;
        select.add(opt);
    });
}

function generateBankerResourceInputs() {
    let html = '';
    resources.forEach(resource => {
        html += `
            <div>
                <label for="banker${resource.id}">Request for ${resource.id}:</label>
                <input type="number" id="banker${resource.id}" min="0" value="1" max="${resource.instances}">
            </div>
        `;
    });
    document.getElementById("bankerResourceInputs").innerHTML = html;
}

function generateRequestResourceInputs() {
    let html = '';
    resources.forEach(resource => {
        html += `
            <div>
                <label for="req${resource.id}">Request for ${resource.id}:</label>
                <input type="number" id="req${resource.id}" min="0" value="1" max="${resource.instances}">
            </div>
        `;
    });
    document.getElementById("requestResourceInputs").innerHTML = html;
}

function renderAvailableResources() {
    let html = '<table><tr><th>Resource</th><th>Total Instances</th><th>Available</th></tr>';
    
    resources.forEach(resource => {
        html += `
            <tr>
                <td>${resource.id}</td>
                <td>${resource.instances}</td>
                <td>${resource.available}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    document.getElementById("availableResources").innerHTML = html;
}

function renderTables() {
    // Render all matrices for avoidance
    renderMaxClaimTable();
    renderAllocationTable();
    renderNeedTable();
    renderAvailableTable();
    
    // Render detection tables
    renderDetectionAllocationTable();
    renderRequestTable();
    
    // Render prevention tables
    renderResourceOrderingTable();
    
    // Update available resources display
    renderAvailableResources();
}

function renderMaxClaimTable() {
    if (processes.length === 0 || resources.length === 0) return;
    
    let html = '<table><tr><th>Process</th>';
    resources.forEach(resource => {
        html += `<th>${resource.id}</th>`;
    });
    html += '</tr>';
    
    processes.forEach(process => {
        html += `<tr><td>${process.id}</td>`;
        resources.forEach(resource => {
            html += `<td>${process.maxClaim[resource.id]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById("maxClaimTable").innerHTML = html;
}

function renderAllocationTable() {
    if (processes.length === 0 || resources.length === 0) return;
    
    let html = '<table><tr><th>Process</th>';
    resources.forEach(resource => {
        html += `<th>${resource.id}</th>`;
    });
    html += '</tr>';
    
    processes.forEach(process => {
        html += `<tr><td>${process.id}</td>`;
        resources.forEach(resource => {
            html += `<td>${process.allocation[resource.id]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById("allocationTable").innerHTML = html;
}

function renderNeedTable() {
    if (processes.length === 0 || resources.length === 0) return;
    
    let html = '<table><tr><th>Process</th>';
    resources.forEach(resource => {
        html += `<th>${resource.id}</th>`;
    });
    html += '</tr>';
    
    processes.forEach(process => {
        html += `<tr><td>${process.id}</td>`;
        resources.forEach(resource => {
            html += `<td>${process.need[resource.id]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById("needTable").innerHTML = html;
}

function renderAvailableTable() {
    if (resources.length === 0) return;
    
    let html = '<table><tr><th>Resource</th><th>Available</th></tr>';
    resources.forEach(resource => {
        html += `<tr><td>${resource.id}</td><td>${resource.available}</td></tr>`;
    });
    html += '</table>';
    
    document.getElementById("availableTable").innerHTML = html;
}

function renderDetectionAllocationTable() {
    if (processes.length === 0 || resources.length === 0) return;
    
    let html = '<table><tr><th>Process</th>';
    resources.forEach(resource => {
        html += `<th>${resource.id}</th>`;
    });
    html += '</tr>';
    
    processes.forEach(process => {
        html += `<tr><td>${process.id}</td>`;
        resources.forEach(resource => {
            html += `<td>${process.allocation[resource.id]}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById("detectionAllocationTable").innerHTML = html;
}

function renderRequestTable() {
    if (processes.length === 0 || resources.length === 0) return;
    
    let html = '<table><tr><th>Process</th>';
    resources.forEach(resource => {
        html += `<th>${resource.id}</th>`;
    });
    html += '</tr>';
    
    processes.forEach(process => {
        html += `<tr><td>${process.id}</td>`;
        resources.forEach(resource => {
            const requestValue = requestMatrix[process.id] && requestMatrix[process.id][resource.id] ? 
                requestMatrix[process.id][resource.id] : 0;
            html += `<td>${requestValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    document.getElementById("requestTable").innerHTML = html;
}

function renderResourceOrderingTable() {
    if (resources.length === 0) return;
    
    let html = '<table><tr><th>Resource</th><th>Resource Number</th></tr>';
    resources.forEach(resource => {
        html += `<tr><td>${resource.id}</td><td>${resource.number}</td></tr>`;
    });
    html += '</table>';
    
    document.getElementById("resourceOrderingTable").innerHTML = html;
}

function updateProcessHoldingsTable() {
    if (processes.length === 0) return;
    
    let html = '<table><tr><th>Process</th><th>Resources Held (In Order)</th></tr>';
    processes.forEach(process => {
        // Initialize process holdings if not already done
        if (!processHoldings[process.id]) {
            processHoldings[process.id] = [];
        }
        
        // Display resources held in order
        html += `<tr><td>${process.id}</td><td>${processHoldings[process.id].join(', ') || 'None'}</td></tr>`;
    });
    html += '</table>';
    
    document.getElementById("processHoldingsTable").innerHTML = html;
}

function drawGraph(canvasId) {
    // Only draw the graph for the setup tab
    if (canvasId !== "setupGraph") return;
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (processes.length === 0 || resources.length === 0) {
        ctx.fillText("Please set up processes and resources first", 20, 20);
        return;
    }
    
    const nodeRadius = 25;
    const processX = 100;
    const resourceX = 400;
    const startY = 50;
    const spacing = 80;
    
    // Draw processes
    processes.forEach((process, index) => {
        const y = startY + index * spacing;
        
        // Draw process circle
        ctx.beginPath();
        ctx.arc(processX, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        ctx.stroke();
        
        // Draw process label
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Arial";
        ctx.fillText(process.id, processX, y);
    });
    
    // Draw resources
    resources.forEach((resource, index) => {
        const y = startY + index * spacing;
        
        // Draw resource square
        ctx.beginPath();
        ctx.rect(resourceX - nodeRadius, y - nodeRadius, nodeRadius * 2, nodeRadius * 2);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        ctx.stroke();
        
        // Draw resource label and available instances
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Arial";
        ctx.fillText(resource.id, resourceX, y - 5);
        ctx.font = "12px Arial";
        ctx.fillText(`Avail: ${resource.available}/${resource.instances}`, resourceX, y + 15);
    });
    
    // Draw allocation edges (resource to process)
    processes.forEach((process, pIndex) => {
        const processY = startY + pIndex * spacing;
        
        resources.forEach((resource, rIndex) => {
            const resourceY = startY + rIndex * spacing;
            const allocated = process.allocation[resource.id];
            
            if (allocated > 0) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                drawArrow(ctx, resourceX - nodeRadius, resourceY, processX + nodeRadius, processY, 10);
            }
        });
    });
}

function drawArrow(ctx, fromX, fromY, toX, toY, headLength = 10) {
    // Calculate angle
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Draw main line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Calculate arrowhead points
    const arrowX1 = toX - headLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = toY - headLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = toX - headLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = toY - headLength * Math.sin(angle + Math.PI / 6);
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
}

// Banker's Algorithm for Deadlock Avoidance
function checkSystemSafety() {
    // Check if the system state is safe
    const safeResult = isSafeState(processes, resources);
    
    if (safeResult.safe) {
        document.getElementById("systemSafetyResult").innerHTML = `
            <div class="success-result">
                <p>Current system state is safe!</p>
                <p>Safe sequence: ${safeResult.sequence.join(" → ")}</p>
            </div>
        `;
    } else {
        document.getElementById("systemSafetyResult").innerHTML = `
            <div class="error-result">
                <p>Warning: Current system state is not safe!</p>
                <p>No safe sequence exists. Deadlock could occur.</p>
            </div>
        `;
    }
}

function checkRequestSafety() {
    const processId = document.getElementById("bankerProcess").value;
    const process = processes.find(p => p.id === processId);
    if (!process) {
        alert("Please select a valid process!");
        return;
    }
    
    // Get the requested resources
    const request = {};
    let requestIsValid = true;
    resources.forEach(resource => {
        const requestAmount = parseInt(document.getElementById(`banker${resource.id}`).value) || 0;
        request[resource.id] = requestAmount;
        
        // Check if request exceeds need
        if (requestAmount > process.need[resource.id]) {
            alert(`Request for ${resource.id} (${requestAmount}) exceeds process need (${process.need[resource.id]})!`);
            requestIsValid = false;
        }
        
        // Check if request exceeds available
        if (requestAmount > resource.available) {
            alert(`Request for ${resource.id} (${requestAmount}) exceeds available (${resource.available})!`);
            requestIsValid = false;
        }
    });
    
    if (!requestIsValid) {
        document.getElementById("requestSafetyResult").innerHTML = '<div class="error-result">Request cannot be granted - it exceeds need or available resources.</div>';
        return;
    }
    
    // Make a deep copy of the system state for simulation
    const simulatedResources = JSON.parse(JSON.stringify(resources));
    const simulatedProcesses = JSON.parse(JSON.stringify(processes));
    
    // Find the process in the simulated state
    const simulatedProcess = simulatedProcesses.find(p => p.id === processId);
    
    // Temporarily allocate resources
    resources.forEach(resource => {
        const requestAmount = request[resource.id];
        const simResource = simulatedResources.find(r => r.id === resource.id);
        
        simResource.available -= requestAmount;
        simulatedProcess.allocation[resource.id] += requestAmount;
        simulatedProcess.need[resource.id] -= requestAmount;
    });
    
    // Check if the resulting state is safe
    const safeResult = isSafeState(simulatedProcesses, simulatedResources);
    
    if (safeResult.safe) {
        document.getElementById("requestSafetyResult").innerHTML = `
            <div class="success-result">
                <p>Request can be granted! The resulting state would be safe.</p>
                <p>Safe sequence: ${safeResult.sequence.join(" → ")}</p>
            </div>
        `;
    } else {
        document.getElementById("requestSafetyResult").innerHTML = `
            <div class="error-result">
                <p>Request should be denied! The resulting state would not be safe.</p>
                <p>No safe sequence exists that would allow all processes to complete.</p>
            </div>
        `;
    }
}

function isSafeState(simProcesses, simResources) {
    // Make work array equal to available resources
    const work = {};
    simResources.forEach(resource => {
        work[resource.id] = resource.available;
    });
    
    // Initialize finish array
    const finish = {};
    simProcesses.forEach(process => {
        finish[process.id] = false;
    });
    
    let safeSequence = [];
    let found = true;
    
    // Continue until we can't find any eligible process
    while (found) {
        found = false;
        
        for (let i = 0; i < simProcesses.length; i++) {
            const process = simProcesses[i];
            
            // Skip finished processes
            if (finish[process.id]) continue;
            
            // Check if all needs can be satisfied
            let canBeAllocated = true;
            
            for (const resourceId in process.need) {
                if (process.need[resourceId] > work[resourceId]) {
                    canBeAllocated = false;
                    break;
                }
            }
            
            if (canBeAllocated) {
                // This process can finish - add its resources back to work
                for (const resourceId in process.allocation) {
                    work[resourceId] += process.allocation[resourceId];
                }
                
                finish[process.id] = true;
                safeSequence.push(process.id);
                found = true;
            }
        }
    }
    
    // Check if all processes are marked as finished
    const allFinished = Object.values(finish).every(f => f);
    
    return {
        safe: allFinished,
        sequence: allFinished ? safeSequence : []
    };
}

// Deadlock Detection Algorithm
function addRequest() {
    const processId = document.getElementById("requestProcess").value;
    const process = processes.find(p => p.id === processId);
    if (!process) {
        alert("Please select a valid process!");
        return;
    }
    
    // Initialize request matrix for this process if it doesn't exist
    if (!requestMatrix[processId]) {
        requestMatrix[processId] = {};
    }
    
    // Get the requested resources
    resources.forEach(resource => {
        const requestAmount = parseInt(document.getElementById(`req${resource.id}`).value) || 0;
        requestMatrix[processId][resource.id] = requestAmount;
    });
    
    // Update tables
    renderRequestTable();
    
    document.getElementById("detectionResult").innerHTML = `
        <div class="success-result">
            <p>Request added for ${processId}. Use 'Detect Deadlock' to check system state.</p>
        </div>
    `;
}

function detectDeadlock() {
    // Make work array equal to available resources
    const work = {};
    resources.forEach(resource => {
        work[resource.id] = resource.available;
    });
    
    // Initialize finish array based on allocation
    const finish = {};
    processes.forEach(process => {
        // A process with no allocation can finish
        const hasAllocation = Object.values(process.allocation).some(a => a > 0);
        finish[process.id] = !hasAllocation;
    });
    
    let found = true;
    let unfinishedCount = processes.length - Object.values(finish).filter(f => f).length;
    
    // Continue until we can't find any eligible process
    while (found) {
        found = false;
        
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            
            // Skip finished processes
            if (finish[process.id]) continue;
            
            // Check if request can be satisfied
            let canBeAllocated = true;
            
            if (requestMatrix[process.id]) {
                for (const resourceId in requestMatrix[process.id]) {
                    const requestAmount = requestMatrix[process.id][resourceId];
                    if (requestAmount > work[resourceId]) {
                        canBeAllocated = false;
                        break;
                    }
                }
            }
            
            if (canBeAllocated) {
                // This process can finish - add its resources back to work
                for (const resourceId in process.allocation) {
                    work[resourceId] += process.allocation[resourceId];
                }
                
                finish[process.id] = true;
                found = true;
                unfinishedCount--;
            }
        }
    }
    
    // If there are unfinished processes, deadlock exists
    if (unfinishedCount > 0) {
        // Get the deadlocked processes
        const deadlockedProcesses = processes
            .filter(p => !finish[p.id])
            .map(p => p.id);
        
        document.getElementById("detectionResult").innerHTML = `
            <div class="error-result">
                <p>Deadlock detected!</p>
                <p>Deadlocked processes: ${deadlockedProcesses.join(", ")}</p>
            </div>
        `;
    } else {
        document.getElementById("detectionResult").innerHTML = `
            <div class="success-result">
                <p>No deadlock detected. All processes can complete.</p>
            </div>
        `;
    }
}

// Deadlock Prevention using Resource Ordering
function requestOrderedResource() {
    const processId = document.getElementById("preventionProcess").value;
    const resourceId = document.getElementById("preventionResource").value;
    
    const process = processes.find(p => p.id === processId);
    const resource = resources.find(r => r.id === resourceId);
    
    if (!process || !resource) {
        alert("Please select a valid process and resource!");
        return;
    }
    
    // Check if the process already holds resources with higher numbers
    const highestHeldResourceNumber = processHoldings[processId].length > 0 ?
        Math.max(...processHoldings[processId].map(rid => {
            const res = resources.find(r => r.id === rid);
            return res ? res.number : 0;
        })) : 0;
    
    if (resource.number < highestHeldResourceNumber) {
        document.getElementById("preventionResult").innerHTML = `
            <div class="error-result">
                <p>Request denied! Resource ordering violation.</p>
                <p>Process ${processId} already holds resources with higher ordering numbers.</p>
                <p>This prevents deadlock by enforcing a global resource ordering.</p>
            </div>
        `;
        return;
    }
    
    // Check if there are available instances
    if (resource.available <= 0) {
        document.getElementById("preventionResult").innerHTML = `
            <div class="error-result">
                <p>Request denied! No available instances of ${resourceId}.</p>
            </div>
        `;
        return;
    }
    
    // Grant the resource
    resource.available--;
    process.allocation[resourceId]++;
    process.need[resourceId]--;
    
    // Add to process holdings
    processHoldings[processId].push(resourceId);
    
    document.getElementById("preventionResult").innerHTML = `
        <div class="success-result">
            <p>Resource ${resourceId} allocated to process ${processId} successfully!</p>
        </div>
    `;
    
    // Update tables
    updateProcessHoldingsTable();
    renderTables();
}

function updateAvoidanceTab() {
    // Update the system safety information
    checkSystemSafety();
}

function updateDetectionTab() {
    // Reset result box when switching to detection tab
    document.getElementById("detectionResult").innerHTML = '';
}

function updatePreventionTab() {
    // Reset result box when switching to prevention tab
    document.getElementById("preventionResult").innerHTML = '';
}

// Event listeners for window load
window.onload = function() {
    // Attach click handlers to tab buttons
    document.querySelectorAll('.tablinks').forEach(button => {
        button.addEventListener('click', function(event) {
            openTab(event, this.getAttribute('onclick').match(/'([^']+)'/)[1]);
        });
    });
    
    // Set up initial resource and process inputs
    document.getElementById("numResources").addEventListener('change', generateResourceInputs);
    document.getElementById("numProcesses").addEventListener('change', generateProcessInputs);
    
    // Set up button click handlers
    document.getElementById("setupResourcesBtn").addEventListener('click', setupResources);
    document.getElementById("setupProcessesBtn").addEventListener('click', setupProcesses);
    document.getElementById("setupAllocationBtn").addEventListener('click', setupAllocation);
    document.getElementById("checkSystemSafetyBtn").addEventListener('click', checkSystemSafety);
    document.getElementById("checkRequestSafetyBtn").addEventListener('click', checkRequestSafety);
    document.getElementById("addRequestBtn").addEventListener('click', addRequest);
    document.getElementById("detectDeadlockBtn").addEventListener('click', detectDeadlock);
    document.getElementById("requestOrderedResourceBtn").addEventListener('click', requestOrderedResource);
    
    // Default to setup tab
    document.getElementById("defaultOpen").click();
    
    // Generate default resource inputs
    generateResourceInputs();
};

function releaseResource() {
    const processId = document.getElementById("preventionProcess").value;
    const resourceId = document.getElementById("preventionResource").value;
    
    const process = processes.find(p => p.id === processId);
    const resource = resources.find(r => r.id === resourceId);
    
    if (!process || !resource) {
        alert("Please select a valid process and resource!");
        return;
    }
    
    // Check if the process holds this resource
    if (!processHoldings[processId].includes(resourceId)) {
        document.getElementById("preventionResult").innerHTML = `
            <div class="error-result">
                <p>Release failed! Process ${processId} does not hold resource ${resourceId}.</p>
            </div>
        `;
        return;
    }
    
    // Check resource ordering for release (should release in reverse order)
    const highestHeldResourceNumber = Math.max(...processHoldings[processId].map(rid => {
        const res = resources.find(r => r.id === rid);
        return res ? res.number : 0;
    }));
    
    if (resource.number < highestHeldResourceNumber) {
        document.getElementById("preventionResult").innerHTML = `
            <div class="warning-result">
                <p>Warning: Resources should ideally be released in reverse order of acquisition.</p>
                <p>Proceeding with release anyway since it doesn't affect deadlock prevention.</p>
            </div>
        `;
    }
    
    // Release the resource
    resource.available++;
    process.allocation[resourceId]--;
    process.need[resourceId]++;
    
    // Remove from process holdings
    processHoldings[processId] = processHoldings[processId].filter(r => r !== resourceId);
    
    document.getElementById("preventionResult").innerHTML = `
        <div class="success-result">
            <p>Resource ${resourceId} released by process ${processId} successfully!</p>
        </div>
    `;
    
    // Update tables
    updateProcessHoldingsTable();
    renderTables();
}

// Add this function to reset the simulation
function resetSimulation() {
    // Reset resources and processes
    resources = [];
    processes = [];
    requestMatrix = {};
    processHoldings = {};
    
    // Reset UI elements
    document.getElementById("numResources").value = 3;
    document.getElementById("numProcesses").value = 3;
    
    // Generate default inputs
    generateResourceInputs();
    
    // Clear tables and results
    document.getElementById("resourceInstancesInputs").innerHTML = '';
    document.getElementById("processMaxClaimInputs").innerHTML = '';
    document.getElementById("allocationInputs").innerHTML = '';
    document.getElementById("availableResources").innerHTML = '';
    document.getElementById("bankerResourceInputs").innerHTML = '';
    document.getElementById("requestResourceInputs").innerHTML = '';
    document.getElementById("systemSafetyResult").innerHTML = '';
    document.getElementById("requestSafetyResult").innerHTML = '';
    document.getElementById("detectionResult").innerHTML = '';
    document.getElementById("preventionResult").innerHTML = '';
    
    // Clear all tables
    document.getElementById("maxClaimTable").innerHTML = '';
    document.getElementById("allocationTable").innerHTML = '';
    document.getElementById("needTable").innerHTML = '';
    document.getElementById("availableTable").innerHTML = '';
    document.getElementById("detectionAllocationTable").innerHTML = '';
    document.getElementById("requestTable").innerHTML = '';
    document.getElementById("resourceOrderingTable").innerHTML = '';
    document.getElementById("processHoldingsTable").innerHTML = '';
    
    // Clear graph
    const canvas = document.getElementById("setupGraph");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset to setup tab
    document.getElementById("defaultOpen").click();
}

// Add some educational content about deadlocks
function showHelp() {
    const helpContent = `
        <div class="help-modal">
            <h2>Deadlock Concepts</h2>
            
            <h3>What is a Deadlock?</h3>
            <p>A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting to acquire a resource held by another process.</p>
            
            <h3>Four Necessary Conditions for Deadlock</h3>
            <ol>
                <li><strong>Mutual Exclusion:</strong> At least one resource must be held in a non-sharable mode.</li>
                <li><strong>Hold and Wait:</strong> A process holding resources can request more resources.</li>
                <li><strong>No Preemption:</strong> Resources cannot be forcibly taken from a process.</li>
                <li><strong>Circular Wait:</strong> A circular chain of processes exists, where each is waiting for a resource held by the next.</li>
            </ol>
            
            <h3>Deadlock Strategies</h3>
            <h4>Prevention (Tab 4)</h4>
            <p>Prevent deadlocks by ensuring at least one of the four necessary conditions cannot hold. This simulation demonstrates resource ordering, which prevents circular wait.</p>
            
            <h4>Avoidance (Tab 2)</h4>
            <p>The Banker's Algorithm is used to determine if a resource request would lead to a safe or unsafe state. The system only grants requests that keep the system in a safe state.</p>
            
            <h4>Detection (Tab 3)</h4>
            <p>Allow deadlocks to occur, but detect when they happen and recover. This simulation shows a detection algorithm that identifies deadlocked processes.</p>
            
            <h3>Using This Simulator</h3>
            <ol>
                <li>Start in the Setup tab to define resources and processes</li>
                <li>Explore how the Banker's Algorithm works in the Avoidance tab</li>
                <li>Simulate resource requests and detect deadlocks in the Detection tab</li>
                <li>Learn about resource ordering in the Prevention tab</li>
            </ol>
        </div>
    `;
    
    document.getElementById("helpContent").innerHTML = helpContent;
    document.getElementById("helpModal").style.display = "block";
}

function closeHelp() {
    document.getElementById("helpModal").style.display = "none";
}

// Add to window.onload
// document.getElementById("helpBtn").addEventListener('click', showHelp);
// document.getElementById("closeHelpBtn").addEventListener('click', closeHelp);
// document.getElementById("resetBtn").addEventListener('click', resetSimulation);