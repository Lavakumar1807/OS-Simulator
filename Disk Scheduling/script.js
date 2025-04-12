function validateRequests(requests, maxRange) {
    for (let r of requests) {
        if (isNaN(r) || r < 0 || r > maxRange) {
            alert(`Invalid request: ${r}. Requests must be between 0 and ${maxRange }.`);
            return false;
        }
    }
    return true;
}

function fcfs(requests, head) {
    let seekTime = 0, path = [head];
    for (let r of requests) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }
    return { seekTime, path };
}

function sstf(requests, head) {
    let seekTime = 0, path = [head], visited = Array(requests.length).fill(false);
    for (let i = 0; i < requests.length; i++) {
        let min = Infinity, idx = -1;
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
    let seekTime = 0, path = [head];
    requests.push(0, max - 1);
    requests.sort((a, b) => a - b);
    let idx = requests.findIndex(r => r >= head);
    let left = requests.slice(0, idx).reverse();
    let right = requests.slice(idx);
    let order = direction === "left" ? left.concat(right) : right.concat(left);
    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }
    return { seekTime, path };
}

function look(requests, head, direction) {
    let seekTime = 0, path = [head];
    requests.sort((a, b) => a - b);
    let idx = requests.findIndex(r => r >= head);
    let left = requests.slice(0, idx).reverse();
    let right = requests.slice(idx);
    let order = direction === "left" ? left.concat(right) : right.concat(left);
    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }
    return { seekTime, path };
}

function clook(requests, head, direction) {
    let seekTime = 0, path = [head];
    requests.sort((a, b) => a - b);
    let idx = requests.findIndex(r => r >= head);
    let left = requests.slice(0, idx);
    let right = requests.slice(idx);
    let order = direction === "left" ? left.reverse().concat(right.reverse()) : right.concat(left);
    for (let r of order) {
        seekTime += Math.abs(r - head);
        head = r;
        path.push(head);
    }
    return { seekTime, path };
}

function cscan(requests, head, max) {
    let seekTime = 0, path = [head];
    requests.push(0, max - 1);
    requests.sort((a, b) => a - b);
    let idx = requests.findIndex(r => r >= head);
    let right = requests.slice(idx);
    let left = requests.slice(0, idx);
    let order = right.concat(left);
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
        case "fcfs": result = fcfs([...requests], head); break;
        case "sstf": result = sstf([...requests], head); break;
        case "scan": result = scan([...requests], head, max, dir); break;
        case "look": result = look([...requests], head, dir); break;
        case "clook": result = clook([...requests], head, dir); break;
        case "cscan": result = cscan([...requests], head, max); break;
    }

    const avg = result.seekTime / requests.length;
    const pathStr = result.path.join(" → ");
document.getElementById("output").innerHTML = `
    <strong>Total Seek Time:</strong> ${result.seekTime}<br>
    <strong>Average Seek Time:</strong> ${avg.toFixed(2)}<br>
    <strong>Head Movement:</strong> ${pathStr}
`;

    drawChart(result.path);
}

function drawChart(path) {
    const ctx = document.getElementById("diskChart").getContext("2d");
    if (window.diskChartInstance) window.diskChartInstance.destroy();
    window.diskChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: path,
            datasets: [{
                label: "Disk Head Movement",
                data: path,
                borderColor: "#0a84ff",
                pointBackgroundColor: "#ff3b30",
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Disk Cylinders" } },
                y: { title: { display: true, text: "Seek Sequence" }, reverse: true }
            }
        }
    });
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
        "C-SCAN": cscan([...requests], head, max).seekTime,
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

document.getElementById("algorithm").addEventListener("change", function () {
    const algo = this.value;
    const dirContainer = document.getElementById("directionContainer");
    dirContainer.style.display = ["scan", "look", "clook"].includes(algo) ? "block" : "none";

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
