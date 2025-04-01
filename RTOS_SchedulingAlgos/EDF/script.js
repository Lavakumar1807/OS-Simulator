let processes = [];
let colors = ['#80b1d3', '#b3de69', '#fb8072', '#bebada', '#fdb462', '#8dd3c7', '#d9d9d9', '#bc80bd'];

function addProcess() {
    let name = document.getElementById("processName").value.trim();
    let period = parseInt(document.getElementById("period").value);
    let executionTime = parseInt(document.getElementById("executionTime").value);
    let deadline = parseInt(document.getElementById("deadline").value);

    if (name && !isNaN(period) && !isNaN(executionTime) && !isNaN(deadline)) {
        let utilization = executionTime / period;

        processes.push({
            name,
            period,
            executionTime,
            deadline: deadline || period,
            color: colors[processes.length % colors.length],
            utilization
        });

        updateProcessTable();
        calculateSystemUtilization();
        clearInputs();
    } else {
        alert("Please fill all fields correctly!");
    }
}

function updateProcessTable() {
    let tableBody = document.getElementById("processTableBody");
    tableBody.innerHTML = processes.map((p, index) => `
        <tr>
            <td>${p.name}</td>
            <td>${p.period}</td>
            <td>${p.executionTime}</td>
            <td>${p.deadline}</td>
            <td>${(p.utilization * 100).toFixed(2)}%</td>
            <td><button onclick="removeProcess(${index})">Remove</button></td>
        </tr>
    `).join('');
}

function calculateSystemUtilization() {
    let totalUtilization = processes.reduce((sum, p) => sum + p.utilization, 0);
    let utilizationEl = document.getElementById("systemUtilization");

    utilizationEl.innerHTML = `
        <strong>System Utilization:</strong> ${(totalUtilization * 100).toFixed(2)}%
        ${totalUtilization > 1 ? 
            '<span style="color: red;"> (Overutilized - Not schedulable with EDF)</span>' : 
            '<span style="color: green;"> (Potentially Schedulable with EDF)</span>'
        }
    `;
}

function removeProcess(index) {
    processes.splice(index, 1);
    updateProcessTable();
    calculateSystemUtilization();
}

function clearInputs() {
    document.getElementById("processName").value = "";
    document.getElementById("period").value = "";
    document.getElementById("executionTime").value = "";
    document.getElementById("deadline").value = "";
}

function clearGanttChart() {
    document.getElementById("ganttChart").innerHTML = '';
    document.getElementById("schedulabilityAnalysis").innerHTML = '';
}

function runScheduler() {
    if (processes.length === 0) {
        alert("Add some processes first!");
        return;
    }


    clearGanttChart();

    let totalUtilization = processes.reduce((sum, p) => sum + p.utilization, 0);
    let schedulabilityEl = document.getElementById("schedulabilityAnalysis");

    if (totalUtilization > 1) {
        schedulabilityEl.innerHTML = `<div style="color: red;"><strong>Schedulability Test Failed:</strong> EDF cannot schedule tasks with utilization > 100%.</div>`;
        return; 
    }

  
    let simulationLength = Math.max(...processes.map(p => p.period));
    
  
    let schedule = generateEDFSchedule(processes, simulationLength);
    
   
    createGanttChart(schedule, simulationLength);
    
    schedulabilityEl.innerHTML = `<div style="color: green;"><strong>Schedulability Test Passed:</strong> EDF schedule shown for one cycle of each process.</div>`;
}

function calculateHyperperiod(periods) {

    return periods.reduce((lcm, period) => {
        return (lcm * period) / gcd(lcm, period);
    }, 1);
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function generateEDFSchedule(processes, simulationLength) {
   
    let taskInstances = [];

    processes.forEach(process => {
        taskInstances.push({
            name: process.name,
            releaseTime: 0,
            deadline: process.deadline,
            executionTime: process.executionTime,
            remainingTime: process.executionTime,
            completed: false,
            color: process.color,
            period: process.period 
        });
    });
    
    
    taskInstances.sort((a, b) => a.deadline - b.deadline);
    
  
    let schedule = [];
    let currentTime = 0;
    

    while (currentTime < simulationLength) {
  
        let readyTasks = taskInstances.filter(task => 
            task.releaseTime <= currentTime && 
            task.remainingTime > 0 && 
            !task.completed
        );
        
        if (readyTasks.length === 0) {
        
            schedule.push({
                name: "Idle",
                startTime: currentTime,
                endTime: currentTime + 1,
                color: "#e5e5e5" 
            });
            currentTime++;
            continue;
        }
        
      
        readyTasks.sort((a, b) => a.deadline - b.deadline);
        let selectedTask = readyTasks[0];
       
        schedule.push({
            name: selectedTask.name,
            startTime: currentTime,
            endTime: currentTime + 1,
            color: selectedTask.color
        });
        
        
        selectedTask.remainingTime--;
        if (selectedTask.remainingTime === 0) {
            selectedTask.completed = true;
        }

        currentTime++;
    }

    let mergedSchedule = [];
    let currentBlock = null;
    
    for (let i = 0; i < schedule.length; i++) {
        if (!currentBlock) {
            currentBlock = {...schedule[i]};
        } else if (currentBlock.name === schedule[i].name && currentBlock.endTime === schedule[i].startTime) {
            currentBlock.endTime = schedule[i].endTime;
        } else {
            mergedSchedule.push(currentBlock);
            currentBlock = {...schedule[i]};
        }
    }
    
    if (currentBlock) {
        mergedSchedule.push(currentBlock);
    }
    
    return mergedSchedule;
}

function createGanttChart(schedule, simulationLength) {
    const ganttEl = document.getElementById("ganttChart");
    
 
    const container = document.createElement("div");
    container.className = "gantt-container";

    const timeline = document.createElement("div");
    timeline.className = "gantt-timeline";
    

    const timeStep = simulationLength > 50 ? 5 : 1;
    for (let t = 0; t <= simulationLength; t += timeStep) {
        const mark = document.createElement("div");
        mark.className = "timeline-mark";
        mark.style.left = `${(t / simulationLength) * 100}%`;
        
        const label = document.createElement("div");
        label.className = "timeline-label";
        label.textContent = t;
        label.style.left = `${(t / simulationLength) * 100}%`;
        
        timeline.appendChild(mark);
        timeline.appendChild(label);
    }
    
    container.appendChild(timeline);
 
    const processNames = [...new Set(schedule.map(item => item.name))];
    
 
    processNames.forEach(name => {
        const row = document.createElement("div");
        row.className = "gantt-process-row";
        
        const label = document.createElement("div");
        label.className = "process-label";
        label.textContent = name;
        row.appendChild(label);
        

        const processBlocks = schedule.filter(item => item.name === name);
        processBlocks.forEach(block => {
            const blockEl = document.createElement("div");
            blockEl.className = "gantt-block";
            blockEl.style.left = `${(block.startTime / simulationLength) * 100}%`;
            blockEl.style.width = `${((block.endTime - block.startTime) / simulationLength) * 100}%`;
            blockEl.style.backgroundColor = block.color;
            

            const duration = block.endTime - block.startTime;
            blockEl.setAttribute("data-tooltip", `Process: ${name}\nStart: ${block.startTime}\nEnd: ${block.endTime}\nDuration: ${duration}`);
            
          
            if (block.endTime - block.startTime < 2) {
                blockEl.textContent = "";
            } else {
                blockEl.textContent = name;
            }
            
            row.appendChild(blockEl);
        });
        
        container.appendChild(row);
    });
    
 
    const legend = document.createElement("div");
    legend.className = "gantt-legend";
    legend.style.marginTop = "20px";
    legend.style.display = "flex";
    legend.style.gap = "20px";
    legend.style.justifyContent = "center";
    
    const idleLegend = document.createElement("div");
    idleLegend.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: #e5e5e5; margin-right: 5px;"></span> Idle Time`;
    
    legend.appendChild(idleLegend);
    
    container.appendChild(legend);
    
    ganttEl.appendChild(container);
}