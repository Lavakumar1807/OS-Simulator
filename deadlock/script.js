
let resources = []; 
let processes = []; 
let requestMatrix = {}; 
let processHoldings = {};


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
    
   
    processHoldings = {};
    processes.forEach(process => {
        processHoldings[process.id] = [];
    });
    
   
    updateSelectOptions("bankerProcess", processes.map(p => p.id));
    updateSelectOptions("requestProcess", processes.map(p => p.id));
    updateSelectOptions("preventionProcess", processes.map(p => p.id));
    
    
    generateBankerResourceInputs();
    
    
    generateRequestResourceInputs();
    
    renderTables();
    drawGraph("setupGraph");
}

function setupAllocation() {
    const numProcesses = parseInt(document.getElementById("numProcesses").value);
    const numResources = parseInt(document.getElementById("numResources").value);
    
    
    resources.forEach(resource => {
        resource.available = resource.instances;
    });
    
    
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
            
            
            const resource = resources.find(r => r.id === resourceId);
            resource.available -= alloc;
            
            // Check if we've allocated more than total instances
            if (resource.available < 0) {
                alert(`Total allocation of R${j} exceeds available instances!`);
                return;
            }
        }
    }
    
   
    updateProcessHoldingsTable();
    
    
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
    
    renderMaxClaimTable();
    renderAllocationTable();
    renderNeedTable();
    renderAvailableTable();
    
    
    renderDetectionAllocationTable();
    renderRequestTable();
    
    
    renderResourceOrderingTable();
    
    
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
        
        if (!processHoldings[process.id]) {
            processHoldings[process.id] = [];
        }
        
       
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
    
    
    processes.forEach((process, index) => {
        const y = startY + index * spacing;
        
        
        ctx.beginPath();
        ctx.arc(processX, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        ctx.stroke();
        
        
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Arial";
        ctx.fillText(process.id, processX, y);
    });
    
   
    resources.forEach((resource, index) => {
        const y = startY + index * spacing;
        
        
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
    
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    
    const arrowX1 = toX - headLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = toY - headLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = toX - headLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = toY - headLength * Math.sin(angle + Math.PI / 6);
    
   
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
}


function checkSystemSafety() {
   
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
    
    
    const request = {};
    let requestIsValid = true;
    resources.forEach(resource => {
        const requestAmount = parseInt(document.getElementById(`banker${resource.id}`).value) || 0;
        request[resource.id] = requestAmount;
        
        
        if (requestAmount > process.need[resource.id]) {
            alert(`Request for ${resource.id} (${requestAmount}) exceeds process need (${process.need[resource.id]})!`);
            requestIsValid = false;
        }
        
       
        if (requestAmount > resource.available) {
            alert(`Request for ${resource.id} (${requestAmount}) exceeds available (${resource.available})!`);
            requestIsValid = false;
        }
    });
    
    if (!requestIsValid) {
        document.getElementById("requestSafetyResult").innerHTML = '<div class="error-result">Request cannot be granted - it exceeds need or available resources.</div>';
        return;
    }
    
   
    const simulatedResources = JSON.parse(JSON.stringify(resources));
    const simulatedProcesses = JSON.parse(JSON.stringify(processes));
    
   
    const simulatedProcess = simulatedProcesses.find(p => p.id === processId);
    
   
    resources.forEach(resource => {
        const requestAmount = request[resource.id];
        const simResource = simulatedResources.find(r => r.id === resource.id);
        
        simResource.available -= requestAmount;
        simulatedProcess.allocation[resource.id] += requestAmount;
        simulatedProcess.need[resource.id] -= requestAmount;
    });
    
    
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
    
    const work = {};
    simResources.forEach(resource => {
        work[resource.id] = resource.available;
    });
    
    
    const finish = {};
    simProcesses.forEach(process => {
        finish[process.id] = false;
    });
    
    let safeSequence = [];
    let found = true;
    
    
    while (found) {
        found = false;
        
        for (let i = 0; i < simProcesses.length; i++) {
            const process = simProcesses[i];
            
            
            if (finish[process.id]) continue;
            
        
            let canBeAllocated = true;
            
            for (const resourceId in process.need) {
                if (process.need[resourceId] > work[resourceId]) {
                    canBeAllocated = false;
                    break;
                }
            }
            
            if (canBeAllocated) {
               
                for (const resourceId in process.allocation) {
                    work[resourceId] += process.allocation[resourceId];
                }
                
                finish[process.id] = true;
                safeSequence.push(process.id);
                found = true;
            }
        }
    }
    
  
    const allFinished = Object.values(finish).every(f => f);
    
    return {
        safe: allFinished,
        sequence: allFinished ? safeSequence : []
    };
}


function addRequest() {
    const processId = document.getElementById("requestProcess").value;
    const process = processes.find(p => p.id === processId);
    if (!process) {
        alert("Please select a valid process!");
        return;
    }
    
    if (!requestMatrix[processId]) {
        requestMatrix[processId] = {};
    }
    
  
    resources.forEach(resource => {
        const requestAmount = parseInt(document.getElementById(`req${resource.id}`).value) || 0;
        requestMatrix[processId][resource.id] = requestAmount;
    });
    
   
    renderRequestTable();
    
    document.getElementById("detectionResult").innerHTML = `
        <div class="success-result">
            <p>Request added for ${processId}. Use 'Detect Deadlock' to check system state.</p>
        </div>
    `;
}

function detectDeadlock() {
   
    const work = {};
    resources.forEach(resource => {
        work[resource.id] = resource.available;
    });
    
   
    const finish = {};
    processes.forEach(process => {
      
        const hasAllocation = Object.values(process.allocation).some(a => a > 0);
        finish[process.id] = !hasAllocation;
    });
    
    let found = true;
    let unfinishedCount = processes.length - Object.values(finish).filter(f => f).length;
    

    while (found) {
        found = false;
        
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            

            if (finish[process.id]) continue;
            

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


function requestOrderedResource() {
    const processId = document.getElementById("preventionProcess").value;
    const resourceId = document.getElementById("preventionResource").value;
    
    const process = processes.find(p => p.id === processId);
    const resource = resources.find(r => r.id === resourceId);
    
    if (!process || !resource) {
        alert("Please select a valid process and resource!");
        return;
    }
    
 
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
    

    if (resource.available <= 0) {
        document.getElementById("preventionResult").innerHTML = `
            <div class="error-result">
                <p>Request denied! No available instances of ${resourceId}.</p>
            </div>
        `;
        return;
    }
    

    resource.available--;
    process.allocation[resourceId]++;
    process.need[resourceId]--;
    

    processHoldings[processId].push(resourceId);
    
    document.getElementById("preventionResult").innerHTML = `
        <div class="success-result">
            <p>Resource ${resourceId} allocated to process ${processId} successfully!</p>
        </div>
    `;
    

    updateProcessHoldingsTable();
    renderTables();
}

function updateAvoidanceTab() {

    checkSystemSafety();
}

function updateDetectionTab() {

    document.getElementById("detectionResult").innerHTML = '';
}

function updatePreventionTab() {

    document.getElementById("preventionResult").innerHTML = '';
}


window.onload = function() {

    document.querySelectorAll('.tablinks').forEach(button => {
        button.addEventListener('click', function(event) {
            openTab(event, this.getAttribute('onclick').match(/'([^']+)'/)[1]);
        });
    });
    

    document.getElementById("numResources").addEventListener('change', generateResourceInputs);
    document.getElementById("numProcesses").addEventListener('change', generateProcessInputs);
    

    document.getElementById("setupResourcesBtn").addEventListener('click', setupResources);
    document.getElementById("setupProcessesBtn").addEventListener('click', setupProcesses);
    document.getElementById("setupAllocationBtn").addEventListener('click', setupAllocation);
    document.getElementById("checkSystemSafetyBtn").addEventListener('click', checkSystemSafety);
    document.getElementById("checkRequestSafetyBtn").addEventListener('click', checkRequestSafety);
    document.getElementById("addRequestBtn").addEventListener('click', addRequest);
    document.getElementById("detectDeadlockBtn").addEventListener('click', detectDeadlock);
    document.getElementById("requestOrderedResourceBtn").addEventListener('click', requestOrderedResource);
    

    document.getElementById("defaultOpen").click();
    

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
    

    resource.available++;
    process.allocation[resourceId]--;
    process.need[resourceId]++;
    
  
    processHoldings[processId] = processHoldings[processId].filter(r => r !== resourceId);
    
    document.getElementById("preventionResult").innerHTML = `
        <div class="success-result">
            <p>Resource ${resourceId} released by process ${processId} successfully!</p>
        </div>
    `;
    

    updateProcessHoldingsTable();
    renderTables();
}


function resetSimulation() {

    resources = [];
    processes = [];
    requestMatrix = {};
    processHoldings = {};
    

    document.getElementById("numResources").value = 3;
    document.getElementById("numProcesses").value = 3;
    

    generateResourceInputs();
    

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
    

    document.getElementById("maxClaimTable").innerHTML = '';
    document.getElementById("allocationTable").innerHTML = '';
    document.getElementById("needTable").innerHTML = '';
    document.getElementById("availableTable").innerHTML = '';
    document.getElementById("detectionAllocationTable").innerHTML = '';
    document.getElementById("requestTable").innerHTML = '';
    document.getElementById("resourceOrderingTable").innerHTML = '';
    document.getElementById("processHoldingsTable").innerHTML = '';

    const canvas = document.getElementById("setupGraph");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    

    document.getElementById("defaultOpen").click();
}


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

