// ==== Variables & Setup ====
const memoryGrid = document.getElementById("memoryGrid");
const allocationType = document.getElementById("allocationType");
const fileSizeInput = document.getElementById("fileSize");
const output = document.getElementById("outputMessage");
const historyLog = document.getElementById("historyLog");
const simulateButton = document.querySelectorAll(".input-section button")[0];

const blocks = Array.from({ length: 100 }, (_, i) => ({ id: i, status: "free", label: "" }));
let history = [];

// ==== Rendering Grid ====
function renderGrid() {
  memoryGrid.innerHTML = "";
  blocks.forEach((block) => {
    const div = document.createElement("div");
    div.className = `block ${block.status}`;
    div.innerText = block.label || block.id;
    div.title = `Block ${block.id}`;
    memoryGrid.appendChild(div);
  });
}

function resetGrid() {
  blocks.forEach((block) => {
    block.status = "free";
    block.label = "";
  });
  history = [];
  renderGrid();
  output.textContent = "Memory Reset.";
  historyLog.innerHTML = "";
  logHistory("Memory reset to initial state.");
}

// ==== Logging History ====
function logHistory(message) {
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${message}`;
  history.push(entry);
  const p = document.createElement("p");
  p.textContent = entry;
  historyLog.appendChild(p);
  historyLog.scrollTop = historyLog.scrollHeight;
}

// ==== Allocation Logic ====
function simulateContiguous(size) {
  let start = -1;
  for (let i = 0; i <= blocks.length - size; i++) {
    const slice = blocks.slice(i, i + size);
    if (slice.every((b) => b.status === "free")) {
      start = i;
      break;
    }
  }
  if (start !== -1) {
    for (let i = start; i < start + size; i++) {
      blocks[i].status = "allocated";
      blocks[i].label = `F${i - start + 1}`;
    }
    output.textContent = `Contiguous Allocation: Blocks ${start} to ${start + size - 1}`;
    logHistory(`Contiguous: Allocated ${size} blocks from ${start} to ${start + size - 1}`);
  } else {
    output.textContent = "Contiguous Allocation Failed: Not enough space.";
    logHistory("Contiguous: Allocation failed. Not enough contiguous space.");
  }
}

function simulateLinked(size) {
  let allocated = 0;
  let links = [];
  while (allocated < size) {
    let index = Math.floor(Math.random() * blocks.length);
    if (blocks[index].status === "free") {
      blocks[index].status = "linked";
      blocks[index].label = `F${allocated + 1}`;
      links.push(index);
      allocated++;
    }
  }
  output.textContent = `Linked Allocation: Blocks linked ${links.join(" → ")}`;
  logHistory(`Linked: Allocated blocks ${links.join(" → ")}`);
}

function simulateIndexed(size) {
  let indexBlock = -1;
  while (true) {
    const index = Math.floor(Math.random() * blocks.length);
    if (blocks[index].status === "free") {
      blocks[index].status = "indexed";
      blocks[index].label = "Index";
      indexBlock = index;
      break;
    }
  }

  let dataBlocks = [];
  let count = 0;
  while (count < size) {
    const i = Math.floor(Math.random() * blocks.length);
    if (blocks[i].status === "free") {
      blocks[i].status = "indexed";
      blocks[i].label = `F${count + 1}`;
      dataBlocks.push(i);
      count++;
    }
  }

  output.innerHTML = `Indexed Allocation:<br>Index Block: ${indexBlock}<br>Data Blocks: ${dataBlocks.join(", ")}`;
  logHistory(`Indexed: Index block ${indexBlock}, Data blocks ${dataBlocks.join(", ")}`);
}

// ==== Simulate Button Action ====
function startSimulation() {
  const type = allocationType.value;
  const size = parseInt(fileSizeInput.value);
  if (!size || size < 1 || size > 20) {
    alert("Enter a valid file size between 1 and 20");
    return;
  }
  resetGrid();
  if (type === "contiguous") simulateContiguous(size);
  else if (type === "linked") simulateLinked(size);
  else simulateIndexed(size);
  renderGrid();
}

simulateButton.addEventListener("click", startSimulation);

// ==== Theme Toggle ====
document.getElementById("toggleTheme")?.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// ==== Export History ====
document.getElementById("exportHistory")?.addEventListener("click", () => {
  const blob = new Blob([history.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "allocation_history.txt";
  link.click();
});

// ==== Init ====
renderGrid();
logHistory("Simulation initialized. Ready to allocate files.");
