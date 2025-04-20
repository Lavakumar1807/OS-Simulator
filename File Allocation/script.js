// Global variables
let memoryGrid = [];
let files = [];
let darkTheme = false;

// DOM Elements
const grid = document.getElementById('memoryGrid');
const simulateBtn = document.getElementById('simulateBtn');
const allocationType = document.getElementById('allocationType');
const fileNameInput = document.getElementById('fileName');
const fileSizeInput = document.getElementById('fileSize');
const animationSpeed = document.getElementById('animationSpeed');
const totalBlocksDisplay = document.getElementById('totalBlocks');
const usedBlocksDisplay = document.getElementById('usedBlocks');
const freeBlocksDisplay = document.getElementById('freeBlocks');
const fileCountDisplay = document.getElementById('fileCount');
const historyLog = document.getElementById('historyLog');
const exportHistoryBtn = document.getElementById('exportHistory');
const themeToggleBtn = document.getElementById('themeToggle');
const outputMessage = document.getElementById('outputMessage');

// Initialize the simulator
document.addEventListener('DOMContentLoaded', function() {
    initializeGrid();
    attachEventListeners();
    updateStats();
});

// Initialize memory grid
function initializeGrid() {
    const gridSizeElement = document.getElementById('gridSize');
    const totalBlocks = parseInt(gridSizeElement.value);
    const rowSize = Math.sqrt(totalBlocks);
    
    // Clear existing grid
    grid.innerHTML = '';
    memoryGrid = [];
    
    // Create memory blocks
    for (let i = 0; i < totalBlocks; i++) {
        const block = document.createElement('div');
        block.className = 'memory-block';
        block.setAttribute('data-index', i);
        
        if (document.getElementById('showBlockNumbers').checked) {
            block.textContent = i;
        }
        
        block.addEventListener('click', () => inspectBlock(i));
        grid.appendChild(block);
        
        // Initialize memory block data
        memoryGrid.push({
            index: i,
            allocated: false,
            fileId: null,
            blockType: null,
            nextBlock: null,
            data: null
        });
    }
    
    // Update grid template columns based on row size
    grid.style.gridTemplateColumns = `repeat(${rowSize}, 1fr)`;
    
    // Update stats
    totalBlocksDisplay.textContent = totalBlocks;
    updateStats();
}

// Attach event listeners
function attachEventListeners() {
    // Simulate button
    simulateBtn.addEventListener('click', simulateAllocation);
    
    // Export history button
    exportHistoryBtn.addEventListener('click', exportAllocationHistory);
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Resize grid when changed
    document.getElementById('gridSize').addEventListener('change', resizeGrid);
    
    // Block size adjustment
    document.getElementById('blockSize').addEventListener('change', adjustBlockSize);
    
    // Show/hide block numbers
    document.getElementById('showBlockNumbers').addEventListener('change', toggleBlockNumbers);
}

// Simulate file allocation
function simulateAllocation() {
    const fileName = fileNameInput.value || `File-${files.length + 1}`;
    const fileSize = parseInt(fileSizeInput.value);
    const strategy = allocationType.value;
    
    // Validate input
    if (!fileSize || fileSize <= 0 || fileSize > memoryGrid.length) {
        showMessage('Please enter a valid file size', 'error');
        return;
    }
    
    // Check if there's enough free space
    const freeBlocks = memoryGrid.filter(block => !block.allocated).length;
    
    if (fileSize > freeBlocks) {
        showMessage(`Not enough free space. Need ${fileSize} blocks, but only ${freeBlocks} available.`, 'error');
        return;
    }
    
    // Create file object
    const fileId = files.length;
    const file = {
        id: fileId,
        name: fileName,
        size: fileSize,
        strategy: strategy,
        blocks: []
    };
    
    // Allocate based on selected strategy
    if (strategy === 'contiguous') {
        allocateContiguous(file);
    } else if (strategy === 'linked') {
        allocateLinked(file);
    } else if (strategy === 'indexed') {
        allocateIndexed(file);
    }
}

// Contiguous allocation strategy
function allocateContiguous(file) {
    // Find a contiguous sequence of free blocks
    let startIndex = -1;
    let currentLength = 0;
    
    for (let i = 0; i < memoryGrid.length; i++) {
        if (!memoryGrid[i].allocated) {
            // This is a free block
            if (currentLength === 0) {
                // Start of a new sequence
                startIndex = i;
            }
            currentLength++;
            
            // Check if we found enough blocks
            if (currentLength === file.size) {
                break;
            }
        } else {
            // Reset the sequence
            startIndex = -1;
            currentLength = 0;
        }
    }
    
    // Check if we found a suitable contiguous sequence
    if (currentLength < file.size) {
        showMessage('Cannot allocate contiguously. Try defragmenting or use another strategy.', 'warning');
        return;
    }
    
    // Allocate the blocks with animation
    const speed = getAnimationSpeed();
    
    for (let i = 0; i < file.size; i++) {
        const blockIndex = startIndex + i;
        
        // Add animation delay
        setTimeout(() => {
            // Update memory grid
            memoryGrid[blockIndex].allocated = true;
            memoryGrid[blockIndex].fileId = file.id;
            memoryGrid[blockIndex].blockType = 'contiguous';
            memoryGrid[blockIndex].data = `${file.name} - Block ${i+1}/${file.size}`;
            
            // Update UI
            const blockElement = document.querySelector(`.memory-block[data-index="${blockIndex}"]`);
            blockElement.classList.add('contiguous', 'allocating');
            
            // Add to file's blocks
            file.blocks.push(blockIndex);
            
            // If this is the last block, update stats and add to files array
            if (i === file.size - 1) {
                files.push(file);
                updateStats();
                addHistoryEntry(`Allocated "${file.name}" using contiguous allocation at blocks ${startIndex}-${startIndex + file.size - 1}`);
                showMessage(`Successfully allocated "${file.name}" using contiguous allocation.`, 'success');
            }
        }, i * speed);
    }
}

// Linked allocation strategy
function allocateLinked(file) {
    const freeBlockIndices = [];
    
    // Get all free blocks
    for (let i = 0; i < memoryGrid.length; i++) {
        if (!memoryGrid[i].allocated) {
            freeBlockIndices.push(i);
        }
    }
    
    // Check if we have enough blocks
    if (freeBlockIndices.length < file.size) {
        showMessage('Not enough free blocks available.', 'error');
        return;
    }
    
    // Randomly select blocks for linked allocation
    const selectedBlocks = [];
    for (let i = 0; i < file.size; i++) {
        const randomIndex = Math.floor(Math.random() * freeBlockIndices.length);
        selectedBlocks.push(freeBlockIndices[randomIndex]);
        freeBlockIndices.splice(randomIndex, 1);
    }
    
    // Allocate the blocks with animation
    const speed = getAnimationSpeed();
    
    for (let i = 0; i < selectedBlocks.length; i++) {
        const blockIndex = selectedBlocks[i];
        
        setTimeout(() => {
            // Update memory grid
            memoryGrid[blockIndex].allocated = true;
            memoryGrid[blockIndex].fileId = file.id;
            memoryGrid[blockIndex].blockType = 'linked';
            memoryGrid[blockIndex].data = `${file.name} - Block ${i+1}/${file.size}`;
            
            // Set the next block pointer (except for the last block)
            if (i < selectedBlocks.length - 1) {
                memoryGrid[blockIndex].nextBlock = selectedBlocks[i + 1];
            } else {
                memoryGrid[blockIndex].nextBlock = null; // End of file
            }
            
            // Update UI
            const blockElement = document.querySelector(`.memory-block[data-index="${blockIndex}"]`);
            blockElement.classList.add('linked', 'allocating');
            
            // Add to file's blocks
            file.blocks.push(blockIndex);
            
            // If this is the last block, update stats and add to files array
            if (i === file.size - 1) {
                files.push(file);
                updateStats();
                addHistoryEntry(`Allocated "${file.name}" using linked allocation at blocks ${selectedBlocks.join(', ')}`);
                showMessage(`Successfully allocated "${file.name}" using linked allocation.`, 'success');
            }
        }, i * speed);
    }
}

// Indexed allocation strategy
function allocateIndexed(file) {
    const freeBlockIndices = [];
    
    // Get all free blocks
    for (let i = 0; i < memoryGrid.length; i++) {
        if (!memoryGrid[i].allocated) {
            freeBlockIndices.push(i);
        }
    }
    
    // Check if we have enough blocks (need one extra for the index block)
    if (freeBlockIndices.length < file.size + 1) {
        showMessage('Not enough free blocks available including index block.', 'error');
        return;
    }
    
    // Randomly select blocks for indexed allocation
    const selectedBlocks = [];
    for (let i = 0; i < file.size + 1; i++) { // +1 for the index block
        const randomIndex = Math.floor(Math.random() * freeBlockIndices.length);
        selectedBlocks.push(freeBlockIndices[randomIndex]);
        freeBlockIndices.splice(randomIndex, 1);
    }
    
    // The first block is the index block
    const indexBlockIndex = selectedBlocks[0];
    const dataBlocks = selectedBlocks.slice(1);
    
    // Allocate the blocks with animation
    const speed = getAnimationSpeed();
    
    // First, allocate the index block
    setTimeout(() => {
        // Update memory grid for index block
        memoryGrid[indexBlockIndex].allocated = true;
        memoryGrid[indexBlockIndex].fileId = file.id;
        memoryGrid[indexBlockIndex].blockType = 'indexed';
        memoryGrid[indexBlockIndex].data = `${file.name} - Index Block`;
        memoryGrid[indexBlockIndex].indexPointers = dataBlocks; // Store pointers to all data blocks
        
        // Update UI
        const blockElement = document.querySelector(`.memory-block[data-index="${indexBlockIndex}"]`);
        blockElement.classList.add('indexed', 'allocating');
        
        // Add to file's blocks
        file.blocks.push(indexBlockIndex);
        file.indexBlock = indexBlockIndex;
    }, 0);
    
    // Then allocate data blocks
    for (let i = 0; i < dataBlocks.length; i++) {
        const blockIndex = dataBlocks[i];
        
        setTimeout(() => {
            // Update memory grid for data block
            memoryGrid[blockIndex].allocated = true;
            memoryGrid[blockIndex].fileId = file.id;
            memoryGrid[blockIndex].blockType = 'indexed';
            memoryGrid[blockIndex].data = `${file.name} - Block ${i+1}/${file.size}`;
            
            // Update UI
            const blockElement = document.querySelector(`.memory-block[data-index="${blockIndex}"]`);
            blockElement.classList.add('indexed', 'allocating');
            
            // Add to file's blocks
            file.blocks.push(blockIndex);
            
            // If this is the last block, update stats and add to files array
            if (i === dataBlocks.length - 1) {
                files.push(file);
                updateStats();
                addHistoryEntry(`Allocated "${file.name}" using indexed allocation with index at block ${indexBlockIndex}`);
                showMessage(`Successfully allocated "${file.name}" using indexed allocation.`, 'success');
            }
        }, (i + 1) * speed); // Start after index block (i + 1)
    }
}

// Update memory statistics display
function updateStats() {
    const totalBlocks = memoryGrid.length;
    const usedBlocks = memoryGrid.filter(block => block.allocated).length;
    const freeBlocks = totalBlocks - usedBlocks;
    
    totalBlocksDisplay.textContent = totalBlocks;
    usedBlocksDisplay.textContent = usedBlocks;
    freeBlocksDisplay.textContent = freeBlocks;
    fileCountDisplay.textContent = files.length;
}

// Add entry to allocation history log
function addHistoryEntry(message) {
    const entry = document.createElement('p');
    entry.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    historyLog.appendChild(entry);
    
    // Scroll to bottom of history log
    historyLog.scrollTop = historyLog.scrollHeight;
}

// Export allocation history
function exportAllocationHistory() {
    if (historyLog.innerText.trim() === '') {
        showMessage('No history to export.', 'warning');
        return;
    }
    
    // Create a text file
    const historyText = historyLog.innerText;
    const blob = new Blob([historyText], { type: 'text/plain' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'allocation_history.txt';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('History exported successfully.', 'success');
}

// Inspect block details (for modal)
function inspectBlock(index) {
    const block = memoryGrid[index];
    const blockDetails = document.getElementById('blockDetails');
    
    let detailsHTML = `<p><strong>Block Index:</strong> ${block.index}</p>`;
    detailsHTML += `<p><strong>Status:</strong> ${block.allocated ? 'Allocated' : 'Free'}</p>`;
    
    if (block.allocated) {
        const file = files.find(f => f.id === block.fileId);
        detailsHTML += `<p><strong>File Name:</strong> ${file ? file.name : 'Unknown'}</p>`;
        detailsHTML += `<p><strong>Allocation Type:</strong> ${block.blockType}</p>`;
        
        if (block.blockType === 'linked' && block.nextBlock !== null) {
            detailsHTML += `<p><strong>Next Block:</strong> ${block.nextBlock}</p>`;
        }
        
        if (block.blockType === 'indexed' && block.indexPointers) {
            detailsHTML += `<p><strong>Index Block:</strong> Yes</p>`;
            detailsHTML += `<p><strong>Points to:</strong> ${block.indexPointers.join(', ')}</p>`;
        }
        
        detailsHTML += `<p><strong>Data:</strong> ${block.data || 'No data'}</p>`;
    }
    
    blockDetails.innerHTML = detailsHTML;
    openInspector();
}

// Resize memory grid
function resizeGrid() {
    // Reset files and reallocate grid
    files = [];
    initializeGrid();
    addHistoryEntry('Memory grid has been resized and reset.');
    showMessage('Memory grid has been resized and reset.', 'info');
}

// Reset memory grid
function resetGrid() {
    // Confirm with user
    if (files.length > 0 && !confirm('This will clear all allocated files. Continue?')) {
        return;
    }
    
    // Reset files and grid
    files = [];
    initializeGrid();
    addHistoryEntry('Memory grid has been reset.');
    showMessage('Memory grid has been reset.', 'info');
}

// Adjust block size
function adjustBlockSize() {
    const blockSize = document.getElementById('blockSize').value;
    const gridElement = document.getElementById('memoryGrid');
    
    // Remove existing size classes
    gridElement.classList.remove('small-blocks', 'medium-blocks', 'large-blocks');
    
    // Add appropriate class
    gridElement.classList.add(`${blockSize}-blocks`);
    
    showMessage(`Block size changed to ${blockSize}.`, 'info');
}

// Toggle block numbers
function toggleBlockNumbers() {
    const showNumbers = document.getElementById('showBlockNumbers').checked;
    const blocks = document.querySelectorAll('.memory-block');
    
    blocks.forEach((block, index) => {
        if (showNumbers) {
            block.textContent = index;
        } else {
            block.textContent = '';
        }
    });
}

// Toggle dark/light theme
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggle i');
    
    darkTheme = !darkTheme;
    
    if (darkTheme) {
        document.documentElement.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
    } else {
        document.documentElement.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
    }
    
    showMessage(`Theme switched to ${darkTheme ? 'dark' : 'light'} mode.`, 'info');
}

// Show message in the output section
function showMessage(message, type = 'info') {
    const messageCard = outputMessage.querySelector('.message-card');
    const messageIcon = outputMessage.querySelector('.message-icon');
    const messageText = outputMessage.querySelector('p');
    
    // Remove existing classes
    messageCard.className = 'message-card';
    
    // Add appropriate class based on message type
    messageCard.classList.add(type);
    
    // Update icon
    if (type === 'success') {
        messageIcon.className = 'fas fa-check-circle message-icon';
    } else if (type === 'warning') {
        messageIcon.className = 'fas fa-exclamation-triangle message-icon';
    } else if (type === 'error') {
        messageIcon.className = 'fas fa-times-circle message-icon';
    } else {
        messageIcon.className = 'fas fa-info-circle message-icon';
    }
    
    // Update message text
    messageText.textContent = message;
    
    // Add animation
    messageCard.classList.add('pulse');
    setTimeout(() => {
        messageCard.classList.remove('pulse');
    }, 1500);
}

// Get animation speed based on user selection
function getAnimationSpeed() {
    const speed = animationSpeed.value;
    if (speed === 'fast') return 100;
    if (speed === 'slow') return 500;
    return 300; // medium (default)
}

// Modal functions
function openInspector() {
    document.getElementById('inspectorModal').style.display = 'block';
}

function closeInspector() {
    document.getElementById('inspectorModal').style.display = 'none';
}

function openHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

function openAbout() {
    document.getElementById('aboutModal').style.display = 'block';
}

function closeAbout() {
    document.getElementById('aboutModal').style.display = 'none';
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Close modals when clicking outside of them
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
};