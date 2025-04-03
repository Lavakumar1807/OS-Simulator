document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const numBlocksInput = document.getElementById('num-blocks');
    const setBlocksBtn = document.getElementById('set-blocks');
    const blockSizesContainer = document.getElementById('block-sizes-container');
    const blockSizesInputs = document.getElementById('block-sizes-inputs');
    const confirmBlocksBtn = document.getElementById('confirm-blocks');
    
    const processInput = document.getElementById('process-input');
    const numProcessesInput = document.getElementById('num-processes');
    const setProcessesBtn = document.getElementById('set-processes');
    const processSizesContainer = document.getElementById('process-sizes-container');
    const processSizesInputs = document.getElementById('process-sizes-inputs');
    const confirmProcessesBtn = document.getElementById('confirm-processes');
    
    const allocationMethodDiv = document.getElementById('allocation-method');
    const methodBtns = document.querySelectorAll('.method-btn');
    
    const resultsCard = document.getElementById('results-card');
    const usedMethodSpan = document.getElementById('used-method');
    const selectedMethodDescription = document.getElementById('selected-method-description');
    const memoryBlocksDiv = document.getElementById('memory-blocks');
    const allocationResults = document.getElementById('allocation-results');
    const allocationSummary = document.getElementById('allocation-summary');
    const backBtn = document.getElementById('back-btn');
    const resetBtn = document.querySelectorAll('#reset-btn');
    
    // Method descriptions
    const methodDescriptions = {
        'first-fit': `
            <h3>First Fit</h3>
            <p>Allocates the process to the first sufficient block from the top of Main Memory. It scans memory from the beginning and chooses the first available block that is large enough.</p>
            <p><strong>Advantages:</strong> Quick, efficient, less computational work</p>
            <p><strong>Disadvantages:</strong> Risk of memory fragmentation</p>
        `,
        'best-fit': `
            <h3>Best Fit</h3>
            <p>Allocates the process to the partition which is the first smallest sufficient partition among the free available partitions. It searches the entire list of holes to find the smallest hole whose size is greater than or equal to the size of the process.</p>
            <p><strong>Advantages:</strong> Minimizes memory waste, allocates smallest suitable partition</p>
            <p><strong>Disadvantages:</strong> More computational overhead to find smallest partition</p>
        `,
        'worst-fit': `
            <h3>Worst Fit</h3>
            <p>Allocates the process to the partition which is the largest sufficient among the freely available partitions available in the main memory. It searches the entire list of holes to find the largest hole and allocate it to process.</p>
            <p><strong>Advantages:</strong> Ensures larger processes have sufficient memory</p>
            <p><strong>Disadvantages:</strong> May result in substantial memory waste</p>
        `,
        'next-fit': `
            <h3>Next Fit</h3>
            <p>Next fit is similar to the first fit but it will search for the first sufficient partition from the last allocation point rather than starting from the beginning each time.</p>
            <p><strong>Advantages:</strong> More efficient than First Fit in some cases, avoids beginning fragmentation</p>
            <p><strong>Disadvantages:</strong> May still lead to fragmentation in later blocks</p>
        `
    };
    
    // State variables
    let memoryBlocks = [];
    let processes = [];
    let lastAllocatedIndex = 0; // For Next Fit algorithm
    
    // Event Listeners
    setBlocksBtn.addEventListener('click', setupBlockInputs);
    confirmBlocksBtn.addEventListener('click', confirmBlocks);
    setProcessesBtn.addEventListener('click', setupProcessInputs);
    confirmProcessesBtn.addEventListener('click', confirmProcesses);
    
    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.getAttribute('data-method');
            simulateAllocation(method);
        });
    });
    
    backBtn.addEventListener('click', resetSimulation);
    
    // Add reset functionality to all reset buttons
    resetBtn.forEach(btn => {
        btn.addEventListener('click', fullReset);
    });
    
    // Functions
    function setupBlockInputs() {
        const numBlocks = parseInt(numBlocksInput.value);
        
        if (numBlocks <= 0 || isNaN(numBlocks)) {
            alert('Please enter a valid number of blocks');
            return;
        }
        
        blockSizesInputs.innerHTML = '';
        
        for (let i = 0; i < numBlocks; i++) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'dynamic-input';
            
            inputDiv.innerHTML = `
                <span class="block-label">Block ${i + 1}:</span>
                <input type="number" class="block-size" min="1" placeholder="Size in KB" required>
            `;
            
            blockSizesInputs.appendChild(inputDiv);
        }
        
        blockSizesContainer.classList.remove('hidden');
    }
    
    function confirmBlocks() {
        const blockSizeInputs = document.querySelectorAll('.block-size');
        memoryBlocks = [];
        
        let allValid = true;
        
        blockSizeInputs.forEach((input, index) => {
            const size = parseInt(input.value);
            if (size <= 0 || isNaN(size)) {
                alert(`Please enter a valid size for Block ${index + 1}`);
                allValid = false;
                return;
            }
            
            memoryBlocks.push({
                id: index + 1,
                originalSize: size,
                remainingSize: size,
                allocations: []
            });
        });
        
        if (allValid) {
            processInput.classList.remove('hidden');
        }
    }
    
    function setupProcessInputs() {
        const numProcesses = parseInt(numProcessesInput.value);
        
        if (numProcesses <= 0 || isNaN(numProcesses)) {
            alert('Please enter a valid number of processes');
            return;
        }
        
        processSizesInputs.innerHTML = '';
        
        for (let i = 0; i < numProcesses; i++) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'dynamic-input';
            
            inputDiv.innerHTML = `
                <span class="process-label">Process ${i + 1}:</span>
                <input type="number" class="process-size" min="1" placeholder="Size in KB" required>
            `;
            
            processSizesInputs.appendChild(inputDiv);
        }
        
        processSizesContainer.classList.remove('hidden');
    }
    
    function confirmProcesses() {
        const processSizeInputs = document.querySelectorAll('.process-size');
        processes = [];
        
        let allValid = true;
        
        processSizeInputs.forEach((input, index) => {
            const size = parseInt(input.value);
            if (size <= 0 || isNaN(size)) {
                alert(`Please enter a valid size for Process ${index + 1}`);
                allValid = false;
                return;
            }
            
            processes.push({
                id: index + 1,
                size: size,
                allocated: false,
                blockId: null
            });
        });
        
        if (allValid) {
            allocationMethodDiv.classList.remove('hidden');
        }
    }
    
    function simulateAllocation(method) {
        // Reset the previous allocation state
        resetAllocationState();
        
        // Clone the memory blocks to avoid modifying the original
        const blocks = JSON.parse(JSON.stringify(memoryBlocks));
        const procs = JSON.parse(JSON.stringify(processes));
        
        // Apply the selected allocation method
        switch(method) {
            case 'first-fit':
                firstFit(blocks, procs);
                usedMethodSpan.textContent = 'First Fit';
                break;
            case 'best-fit':
                bestFit(blocks, procs);
                usedMethodSpan.textContent = 'Best Fit';
                break;
            case 'worst-fit':
                worstFit(blocks, procs);
                usedMethodSpan.textContent = 'Worst Fit';
                break;
            case 'next-fit':
                nextFit(blocks, procs);
                usedMethodSpan.textContent = 'Next Fit';
                break;
        }
        
        // Display the method description
        selectedMethodDescription.innerHTML = methodDescriptions[method];
        
        // Display the results
        displayResults(blocks, procs);
        
        // Show results card and hide input card
        document.getElementById('input-card').classList.add('hidden');
        resultsCard.classList.remove('hidden');
    }
    
    function resetAllocationState() {
        // Reset last allocated index for Next Fit
        lastAllocatedIndex = 0;
    }
    
    function firstFit(blocks, processes) {
        processes.forEach(process => {
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].remainingSize >= process.size) {
                    allocateProcess(blocks[i], process);
                    break;
                }
            }
        });
    }
    
    function bestFit(blocks, processes) {
        processes.forEach(process => {
            let bestFitIndex = -1;
            let bestFitSize = Infinity;
            
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].remainingSize >= process.size) {
                    // Find the block with the smallest sufficient space
                    if (blocks[i].remainingSize < bestFitSize) {
                        bestFitIndex = i;
                        bestFitSize = blocks[i].remainingSize;
                    }
                }
            }
            
            if (bestFitIndex !== -1) {
                allocateProcess(blocks[bestFitIndex], process);
            }
        });
    }
    
    function worstFit(blocks, processes) {
        processes.forEach(process => {
            let worstFitIndex = -1;
            let worstFitSize = -1;
            
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].remainingSize >= process.size) {
                    // Find the block with the largest sufficient space
                    if (blocks[i].remainingSize > worstFitSize) {
                        worstFitIndex = i;
                        worstFitSize = blocks[i].remainingSize;
                    }
                }
            }
            
            if (worstFitIndex !== -1) {
                allocateProcess(blocks[worstFitIndex], process);
            }
        });
    }
    
    function nextFit(blocks, processes) {
        processes.forEach(process => {
            let count = 0;
            let index = lastAllocatedIndex;
            
            // Keep searching until we've checked all blocks once
            while (count < blocks.length) {
                if (blocks[index].remainingSize >= process.size) {
                    allocateProcess(blocks[index], process);
                    lastAllocatedIndex = (index + 1) % blocks.length;
                    break;
                }
                
                index = (index + 1) % blocks.length;
                count++;
            }
        });
    }
    
    function allocateProcess(block, process) {
        // Create allocation record
        const allocation = {
            processId: process.id,
            processSize: process.size,
            fragmentationSize: block.remainingSize - process.size
        };
        
        // Add to block's allocations
        block.allocations.push(allocation);
        
        // Update remaining size in the block
        block.remainingSize -= process.size;
        
        // Update process allocation status
        process.allocated = true;
        process.blockId = block.id;
    }
    
    function displayResults(blocks, processes) {
        // Display memory blocks visualization
        displayMemoryBlocks(blocks);
        
        // Display allocation table
        displayAllocationTable(processes, blocks);
        
        // Display allocation summary
        displaySummary(processes, blocks);
    }
    
    function displayMemoryBlocks(blocks) {
        memoryBlocksDiv.innerHTML = '';
        
        blocks.forEach(block => {
            const blockDiv = document.createElement('div');
            blockDiv.className = 'memory-block';
            
            const blockHeader = document.createElement('div');
            blockHeader.className = 'block-header';
            blockHeader.innerHTML = `
                <span>Block ${block.id}</span>
                <span>${block.originalSize} KB</span>
            `;
            
            const blockContent = document.createElement('div');
            blockContent.className = 'block-content';
            
            if (block.allocations.length > 0) {
                // Calculate the position and size for each allocation
                let usedSpace = 0;
                
                block.allocations.forEach(allocation => {
                    const processWidth = (allocation.processSize / block.originalSize) * 100;
                    
                    const processDiv = document.createElement('div');
                    processDiv.className = 'process-allocation';
                    processDiv.style.width = `${processWidth}%`;
                    processDiv.style.left = `${usedSpace}%`;
                    processDiv.style.backgroundColor = '#3498db';
                    processDiv.textContent = `P${allocation.processId} (${allocation.processSize} KB)`;
                    
                    blockContent.appendChild(processDiv);
                    
                    usedSpace += processWidth;
                });
                
                // Add fragmentation visualization if any space is left
                if (block.remainingSize > 0) {
                    const fragWidth = (block.remainingSize / block.originalSize) * 100;
                    
                    const fragDiv = document.createElement('div');
                    fragDiv.className = 'process-allocation';
                    fragDiv.style.width = `${fragWidth}%`;
                    fragDiv.style.left = `${usedSpace}%`;
                    fragDiv.style.backgroundColor = '#e74c3c';
                    fragDiv.textContent = `Free (${block.remainingSize} KB)`;
                    
                    blockContent.appendChild(fragDiv);
                }
            } else {
                blockContent.textContent = 'Free';
            }
            
            blockDiv.appendChild(blockHeader);
            blockDiv.appendChild(blockContent);
            memoryBlocksDiv.appendChild(blockDiv);
        });
    }
    
    function displayAllocationTable(processes, blocks) {
        allocationResults.innerHTML = '';
        
        processes.forEach(process => {
            const row = document.createElement('tr');
            
            let blockAllocated = process.allocated ? process.blockId : '-';
            let internalFragmentation = '-';
            
            // If process is allocated, find the corresponding allocation
            if (process.allocated) {
                const block = blocks.find(b => b.id === process.blockId);
                const allocation = block.allocations.find(a => a.processId === process.id);
                
                if (allocation) {
                    internalFragmentation = allocation.fragmentationSize > 0 ? 
                        `${allocation.fragmentationSize} KB` : '0 KB';
                }
            }
            
            let status = process.allocated ? 
                '<span class="status-allocated">Allocated</span>' : 
                '<span class="status-not-allocated">Not Allocated</span>';
            
            row.innerHTML = `
                <td>Process ${process.id}</td>
                <td>${process.size} KB</td>
                <td>${blockAllocated}</td>
                <td>${internalFragmentation}</td>
                <td>${status}</td>
            `;
            
            allocationResults.appendChild(row);
        });
    }
    
    function displaySummary(processes, blocks) {
        const allocatedProcesses = processes.filter(p => p.allocated).length;
        const unallocatedProcesses = processes.length - allocatedProcesses;
        
        // Calculate total memory stats
        const totalMemory = blocks.reduce((acc, block) => acc + block.originalSize, 0);
        
        // Calculate used memory by summing up all process sizes that got allocated
        const usedMemory = processes
            .filter(p => p.allocated)
            .reduce((acc, p) => acc + p.size, 0);
        
        // Calculate total remaining space in all blocks
        const totalRemainingSpace = blocks.reduce((acc, block) => acc + block.remainingSize, 0);
        
        // Memory utilization percentage
        const memoryUtilization = ((usedMemory / totalMemory) * 100).toFixed(2);
        
        // Calculate internal fragmentation
        // Fragmentation in this case is the sum of all remainingSize values that are too small to fit any unallocated process
        let wastedMemory = 0;
        
        blocks.forEach(block => {
            if (block.remainingSize > 0) {
                // Check if this remaining space is too small for any unallocated process
                const smallestUnallocatedProcess = processes
                    .filter(p => !p.allocated)
                    .reduce((smallest, p) => p.size < smallest ? p.size : smallest, Infinity);
                
                if (block.remainingSize < smallestUnallocatedProcess || smallestUnallocatedProcess === Infinity) {
                    wastedMemory += block.remainingSize;
                }
            }
        });
        
        allocationSummary.innerHTML = `
            <div class="summary-item">
                <h4>Processes</h4>
                <p>Total: ${processes.length}</p>
                <p>Allocated: ${allocatedProcesses}</p>
                <p>Not Allocated: ${unallocatedProcesses}</p>
            </div>
            <div class="summary-item">
                <h4>Memory</h4>
                <p>Total Memory: ${totalMemory} KB</p>
                <p>Used Memory: ${usedMemory} KB</p>
                <p>Utilization: ${memoryUtilization}%</p>
            </div>
            <div class="summary-item">
                <h4>Fragmentation</h4>
                <p>Remaining Space: ${totalRemainingSpace} KB</p>
                <p>Wasted Memory: ${wastedMemory} KB</p>
            </div>
        `;
    }
    
    function resetSimulation() {
        // Reset allocation state
        resetAllocationState();
        
        // Show input card, hide results card
        document.getElementById('input-card').classList.remove('hidden');
        resultsCard.classList.add('hidden');
    }
    
    function fullReset() {
        // Reset all inputs to default values
        numBlocksInput.value = '3';
        numProcessesInput.value = '4';
        
        // Clear all input containers
        blockSizesInputs.innerHTML = '';
        processSizesInputs.innerHTML = '';
        
        // Reset all state variables
        memoryBlocks = [];
        processes = [];
        lastAllocatedIndex = 0;
        
        // Hide all sections except the initial one
        blockSizesContainer.classList.add('hidden');
        processInput.classList.add('hidden');
        processSizesContainer.classList.add('hidden');
        allocationMethodDiv.classList.add('hidden');
        resultsCard.classList.add('hidden');
        
        // Show the input card
        document.getElementById('input-card').classList.remove('hidden');
    }
});