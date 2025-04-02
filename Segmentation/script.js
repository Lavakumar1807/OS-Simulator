const MEMORY_SIZE = 256;
const SEGMENT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#073B4C', '#84A59D', '#F28482', '#8675A9', '#E07A5F'
];
let segments = [];
let usedMemory = 0;
let colorIndex = 0;
document.addEventListener('DOMContentLoaded', () => {
    const addSegmentBtn = document.getElementById('addSegmentBtn');
    const resetMemoryBtn = document.getElementById('resetMemoryBtn');
    const accessMemoryBtn = document.getElementById('accessMemoryBtn');
    updateMemoryInfo();
    addSegmentBtn.addEventListener('click', addSegment);
    resetMemoryBtn.addEventListener('click', resetMemory);
    accessMemoryBtn.addEventListener('click', simulateMemoryAccess);
});
function addSegment() {
    const nameInput = document.getElementById('segmentName');
    const sizeInput = document.getElementById('segmentSize');
    const name = nameInput.value.trim();
    const size = parseInt(sizeInput.value);
    if (!name) {
        showAlert('Please enter a segment name.');
        return;
    }
    if (isNaN(size) || size <= 0 || size > MEMORY_SIZE) {
        showAlert(`Please enter a valid size between 1 and ${MEMORY_SIZE}.`);
        return;
    }
    if (segments.some(seg => seg.name === name)) {
        showAlert('A segment with this name already exists.');
        return;
    }
    if (usedMemory + size > MEMORY_SIZE) {
        showAlert('Not enough memory available.');
        return;
    }
    const base = findBaseAddress(size);
    if (base === -1) {
        showAlert('Memory fragmentation issue. Cannot allocate segment.');
        return;
    }
    const segment = {
        name,
        base,
        limit: size,
        color: SEGMENT_COLORS[colorIndex % SEGMENT_COLORS.length]
    };
    segments.push(segment);
    colorIndex++;
    usedMemory += size;
    updateMemoryInfo();
    renderMemoryBlocks();
    updateSegmentTable();
    updateAccessDropdown();
    nameInput.value = '';
    sizeInput.value = '10';
    showAlert(`Segment '${name}' added successfully.`, 'success');
}
function findBaseAddress(size) {
    if (segments.length === 0) {
        return 0;
    }
    const sortedSegments = [...segments].sort((a, b) => a.base - b.base);
    if (sortedSegments[0].base >= size) {
        return 0;
    }
    for (let i = 0; i < sortedSegments.length - 1; i++) {
        const currentEnd = sortedSegments[i].base + sortedSegments[i].limit;
        const nextStart = sortedSegments[i + 1].base;
        const gap = nextStart - currentEnd;
        if (gap >= size) {
            return currentEnd;
        }
    }
    const lastSegment = sortedSegments[sortedSegments.length - 1];
    const endOfLastSegment = lastSegment.base + lastSegment.limit;
    if (MEMORY_SIZE - endOfLastSegment >= size) {
        return endOfLastSegment;
    }
    return -1;
}
function removeSegment(segmentName) {
    const index = segments.findIndex(segment => segment.name === segmentName);
    if (index !== -1) {
        usedMemory -= segments[index].limit;
        segments.splice(index, 1);
        updateMemoryInfo();
        renderMemoryBlocks();
        updateSegmentTable();
        updateAccessDropdown();
        showAlert(`Segment '${segmentName}' removed.`, 'success');
    }
}
function resetMemory() {
    segments = [];
    usedMemory = 0;
    colorIndex = 0;
    updateMemoryInfo();
    renderMemoryBlocks();
    updateSegmentTable();
    updateAccessDropdown();
    document.getElementById('accessResult').innerHTML = '';
    showAlert('Memory reset successfully.', 'success');
}
function simulateMemoryAccess() {
    const segmentSelect = document.getElementById('accessSegment');
    const offsetInput = document.getElementById('accessOffset');
    const resultContainer = document.getElementById('accessResult');
    const segmentName = segmentSelect.value;
    const offset = parseInt(offsetInput.value);
    if (!segmentName) {
        showAlert('Please select a segment.');
        return;
    }
    const segment = segments.find(seg => seg.name === segmentName);
    if (!segment) {
        resultContainer.innerHTML = '<p class="error">Segment not found.</p>';
        return;
    }
    if (isNaN(offset) || offset < 0) {
        resultContainer.innerHTML = '<p class="error">Invalid offset value.</p>';
        return;
    }
    if (offset >= segment.limit) {
        resultContainer.innerHTML = `
            <p class="error">Segmentation Fault: Offset (${offset}) exceeds segment limit (${segment.limit}).</p>
        `;
        return;
    }
    const physicalAddress = segment.base + offset;
    resultContainer.innerHTML = `
        <h3>Memory Access Result:</h3>
        <p>Logical Address: <strong>${segmentName}:${offset}</strong></p>
        <p>Physical Address: <strong>${physicalAddress} KB</strong></p>
        <p class="success">Memory access successful!</p>
    `;
    highlightMemoryAccess(segment, offset);
}
function highlightMemoryAccess(segment, offset) {
    const memoryVisualizer = document.getElementById('memoryVisualizer');
    const segmentElements = memoryVisualizer.getElementsByClassName('segment-block');
    for (let el of segmentElements) {
        el.classList.remove('accessing');
    }
    for (let el of segmentElements) {
        if (el.dataset.segmentName === segment.name) {
            el.classList.add('accessing');
            setTimeout(() => {
                el.classList.remove('accessing');
            }, 2000);
            break;
        }
    }
}
function updateMemoryInfo() {
    document.getElementById('totalMemory').textContent = MEMORY_SIZE;
    document.getElementById('usedMemory').textContent = usedMemory;
    document.getElementById('freeMemory').textContent = MEMORY_SIZE - usedMemory;
}
function renderMemoryBlocks() {
    const memoryVisualizer = document.getElementById('memoryVisualizer');
    memoryVisualizer.innerHTML = '';
    const freeSpaceBlock = document.createElement('div');
    freeSpaceBlock.className = 'free-space';
    freeSpaceBlock.style.height = '100%';
    memoryVisualizer.appendChild(freeSpaceBlock);
    segments.forEach(segment => {
        const segmentBlock = document.createElement('div');
        segmentBlock.className = 'segment-block';
        segmentBlock.dataset.segmentName = segment.name;
        segmentBlock.style.backgroundColor = segment.color;
        segmentBlock.style.height = `${(segment.limit / MEMORY_SIZE) * 100}%`;
        segmentBlock.style.bottom = `${(segment.base / MEMORY_SIZE) * 100}%`;
        const segmentLabel = document.createElement('div');
        segmentLabel.className = 'segment-label';
        segmentLabel.textContent = `${segment.name} (${segment.limit}KB)`;
        segmentBlock.appendChild(segmentLabel);
        memoryVisualizer.appendChild(segmentBlock);
    });
}
function updateSegmentTable() {
    const tableBody = document.getElementById('segmentTableBody');
    tableBody.innerHTML = '';
    if (segments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3" class="empty-table">No segments added yet</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    segments.forEach(segment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="segment-color" style="background-color: ${segment.color}"></span>
                ${segment.name}
            </td>
            <td>${segment.base} KB</td>
            <td>${segment.limit} KB</td>
            <td>
                <button class="remove-btn" data-segment="${segment.name}">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const segmentName = e.target.dataset.segment;
            removeSegment(segmentName);
        });
    });
}
function updateAccessDropdown() {
    const accessSegment = document.getElementById('accessSegment');
    const currentValue = accessSegment.value;
    accessSegment.innerHTML = '<option value="">Select a segment</option>';
    segments.forEach(segment => {
        const option = document.createElement('option');
        option.value = segment.name;
        option.textContent = segment.name;
        accessSegment.appendChild(option);
    });
    if (currentValue && segments.some(seg => seg.name === currentValue)) {
        accessSegment.value = currentValue;
    }
}
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 500);
    }, 3000);
}