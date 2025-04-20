// File system structure
const fileSystem = {
    '/': {
      type: 'directory',
      children: {
        'home': {
          type: 'directory',
          children: {
            'index.html': {
              type: 'file',
              content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Website</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <p>This is a simple website for demonstration.</p>\n  <script src="script.js"><\/script>\n</body>\n</html>'
            },
            'styles.css': {
              type: 'file',
              content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}\n\np {\n  color: #666;\n}'
            },
            'script.js': {
              type: 'file',
              content: 'document.addEventListener("DOMContentLoaded", function() {\n  console.log("Website loaded successfully!");\n  \n  // Add event listener to h1 element\n  const heading = document.querySelector("h1");\n  if (heading) {\n    heading.addEventListener("click", function() {\n      alert("You clicked the heading!");\n    });\n  }\n});'
            }
          }
        }
      }
    }
  };
  
  // Current path and command history
  let currentPath = '/home';
  const commandHistory = ['ls'];
  let historyIndex = commandHistory.length;
  
  // Terminal elements
  const terminalContent = document.getElementById('terminalContent');
  const commandInput = document.getElementById('commandInput');
  const currentPathElement = document.getElementById('currentPath');
  
  // Update path display
  function updatePathDisplay() {
    currentPathElement.textContent = currentPath;
  }
  
  // Get directory from path
  // Get directory from path
function getDirectoryFromPath(path) {
    if (path === '/') return fileSystem['/'];
    
    // Handle relative paths with ..
    if (path.includes('..')) {
      const resolvedPath = resolvePath(path);
      if (!resolvedPath) return null;
      path = resolvedPath;
    }
    
    const parts = path.split('/').filter(part => part);
    let current = fileSystem['/'];
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    
    return current;
  }
  
  // Resolve a path with .. references
  function resolvePath(path) {
    // Handle absolute vs relative path
    let basePath = path.startsWith('/') ? [] : currentPath.split('/').filter(p => p);
    const parts = path.split('/');
    
    for (const part of parts) {
      if (part === '' || part === '.') continue;
      if (part === '..') {
        if (basePath.length === 0) return '/';
        basePath.pop();
      } else {
        basePath.push(part);
      }
    }
    
    return '/' + basePath.join('/');
  }
  
  // Get current directory
  function getCurrentDirectory() {
    return getDirectoryFromPath(currentPath);
  }
  
  // Add command to terminal
  function addCommand(command) {
    const commandLine = document.createElement('div');
    commandLine.className = 'command-line';
    commandLine.innerHTML = `
      <span class="prompt">user@machine:</span>
      <span class="current-path">${currentPath}</span>
      <span>$</span>
      <span class="command-input">${command}</span>
    `;
    terminalContent.appendChild(commandLine);
    return commandLine;
  }
  
  // Add result to terminal
  function addResult(text, isError = false) {
    const result = document.createElement('div');
    result.className = isError ? 'error' : 'result';
    result.textContent = text;
    terminalContent.appendChild(result);
    return result;
  }
  
  // Execute command
  function executeCommand(command) {
    addCommand(command);
    commandHistory.push(command);
    historyIndex = commandHistory.length;
  
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    
    switch (cmd) {
      case 'cd':
        handleCd(parts.slice(1));
        break;
      case 'mkdir':
        handleMkdir(parts.slice(1));
        break;
      case 'rm':
        handleRm(parts.slice(1));
        break;
      case 'touch':
        handleTouch(parts.slice(1));
        break;
      case 'ls':
        handleLs();
        break;
      case 'tree':
        handleTree();
        break;
      case 'mv':
        handleMv(parts.slice(1));
        break;
      case 'clear':
        handleClear();
        break;
      case 'hist':
        handleHist();
        break;
      case 'cat':
        handleCat(parts.slice(1));
        break;
      default:
        addResult(`Command not found: ${cmd}`, true);
    }
  
    // Scroll to bottom
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }
  
  // Handle cd command
  function handleCd(args) {
    if (args.length === 0) {
      currentPath = '/home';
      updatePathDisplay();
      return;
    }
    
    const target = args[0];
    
    if (target === '..') {
      // Go up one directory
      if (currentPath === '/') {
        addResult('Already at root directory');
        return;
      }
      
      const parts = currentPath.split('/').filter(part => part);
      if (parts.length > 0) {
        parts.pop();
        currentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
        updatePathDisplay();
      }
    } else if (target === '/') {
      // Go to root
      currentPath = '/';
      updatePathDisplay();
    } else {
      // Handle relative paths
      const current = getCurrentDirectory();
      
      if (!current || !current.children) {
        addResult(`Cannot access directory: ${currentPath}`, true);
        return;
      }
      
      // Handle path with slashes
      if (target.includes('/')) {
        // Simple implementation for demo purposes
        let newPath = target.startsWith('/') ? target : `${currentPath === '/' ? '' : currentPath}/${target}`;
        
        // Clean up path
        newPath = newPath.replace(/\/+/g, '/');
        if (newPath.endsWith('/') && newPath !== '/') {
          newPath = newPath.slice(0, -1);
        }
        
        const targetDir = getDirectoryFromPath(newPath);
        if (targetDir && targetDir.type === 'directory') {
          currentPath = newPath;
          updatePathDisplay();
        } else {
          addResult(`No such directory: ${target}`, true);
        }
        return;
      }
      
      // Simple directory change
      if (current.children[target] && current.children[target].type === 'directory') {
        currentPath = currentPath === '/' ? `/${target}` : `${currentPath}/${target}`;
        updatePathDisplay();
      } else {
        addResult(`No such directory: ${target}`, true);
      }
    }
  }
  
  // Handle mkdir command
  function handleMkdir(args) {
    if (args.length === 0) {
      addResult('mkdir: missing operand', true);
      return;
    }
    
    const dirName = args[0];
    if (dirName.includes('/')) {
      addResult('mkdir: cannot create directory with slashes (simplified version)', true);
      return;
    }
    
    const current = getCurrentDirectory();
    if (!current || !current.children) {
      addResult(`Cannot access directory: ${currentPath}`, true);
      return;
    }
    
    if (current.children[dirName]) {
      addResult(`mkdir: cannot create directory '${dirName}': File exists`, true);
      return;
    }
    
    current.children[dirName] = {
      type: 'directory',
      children: {}
    };
    
    addResult('');
  }
  
  // Handle rm command
  function handleRm(args) {
    if (args.length === 0) {
      addResult('rm: missing operand', true);
      return;
    }
    
    const target = args[0];
    if (target.includes('/')) {
      addResult('rm: cannot remove path with slashes (simplified version)', true);
      return;
    }
    
    const current = getCurrentDirectory();
    if (!current || !current.children) {
      addResult(`Cannot access directory: ${currentPath}`, true);
      return;
    }
    
    if (!current.children[target]) {
      addResult(`rm: cannot remove '${target}': No such file or directory`, true);
      return;
    }
    
    delete current.children[target];
    addResult('');
  }
  
  // Handle touch command
  function handleTouch(args) {
    if (args.length === 0) {
      addResult('touch: missing file operand', true);
      return;
    }
    
    const fileName = args[0];
    if (fileName.includes('/')) {
      addResult('touch: cannot create file with slashes (simplified version)', true);
      return;
    }
    
    const current = getCurrentDirectory();
    if (!current || !current.children) {
      addResult(`Cannot access directory: ${currentPath}`, true);
      return;
    }
    
    if (!current.children[fileName]) {
      current.children[fileName] = {
        type: 'file',
        content: ''
      };
    }
    
    addResult('');
  }
  
  // Handle ls command
  function handleLs() {
    const current = getCurrentDirectory();
    if (!current || !current.children) {
      addResult(`Cannot access directory: ${currentPath}`, true);
      return;
    }
    
    const items = Object.entries(current.children);
    if (items.length === 0) {
      addResult('');
      return;
    }
    
    const result = items.map(([name, item]) => {
      return item.type === 'directory' ? 
        `<span class="directory">${name}/</span>` : 
        `<span class="file">${name}</span>`;
    }).join('  ');
    
    const resultElement = document.createElement('div');
    resultElement.className = 'result';
    resultElement.innerHTML = result;
    terminalContent.appendChild(resultElement);
  }
  
  // Handle tree command
  function handleTree() {
    function generateTree(dir, path, prefix = '') {
      let result = '';
      const entries = Object.entries(dir.children || {});
      
      for (let i = 0; i < entries.length; i++) {
        const [name, item] = entries[i];
        const isLast = i === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const itemPath = path === '/' ? `/${name}` : `${path}/${name}`;
        
        result += `${prefix}${connector}${item.type === 'directory' ? `<span class="directory">${name}/</span>` : `<span class="file">${name}</span>`}\n`;
        
        if (item.type === 'directory' && item.children) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          result += generateTree(item, itemPath, newPrefix);
        }
      }
      
      return result;
    }
    
    // Start from root for the tree command
    const root = fileSystem['/'];
    let result = `<span class="directory">/</span>\n`;
    result += generateTree(root, '/', '');
    
    const resultElement = document.createElement('div');
    resultElement.className = 'result';
    resultElement.innerHTML = result;
    terminalContent.appendChild(resultElement);
  }
  
  // Handle mv command
  // Handle mv command
function handleMv(args) {
    if (args.length < 2) {
      addResult('mv: missing destination file operand', true);
      return;
    }
    
    const sourcePath = args[0];
    const destPath = args[1];
    
    // Get source file/directory
    let sourceParentPath = currentPath;
    let sourceName = sourcePath;
    
    if (sourcePath.includes('/')) {
      const parts = sourcePath.split('/');
      sourceName = parts.pop();
      let sourceDir = sourcePath.startsWith('/') ? '' : currentPath;
      if (parts.length > 0) {
        sourceDir = sourcePath.startsWith('/') ? '/' + parts.join('/') : 
                   (currentPath === '/' ? '/' : currentPath + '/') + parts.join('/');
      }
      sourceParentPath = sourceDir;
    }
    
    // Get source parent directory
    const sourceParent = getDirectoryFromPath(sourceParentPath);
    if (!sourceParent || !sourceParent.children) {
      addResult(`mv: cannot access '${sourceParentPath}': No such directory`, true);
      return;
    }
    
    // Check if source exists
    if (!sourceParent.children[sourceName]) {
      addResult(`mv: cannot stat '${sourcePath}': No such file or directory`, true);
      return;
    }
    
    const sourceItem = sourceParent.children[sourceName];
    
    // Get destination
    let destParentPath = currentPath;
    let destName = destPath;
    
    if (destPath.includes('/')) {
      const parts = destPath.split('/');
      destName = parts.pop();
      let destDir = destPath.startsWith('/') ? '' : currentPath;
      if (parts.length > 0) {
        destDir = destPath.startsWith('/') ? '/' + parts.join('/') : 
                 (currentPath === '/' ? '/' : currentPath + '/') + parts.join('/');
      }
      destParentPath = destDir;
    }
    
    // If destination ends with /, treat as directory and keep source name
    if (destPath.endsWith('/')) {
      destParentPath = destPath.startsWith('/') ? destPath : 
                      (currentPath === '/' ? '/' : currentPath + '/') + destPath;
      destName = sourceName;
    }
    
    // Normalize paths
    if (destParentPath !== '/' && destParentPath.endsWith('/')) {
      destParentPath = destParentPath.slice(0, -1);
    }
    
    // Get destination parent directory
    const destParent = getDirectoryFromPath(destParentPath);
    if (!destParent || !destParent.children) {
      addResult(`mv: cannot access '${destParentPath}': No such directory`, true);
      return;
    }
    
    // Check if destination is a directory
    if (destParent.children[destName] && destParent.children[destName].type === 'directory') {
      // If destination is a directory, move source into it
      destParent.children[destName].children[sourceName] = sourceItem;
    } else {
      // Otherwise move/rename the file
      destParent.children[destName] = sourceItem;
    }
    
    // Remove the source
    delete sourceParent.children[sourceName];
    
    addResult('');
  }
  
  // Handle clear command
  function handleClear() {
    terminalContent.innerHTML = '';
  }
  
  // Handle hist command
  function handleHist() {
    const history = commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
    addResult(history);
  }
  
  // Handle cat command (bonus)
  function handleCat(args) {
    if (args.length === 0) {
      addResult('cat: missing file operand', true);
      return;
    }
    
    const fileName = args[0];
    if (fileName.includes('/')) {
      addResult('cat: paths with slashes not supported in this simplified version', true);
      return;
    }
    
    const current = getCurrentDirectory();
    if (!current || !current.children) {
      addResult(`Cannot access directory: ${currentPath}`, true);
      return;
    }
    
    if (!current.children[fileName]) {
      addResult(`cat: ${fileName}: No such file`, true);
      return;
    }
    
    if (current.children[fileName].type !== 'file') {
      addResult(`cat: ${fileName}: Is a directory`, true);
      return;
    }
    
    addResult(current.children[fileName].content);
  }
  
  // Event listener for command input
  commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const command = this.value.trim();
      if (command) {
        executeCommand(command);
        this.value = '';
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        this.value = commandHistory[historyIndex];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        this.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        this.value = '';
      }
    }
  });
  
  // Initial focus
  commandInput.focus();
  window.addEventListener('click', function() {
    commandInput.focus();
  });
  
  // Update path display on load
  updatePathDisplay();