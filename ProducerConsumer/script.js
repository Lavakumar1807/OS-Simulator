document.addEventListener('DOMContentLoaded', () => {
    // Simulation elements
    const bufferSizeInput = document.getElementById('buffer-size');
    const addProducerBtn = document.getElementById('add-producer');
    const addConsumerBtn = document.getElementById('add-consumer');
    const startSimBtn = document.getElementById('start-sim');
    const pauseSimBtn = document.getElementById('pause-sim');
    const resetSimBtn = document.getElementById('reset-sim');
    const producerList = document.getElementById('producer-list');
    const consumerList = document.getElementById('consumer-list');
    const bufferContainer = document.getElementById('buffer');
    const bufferUsedSpan = document.getElementById('buffer-used');
    const bufferTotalSpan = document.getElementById('buffer-total');
    const logContainer = document.getElementById('log');

    // Simulation state
    let simulationRunning = false;
    let producers = [];
    let consumers = [];
    let buffer = [];
    let ProducerEntity = 1;
    let ConsumerEntity = 1;
    let nextItemId = 1;

    // Semaphores (implemented as simple counters for visualization)
    let mutex = 1; // Controls access to critical section (buffer)
    let empty; // Counts empty buffer slots
    let full = 0; // Counts filled buffer slots

    // Initialize the simulation
    function initSimulation() {
        // Clear existing entities
        producers.forEach(producer => {
            if (producer.interval) {
                clearInterval(producer.interval);
            }
        });
        
        consumers.forEach(consumer => {
            if (consumer.interval) {
                clearInterval(consumer.interval);
            }
        });
        
        producers = [];
        consumers = [];
        ProducerEntity = 1;
        ConsumerEntity = 1;
        producerList.innerHTML = '';
        consumerList.innerHTML = '';
        
        // Initialize buffer based on user input
        const bufferSize = parseInt(bufferSizeInput.value) || 5;
        buffer = new Array(bufferSize).fill(null);
        empty = bufferSize;
        full = 0;
        nextItemId = 1;
        
        // Update UI
        updateBufferUI();
        bufferTotalSpan.textContent = bufferSize;
        bufferUsedSpan.textContent = '0';
        
        // Enable/disable buttons
        startSimBtn.disabled = false;
        pauseSimBtn.disabled = true;
        
        // Add initial log entry
        addLogEntry('system', 'Simulation initialized with buffer size: ' + bufferSize);
        
        // Add initial producer and consumer automatically
        addProducer();
        addConsumer();
    }

    // Create buffer UI elements
    function updateBufferUI() {
        bufferContainer.innerHTML = '';
        buffer.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'buffer-slot';
            if (item !== null) {
                slot.classList.add('filled');
                slot.textContent = item;
            }
            slot.dataset.index = index;
            bufferContainer.appendChild(slot);
        });
        bufferUsedSpan.textContent = buffer.filter(item => item !== null).length;
    }

    // Add a producer to the simulation
    function addProducer() {
        const producer = {
            id: ProducerEntity++,
            active: false,
            interval: null,
            element: null
        };
        
        producers.push(producer);
        
        // Create UI element for producer
        const producerElement = document.createElement('div');
        producerElement.className = 'entity producer';
        producerElement.innerHTML = `
            <div class="entity-info">
                <span>Producer ${producer.id}</span>
                <span class="status">Idle</span>
            </div>
            <div class="entity-controls">
                <button class="remove-btn">Remove</button>
            </div>
        `;
        
        // Add remove event listener
        const removeBtn = producerElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            removeProducer(producer.id);
        });
        
        producer.element = producerElement;
        producerList.appendChild(producerElement);
        
        addLogEntry('system', `Producer ${producer.id} added`);
        
        // Start the producer if simulation is running
        if (simulationRunning) {
            startProducer(producer);
        }
    }

    // Add a consumer to the simulation
    function addConsumer() {
        const consumer = {
            id: ConsumerEntity++,
            active: false,
            interval: null,
            element: null
        };
        
        consumers.push(consumer);
        
        // Create UI element for consumer
        const consumerElement = document.createElement('div');
        consumerElement.className = 'entity consumer';
        consumerElement.innerHTML = `
            <div class="entity-info">
                <span>Consumer ${consumer.id}</span>
                <span class="status">Idle</span>
            </div>
            <div class="entity-controls">
                <button class="remove-btn">Remove</button>
            </div>
        `;
        
        // Add remove event listener
        const removeBtn = consumerElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            removeConsumer(consumer.id);
        });
        
        consumer.element = consumerElement;
        consumerList.appendChild(consumerElement);
        
        addLogEntry('system', `Consumer ${consumer.id} added`);
        
        // Start the consumer if simulation is running
        if (simulationRunning) {
            startConsumer(consumer);
        }
    }

    // Remove a producer
    function removeProducer(id) {
        const index = producers.findIndex(p => p.id === id);
        if (index !== -1) {
            const producer = producers[index];
            
            // Clear interval if active
            if (producer.interval) {
                clearInterval(producer.interval);
            }
            
            // Remove from DOM and array
            producer.element.remove();
            producers.splice(index, 1);
            
            addLogEntry('system', `Producer ${id} removed`);
        }
    }

    // Remove a consumer
    function removeConsumer(id) {
        const index = consumers.findIndex(c => c.id === id);
        if (index !== -1) {
            const consumer = consumers[index];
            
            // Clear interval if active
            if (consumer.interval) {
                clearInterval(consumer.interval);
            }
            
            // Remove from DOM and array
            consumer.element.remove();
            consumers.splice(index, 1);
            
            addLogEntry('system', `Consumer ${id} removed`);
        }
    }

    // Start the simulation
    function startSimulation() {
        if (producers.length === 0 && consumers.length === 0) {
            addLogEntry('system', 'Error: Add at least one producer or consumer');
            return;
        }
        
        simulationRunning = true;
        startSimBtn.disabled = true;
        pauseSimBtn.disabled = false;
        
        // Start all producers
        producers.forEach(producer => {
            startProducer(producer);
        });
        
        // Start all consumers
        consumers.forEach(consumer => {
            startConsumer(consumer);
        });
        
        addLogEntry('system', 'Simulation started - producers and consumers running automatically');
    }

    // Start a producer
    function startProducer(producer) {
        if (!producer.active) {
            producer.active = true;
            
            // Set random interval between 500ms and 2000ms for more interesting simulation
            const produceInterval = Math.floor(Math.random() * 1500) + 500;
            
            producer.interval = setInterval(() => {
                producerProcess(producer);
            }, produceInterval);
            
            updateEntityStatus(producer, 'Running');
        }
    }

    // Start a consumer
    function startConsumer(consumer) {
        if (!consumer.active) {
            consumer.active = true;
            
            // Set random interval between 500ms and 2000ms for more interesting simulation
            const consumeInterval = Math.floor(Math.random() * 1500) + 500;
            
            consumer.interval = setInterval(() => {
                consumerProcess(consumer);
            }, consumeInterval);
            
            updateEntityStatus(consumer, 'Running');
        }
    }

    // Pause the simulation
    function pauseSimulation() {
        simulationRunning = false;
        startSimBtn.disabled = false;
        pauseSimBtn.disabled = true;
        
        // Pause all producers
        producers.forEach(producer => {
            if (producer.active) {
                producer.active = false;
                clearInterval(producer.interval);
                producer.interval = null;
                updateEntityStatus(producer, 'Paused');
            }
        });
        
        // Pause all consumers
        consumers.forEach(consumer => {
            if (consumer.active) {
                consumer.active = false;
                clearInterval(consumer.interval);
                consumer.interval = null;
                updateEntityStatus(consumer, 'Paused');
            }
        });
        
        addLogEntry('system', 'Simulation paused');
    }

    // Update entity status display
    function updateEntityStatus(entity, status) {
        const statusElement = entity.element.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // Producer process
    function producerProcess(producer) {
        // Update status
        updateEntityStatus(producer, 'Trying to produce');
        
        // Wait (if empty slots are available)
        if (empty <= 0) {
            addLogEntry('producer', `Producer ${producer.id} is waiting - buffer full`, producer.id);
            updateEntityStatus(producer, 'Waiting (Buffer full)');
            return;
        }
        
        // Enter critical section (acquire mutex)
        if (mutex <= 0) {
            addLogEntry('producer', `Producer ${producer.id} is waiting for mutex`, producer.id);
            updateEntityStatus(producer, 'Waiting (Mutex)');
            return;
        }
        
        // Critical section
        mutex--; // Acquire mutex
        updateEntityStatus(producer, 'In critical section');
        empty--; // Reduce empty slots
        
        // Find first empty slot
        let emptyIndex = buffer.findIndex(item => item === null);
        const item = nextItemId++;
        
        addLogEntry('producer', `Producer ${producer.id} producing item ${item} at position ${emptyIndex+1}`, producer.id);
        
        // Simulate production delay
        setTimeout(() => {
            buffer[emptyIndex] = item;
            updateBufferUI();
            
            full++; // Increase filled slots
            mutex++; // Release mutex
            
            addLogEntry('producer', `Producer ${producer.id} placed item ${item} in buffer`, producer.id);
            updateEntityStatus(producer, 'Running');
        }, 300); // Short delay for visualization
    }

    // Consumer process
    function consumerProcess(consumer) {
        // Update status
        updateEntityStatus(consumer, 'Trying to consume');
        
        // Wait (if filled slots are available)
        if (full <= 0) {
            addLogEntry('consumer', `Consumer ${consumer.id} is waiting - buffer empty`, consumer.id);
            updateEntityStatus(consumer, 'Waiting (Buffer empty)');
            return;
        }
        
        // Enter critical section (acquire mutex)
        if (mutex <= 0) {
            addLogEntry('consumer', `Consumer ${consumer.id} is waiting for mutex`, consumer.id);
            updateEntityStatus(consumer, 'Waiting (Mutex)');
            return;
        }
        
        // Critical section
        mutex--; // Acquire mutex
        updateEntityStatus(consumer, 'In critical section');
        full--; // Reduce filled slots
        
        // Find first filled slot
        let filledIndex = buffer.findIndex(item => item !== null);
        const item = buffer[filledIndex];
        
        addLogEntry('consumer', `Consumer ${consumer.id} consuming item ${item} from position ${filledIndex+1}`, consumer.id);
        
        // Simulate consumption delay
        setTimeout(() => {
            buffer[filledIndex] = null;
            updateBufferUI();
            
            empty++; // Increase empty slots
            mutex++; // Release mutex
            
            addLogEntry('consumer', `Consumer ${consumer.id} consumed item ${item}`, consumer.id);
            updateEntityStatus(consumer, 'Running');
        }, 300); // Short delay for visualization
    }

    // Add log entry
    function addLogEntry(type, message) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Limit log entries to prevent performance issues
        if (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.children[0]);
        }
    }

    // Event listeners
    addProducerBtn.addEventListener('click', addProducer);
    addConsumerBtn.addEventListener('click', addConsumer);
    startSimBtn.addEventListener('click', startSimulation);
    pauseSimBtn.addEventListener('click', pauseSimulation);
    resetSimBtn.addEventListener('click', initSimulation);
    
    // Initialize buffer size change listener
    bufferSizeInput.addEventListener('change', () => {
        if (!simulationRunning) {
            initSimulation();
        }
    });

    // Initialize the simulation on page load
    initSimulation();
});