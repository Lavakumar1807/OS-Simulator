function validateRequests(requests, maxRange) {
    for (let r of requests) {
        if (isNaN(r) || r < 0 || r > maxRange) {
            alert(`Invalid request: ${r}. Requests must be between 0 and ${maxRange}.`);
            return false;
        }
    }
    return true;
}

function fcfs(requests, head) {
    let seekTime = 0,
        path = [head];
    for (let r of requests) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }
    return { seekTime, path };
}

function sstf(requests, head) {
    let seekTime = 0,
        path = [head],
        visited = Array(requests.length).fill(false);
    for (let i = 0; i < requests.length; i++) {
        let min = Infinity,
            idx = -1;
        for (let j = 0; j < requests.length; j++) {
            if (!visited[j] && Math.abs(requests[j] - head) < min) {
                min = Math.abs(requests[j] - head);
                idx = j;
            }
        }
        visited[idx] = true;
        seekTime += Math.abs(requests[idx] - head);
        head = requests[idx];
        path.push(head);
    }
    return { seekTime, path };
}

function scan(requests, head, max, direction) {
    let seekTime = 0,
        path = [head];

    let requestsCopy = [...requests];

    requestsCopy.sort((a, b) => a - b);

    let idx = requestsCopy.findIndex(r => r >= head);
    if (idx === -1) idx = requestsCopy.length;

    let left = requestsCopy.slice(0, idx);
    let right = requestsCopy.slice(idx);

    if (direction === "left" && left.length > 0 && head !== 0) {
        left.push(0);
    }

    if (direction === "right" && right.length > 0 && head !== max - 1) {
        right.push(max - 1);
    }

    left.sort((a, b) => b - a);
    right.sort((a, b) => a - b);

    let order = direction === "left" ? left.concat(right) : right.concat(left);

    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }

    return { seekTime, path };
}

function look(requests, head, direction) {
    let seekTime = 0,
        path = [head];

    let requestsCopy = [...requests];
    requestsCopy.sort((a, b) => a - b);

    let idx = requestsCopy.findIndex(r => r >= head);
    if (idx === -1) idx = requestsCopy.length;

    let left = requestsCopy.slice(0, idx);
    let right = requestsCopy.slice(idx);

    left.sort((a, b) => b - a);

    let order = direction === "left" ? left.concat(right) : right.concat(left);

    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }

    return { seekTime, path };
}

function cscan(requests, head, max, direction = 'right') {
    let seekTime = 0,
        path = [head];

    let requestsCopy = [...requests];

    requestsCopy.sort((a, b) => a - b);

    let idx = requestsCopy.findIndex(r => r >= head);
    if (idx === -1) idx = requestsCopy.length;

    let left = requestsCopy.slice(0, idx);
    let right = requestsCopy.slice(idx);

    if (direction === 'right') {
        if (right.length > 0 && right[right.length - 1] < max - 1) {
            right.push(max - 1);
        }
        if (left.length > 0 && left[0] > 0) {
            left.unshift(0);
        }
        let order = right.concat(left);

        for (let i = 0; i < order.length; i++) {
            let r = order[i];
            seekTime += Math.abs(r - head);

            head = r;
            path.push(head);
        }
    } else {
        if (left.length > 0 && left[0] > 0) {
            left.unshift(0);
        }
        if (right.length > 0 && right[right.length - 1] < max - 1) {
            right.push(max - 1);
        }

        left.reverse();
        right.reverse();
        let order = left.concat(right);

        for (let i = 0; i < order.length; i++) {
            let r = order[i];
            seekTime += Math.abs(r - head);

            head = r;
            path.push(head);
        }
    }

    return { seekTime, path };
}

function clook(requests, head, direction) {
    let seekTime = 0,
        path = [head];

    let requestsCopy = [...requests];

    requestsCopy.sort((a, b) => a - b);

    let idx = requestsCopy.findIndex(r => r >= head);
    if (idx === -1) idx = requestsCopy.length;

    let left = requestsCopy.slice(0, idx);
    let right = requestsCopy.slice(idx);

    let order;
    if (direction === "left") {
        left.reverse();
        right.reverse();
        order = left.concat(right);
    } else {
        order = right.concat(left);
    }

    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }

    return { seekTime, path };
}

function runSimulation() {
    const max = parseInt(document.getElementById("maxRange").value);
    const requests = document.getElementById("requests").value.split(",").map(Number);
    if (!validateRequests(requests, max)) return;

    const head = parseInt(document.getElementById("head").value);
    const algo = document.getElementById("algorithm").value;
    const dir = document.getElementById("direction").value;

    let result;
    switch (algo) {
        case "fcfs":
            result = fcfs([...requests], head);
            break;
        case "sstf":
            result = sstf([...requests], head);
            break;
        case "scan":
            result = scan([...requests], head, max, dir);
            break;
        case "look":
            result = look([...requests], head, dir);
            break;
        case "clook":
            result = clook([...requests], head, dir);
            break;
        case "cscan":
            result = cscan([...requests], head, max, dir);
            break;
    }

    const avg = result.seekTime / requests.length;
    const pathStr = result.path.join(" → ");
    document.getElementById("output").innerHTML = `
    <strong>Total Seek Time:</strong> ${result.seekTime}<br>
    <strong>Average Seek Time:</strong> ${avg.toFixed(2)}<br>
    <strong>Head Movement:</strong> ${pathStr}
`;

    animateHeadMovement(result.path);

}

function animateHeadMovement(path) {
    const ctx = document.getElementById("diskChart").getContext("2d");
    if (window.diskChartInstance) window.diskChartInstance.destroy();

    const datasets = [{
            label: "Disk Head Movement",
            data: [{ x: 0, y: path[0] }],
            borderColor: "#0a84ff",
            pointBackgroundColor: "#ff3b30",
            fill: false,
            tension: 0.3
        },
        {
            label: "Current Head Position",
            data: [{ x: 0, y: path[0] }],
            borderColor: "transparent",
            pointBackgroundColor: "#34c759",
            pointRadius: 8,
            pointHoverRadius: 10,
            fill: false,
            showLine: false
        }
    ];

    window.diskChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: {
                duration: 0
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: "Sequence (Time Step)"
                    },
                    min: 0,
                    max: path.length
                },
                y: {
                    title: {
                        display: true,
                        text: "Disk Cylinder"
                    },
                    min: 0,
                    max: Math.max(...path) + 20 // dynamic upper range
                }
            }
        }
    });

    let currentIndex = 1;

    function moveHead() {
        if (currentIndex < path.length) {
            const newPoint = { x: currentIndex, y: path[currentIndex] };
            datasets[0].data.push(newPoint); // add to line
            datasets[1].data = [newPoint]; // update current head

            window.diskChartInstance.update();
            currentIndex++;
            setTimeout(moveHead, 500); // speed
        }
    }

    setTimeout(moveHead, 500); // initial delay
}


function compareAlgorithms() {
    const max = parseInt(document.getElementById("maxRange").value);
    const requests = document.getElementById("requests").value.split(",").map(Number);
    if (!validateRequests(requests, max)) return;

    const head = parseInt(document.getElementById("head").value);
    const dir = document.getElementById("direction").value;

    const results = {
        FCFS: fcfs([...requests], head).seekTime,
        SSTF: sstf([...requests], head).seekTime,
        SCAN: scan([...requests], head, max, dir).seekTime,
        LOOK: look([...requests], head, dir).seekTime,
        "C-SCAN": cscan([...requests], head, max, dir).seekTime,
        "C-LOOK": clook([...requests], head, dir).seekTime
    };

    const ctx = document.getElementById("compareChart").getContext("2d");
    if (window.compareChartInstance) window.compareChartInstance.destroy();
    window.compareChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(results),
            datasets: [{
                label: "Total Seek Time",
                data: Object.values(results),
                backgroundColor: ["#0a84ff", "#34c759", "#ffcc00", "#ff9500", "#ff3b30", "#af52de"]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Seek Time" } }
            }
        }
    });
}

document.getElementById("algorithm").addEventListener("change", function() {
    const algo = this.value;
    const dirContainer = document.getElementById("directionContainer");
    dirContainer.style.display = ["scan", "look", "clook", "cscan"].includes(algo) ? "block" : "none";

    const descriptions = {
        fcfs: `🔹 <strong>FCFS (First Come First Serve)</strong><br>
        Processes requests in the order they arrive. Simple and fair, but inefficient if requests are scattered.`,
        sstf: `🔹 <strong>SSTF (Shortest Seek Time First)</strong><br>
        Selects the nearest request to the current head position. Efficient, but can starve distant requests.`,
        scan: `🔹 <strong>SCAN (Elevator Algorithm)</strong><br>
        Moves in one direction, servicing requests, then reverses at the end.`,
        look: `🔹 <strong>LOOK</strong><br>
        Similar to SCAN, but only goes as far as the last request in the direction, then reverses.`,
        cscan: `🔹 <strong>C-SCAN (Circular SCAN)</strong><br>
        Moves in one direction, jumps to the beginning, and continues. Ensures uniform response time.`,
        clook: `🔹 <strong>C-LOOK</strong><br>
        Optimized C-SCAN. Goes only to the last request, then jumps to the first. Reduces unnecessary movement.`
    };

    document.getElementById("algoDescription").innerHTML = descriptions[algo] || "";
});