
let processes = [];
let nextProcessId = 1;
let timeScale = 5; 


document.addEventListener('DOMContentLoaded', function() {
    // Add a few example processes
    addInitialProcess("P1", 50, 25);
    addInitialProcess("P2", 75, 35);
    updateSystemUtilization();
});


function addInitialProcess(name, period, executionTime) {
    const process = {
        id: nextProcessId++,
        name: name,
        period: period,
        executionTime: executionTime,
        priority: 0 
    };
    
    processes.push(process);
    updateProcessTable();
    updatePriorities();
}

function addProcess() {
    const name = document.getElementById('processName').value || `P${nextProcessId}`;
    const period = parseInt(document.getElementById('period').value);
    const executionTime = parseInt(document.getElementById('executionTime').value);
    
    if (!period || !executionTime) {
        alert("Please enter both period and processing time");
        return;
    }
    
    if (executionTime > period) {
        alert("Processing time cannot be greater than period");
        return;
    }
    
    const process = {
        id: nextProcessId++,
        name: name,
        period: period,
        executionTime: executionTime,
        priority: 0 
    };
    
    processes.push(process);
    updateProcessTable();
    updatePriorities();
    
 
    document.getElementById('processName').value = '';
    document.getElementById('period').value = '';
    document.getElementById('executionTime').value = '';
}


function deleteProcess(id) {
    processes = processes.filter(p => p.id !== id);
    updateProcessTable();
    updatePriorities();
}


function updatePriorities() {

    processes.sort((a, b) => a.period - b.period);

    processes.forEach((process, index) => {
        process.priority = index + 1; 
    });
    
    updateProcessTable();
    updateSystemUtilization();
}


function updateProcessTable() {
    const tableBody = document.getElementById('processTableBody');
    tableBody.innerHTML = '';
    
    processes.forEach(process => {
        const utilizationPercent = (process.executionTime / process.period * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${process.period}</td>
            <td>${process.executionTime}</td>
            <td>${process.period}</td>
            <td>${utilizationPercent}%</td>
            <td><button class="delete-btn" onclick="deleteProcess(${process.id})">Remove</button></td>
        `;
        
        tableBody.appendChild(row);
    });
}


function updateSystemUtilization() {

    let totalUtilization = 0;
    processes.forEach(process => {
        totalUtilization += process.executionTime / process.period;
    });
    
    const utilizationPercent = (totalUtilization * 100).toFixed(2);

    const n = processes.length;
    const rmsBound = n * (Math.pow(2, 1/n) - 1);
    const rmsBoundPercent = (rmsBound * 100).toFixed(2);
    

    const isSchedulable = totalUtilization <= rmsBound;
    

    const statusElement = document.getElementById('systemUtilization');
    statusElement.innerHTML = `System Utilization: ${utilizationPercent}% `;
    
    if (isSchedulable) {
        statusElement.innerHTML += `<span class="schedulable">(Schedulable with RMS)</span>`;
    } else {
        statusElement.innerHTML += `<span class="not-schedulable">(Not Guaranteed Schedulable with RMS)</span>`;
    }
}


function calculateGCD(a, b) {
    return b === 0 ? a : calculateGCD(b, a % b);
}

function calculateLCM(a, b) {
    return (a * b) / calculateGCD(a, b);
}

function calculateCycleTime() {
    if (processes.length === 0) return 100;
    
    let lcm = processes[0].period;
    for (let i = 1; i < processes.length; i++) {
        lcm = calculateLCM(lcm, processes[i].period);
    }
    
    return lcm;
}


function runScheduler() {
    if (processes.length === 0) {
        alert("Please add at least one process");
        return;
    }

    const cycleTime = calculateCycleTime();
    

    const ganttChart = document.getElementById('ganttChart');
    const deadlineMarkers = document.getElementById('deadlineMarkers');
    const executionLog = document.getElementById('executionLog');

    ganttChart.innerHTML = '';
    deadlineMarkers.innerHTML = '';
    executionLog.innerHTML = '';
    
    ganttChart.style.height = `${(processes.length + 1) * 40 + 30}px`;
    
    timeScale = Math.max(3, Math.floor(900 / cycleTime));
    

    ganttChart.style.width = `${cycleTime * timeScale + 50}px`;
    deadlineMarkers.style.width = `${cycleTime * timeScale + 50}px`;
    

    const gridInterval = Math.max(5, Math.floor(cycleTime / 20)); 
    for (let t = 0; t <= cycleTime; t += gridInterval) {
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.left = `${t * timeScale}px`;
        marker.textContent = t;
        
        const line = document.createElement('div');
        line.className = 'time-line';
        line.style.left = `${t * timeScale}px`;
        line.style.height = '100%';
        line.style.background = t % (gridInterval * 5) === 0 ? '#888' : '#ddd'; 
        
        ganttChart.appendChild(marker);
        ganttChart.appendChild(line);
    }
    
 
    for (let i = 0; i < processes.length; i++) {
        const processLabel = document.createElement('div');
        processLabel.className = 'process-label';
        processLabel.style.position = 'absolute';
        processLabel.style.left = '5px';
        processLabel.style.top = `${i * 40 + 15}px`;
        processLabel.style.fontWeight = 'bold';
        processLabel.textContent = processes[i].name;
        
        ganttChart.appendChild(processLabel);
    }
    

    const idleLabel = document.createElement('div');
    idleLabel.className = 'process-label';
    idleLabel.style.position = 'absolute';
    idleLabel.style.left = '5px';
    idleLabel.style.top = `${processes.length * 40 + 15}px`;
    idleLabel.style.fontWeight = 'bold';
    idleLabel.textContent = 'Idle';
    
    ganttChart.appendChild(idleLabel);
    

    const schedule = rateMonotonicScheduling(cycleTime);
    

    displaySchedule(schedule, cycleTime);
    

    const schedulabilityElement = document.getElementById('schedulabilityStatus');
    schedulabilityElement.style.display = 'block'; 
    
 
    const missedDeadlines = schedule.missedDeadlines.length > 0;
    
    if (missedDeadlines) {
        schedulabilityElement.innerHTML = '<span class="not-schedulable">Schedulability Test Failed: Deadlines missed in RMS schedule.</span>';
    } else {
        schedulabilityElement.innerHTML = '<span class="schedulable">Schedulability Test Passed: RMS schedule shown for one cycle of each process.</span>';
    }
}


function clearGanttChart() {
    document.getElementById('ganttChart').innerHTML = '';
    document.getElementById('deadlineMarkers').innerHTML = '';
    document.getElementById('executionLog').innerHTML = '';
    document.getElementById('schedulabilityStatus').style.display = 'none';
}


function rateMonotonicScheduling(simulationTime) {

    const schedule = [];
    const remainingTimes = Array(processes.length).fill(0);
    const nextArrivalTimes = Array(processes.length).fill(0);
    const nextDeadlines = Array(processes.length).fill(0);
    const missedDeadlines = [];
    
    let currentTime = 0;
    let currentExecution = null;
    let idleSegmentStart = null;
    

    for (let i = 0; i < processes.length; i++) {
        nextArrivalTimes[i] = 0;
        nextDeadlines[i] = processes[i].period;
        remainingTimes[i] = processes[i].executionTime;
    }
    
 
    while (currentTime < simulationTime) {

        for (let i = 0; i < processes.length; i++) {
            if (currentTime === nextArrivalTimes[i]) {
         
                remainingTimes[i] = processes[i].executionTime;
                nextArrivalTimes[i] += processes[i].period;
                nextDeadlines[i] += processes[i].period;
                
          
                if (currentExecution !== null) {
                    if (processes[i].priority < processes[currentExecution].priority) {
                       
                        if (schedule.length > 0 && schedule[schedule.length - 1].process === processes[currentExecution].name) {
                            schedule[schedule.length - 1].end = currentTime;
                        }
                        
                       
                        currentExecution = i;
                        
             
                        if (idleSegmentStart !== null) {
                            schedule.push({
                                process: 'idle',
                                start: idleSegmentStart,
                                end: currentTime,
                                row: processes.length
                            });
                            idleSegmentStart = null;
                        }
                        
                       
                        schedule.push({
                            process: processes[i].name,
                            start: currentTime,
                            end: currentTime, 
                            row: i
                        });
                    }
                } else {
                  
                    currentExecution = i;
                    
                    
                    if (idleSegmentStart !== null) {
                        schedule.push({
                            process: 'idle',
                            start: idleSegmentStart,
                            end: currentTime,
                            row: processes.length
                        });
                        idleSegmentStart = null;
                    }
                    
                   
                    schedule.push({
                        process: processes[i].name,
                        start: currentTime,
                        end: currentTime, 
                        row: i
                    });
                }
            }
        }
    
        for (let i = 0; i < processes.length; i++) {
            if (currentTime === nextDeadlines[i] - 1) {
                if (remainingTimes[i] > 0) {
                   
                    missedDeadlines.push({
                        process: processes[i].name,
                        time: currentTime,
                        row: i
                    });
                }
            }
        }
        

        if (currentExecution === null) {
            let highestPriorityIndex = -1;
            
            for (let i = 0; i < processes.length; i++) {
                if (remainingTimes[i] > 0) {
                    if (highestPriorityIndex === -1 || processes[i].priority < processes[highestPriorityIndex].priority) {
                        highestPriorityIndex = i;
                    }
                }
            }
            
            if (highestPriorityIndex !== -1) {
                currentExecution = highestPriorityIndex;
                
                if (idleSegmentStart !== null) {
                    schedule.push({
                        process: 'idle',
                        start: idleSegmentStart,
                        end: currentTime,
                        row: processes.length 
                    });
                    idleSegmentStart = null;
                }
                
         
                schedule.push({
                    process: processes[currentExecution].name,
                    start: currentTime,
                    end: currentTime, 
                    row: currentExecution
                });
            } else if (idleSegmentStart === null) {
             
                idleSegmentStart = currentTime;
            }
        }
        
       
        if (currentExecution !== null) {
            remainingTimes[currentExecution]--;
            
      
            if (remainingTimes[currentExecution] === 0) {
     
                if (schedule.length > 0) {
                    schedule[schedule.length - 1].end = currentTime + 1;
                }
                
           
                currentExecution = null;
                
              
                let nextProcess = -1;
                for (let i = 0; i < processes.length; i++) {
                    if (remainingTimes[i] > 0) {
                        if (nextProcess === -1 || processes[i].priority < processes[nextProcess].priority) {
                            nextProcess = i;
                        }
                    }
                }
                
                if (nextProcess === -1) {
                    idleSegmentStart = currentTime + 1;
                } else {
                    currentExecution = nextProcess;
                    
                
                    schedule.push({
                        process: processes[currentExecution].name,
                        start: currentTime + 1,
                        end: currentTime + 1, 
                        row: currentExecution
                    });
                }
            }
        }

        currentTime++;
    }

    if (currentExecution !== null && schedule.length > 0) {
        schedule[schedule.length - 1].end = currentTime;
    }
    

    if (idleSegmentStart !== null) {
        schedule.push({
            process: 'idle',
            start: idleSegmentStart,
            end: currentTime,
            row: processes.length
        });
    }
    
    return {
        schedule: schedule,
        missedDeadlines: missedDeadlines
    };
}


function displaySchedule(scheduleResults, simulationTime) {
    const ganttChart = document.getElementById('ganttChart');
    const deadlineMarkers = document.getElementById('deadlineMarkers');

    const scheduleData = scheduleResults.schedule;
    const missedDeadlines = scheduleResults.missedDeadlines;
    

    for (const execution of scheduleData) {
        const executionBlock = document.createElement('div');
        
        if (execution.process === 'idle') {
            executionBlock.className = 'idle-segment';
        } else {
            executionBlock.className = 'process-execution';
            executionBlock.style.backgroundColor = getProcessColor(execution.process);
        }
        
        executionBlock.style.left = `${execution.start * timeScale}px`;
        executionBlock.style.width = `${(execution.end - execution.start) * timeScale}px`;
        executionBlock.style.top = `${execution.row * 40 + 5}px`;
        
       
        if ((execution.end - execution.start) * timeScale >= 25) {
            executionBlock.textContent = execution.process;
        }
        

        const duration = execution.end - execution.start;
        
  
        executionBlock.addEventListener('mouseenter', function(e) {
   
            const tooltip = document.createElement('div');
            tooltip.className = 'process-tooltip';
            tooltip.innerHTML = `
                <strong>${execution.process}</strong><br>
                Start: ${execution.start}<br>
                End: ${execution.end}<br>
                Duration: ${duration}
            `;
            
          
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            
            
            document.body.appendChild(tooltip);
            
            
            executionBlock.tooltip = tooltip;
        });
        
        executionBlock.addEventListener('mousemove', function(e) {
            
            if (executionBlock.tooltip) {
                executionBlock.tooltip.style.left = `${e.pageX + 10}px`;
                executionBlock.tooltip.style.top = `${e.pageY + 10}px`;
            }
        });
        
        executionBlock.addEventListener('mouseleave', function() {
           
            if (executionBlock.tooltip) {
                document.body.removeChild(executionBlock.tooltip);
                executionBlock.tooltip = null;
            }
        });
        
        ganttChart.appendChild(executionBlock);
    }
    
  
    for (let i = 0; i < processes.length; i++) {
        let period = processes[i].period;
        
        while (period <= simulationTime) {
          
            const periodMarker = document.createElement('div');
            periodMarker.className = 'period-marker';
            periodMarker.style.left = `${period * timeScale}px`;
            periodMarker.style.top = `0px`;
            periodMarker.style.height = `${ganttChart.clientHeight}px`;
            
        
            const periodLabel = document.createElement('div');
            periodLabel.className = 'period-label';
            periodLabel.style.left = `${period * timeScale}px`;
            periodLabel.style.top = `-20px`;
            periodLabel.innerHTML = `P:${processes[i].name}`;
            periodLabel.style.color = '#0066cc';
            
            deadlineMarkers.appendChild(periodLabel);
            ganttChart.appendChild(periodMarker);
            
            period += processes[i].period;
        }
    }

    const legendContainer = document.createElement('div');
    legendContainer.className = 'gantt-legend';
    legendContainer.style.position = 'absolute';
    legendContainer.style.bottom = '-30px';
    legendContainer.style.display = 'flex';
    legendContainer.style.gap = '20px';
    
    const deadlineLegend = document.createElement('div');
    deadlineLegend.innerHTML = '<span style="color: #d00; font-weight: bold;">D:</span> Deadline';
    
    const periodLegend = document.createElement('div');
    periodLegend.innerHTML = '<span style="color: #0066cc; font-weight: bold;">P:</span> Period';
    
    const idleLegend = document.createElement('div');
    idleLegend.innerHTML = '<span style="color: #ccc; font-weight: bold;">■</span> Idle Time';
    
    const hoverLegend = document.createElement('div');
    hoverLegend.innerHTML = '<span style="font-style: italic;">Hover over process blocks for timing details</span>';
    
    legendContainer.appendChild(periodLegend);
    legendContainer.appendChild(deadlineLegend);
    legendContainer.appendChild(idleLegend);
    legendContainer.appendChild(hoverLegend);
    
    ganttChart.appendChild(legendContainer);
    

    for (const missed of missedDeadlines) {
        const missedMarker = document.createElement('div');
        missedMarker.className = 'missed-deadline-marker';
        missedMarker.style.left = `${missed.time * timeScale}px`;
        missedMarker.style.top = `${missed.row * 40 + 20}px`;
        missedMarker.innerHTML = '✗';
        
        ganttChart.appendChild(missedMarker);
    }
}

function getProcessColor(processName) {
    const colorMap = {
        'P1': '#88bde6', 
        'P2': '#bce08a', 
        'P3': '#fbd289', 
        'P4': '#e688b5', 
        'P5': '#a8d5ba', 
        'P6': '#d7ade8', 
        'P7': '#87c9c3', 
        'P8': '#f9c2c8', 
        'P9': '#b9d9f9', 
        'P10': '#e6e6e6' 
    };
    

    const baseMatch = processName.match(/[Pp](\d+)/);
    if (baseMatch) {
        const num = baseMatch[1];
        const key = `P${num}`;
        return colorMap[key] || '#dddddd';
    }
    
    return colorMap[processName.toUpperCase()] || '#dddddd';
}