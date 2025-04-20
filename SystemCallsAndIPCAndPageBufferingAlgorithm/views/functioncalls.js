
const CreateProcess=document.getElementById('CreateProcess');
const input= document.getElementById('input');
function createProcess(){


console.log("CreateProcess called");
if(!input)
    console.error("Failed to create input element");
else
    console.log("Created input element successfully");
input.value=`#include <stdio.h>
#include <windows.h>
//C:\\Users\\hp\\OneDrive\\Desktop\\os\\os assignment\\helloworld.exe
int main()
{
    STARTUPINFO si ;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si,sizeof(si));
    si.cb=sizeof(si);
    ZeroMemory(&pi , sizeof(pi));
    if(!CreateProcess(NULL,"notepad.exe" , NULL,NULL,FALSE, 0,NULL,NULL,&si,&pi))
    {
        fprintf(stderr,"Create Process Failed");
        return -1;
    }
    WaitForSingleObject(pi.hProcess,INFINITE);
    printf("Child Complete");
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    return 0;
}`;

console.log(input.innerHTML);
CreateProcess.appendChild(input);
};


input.addEventListener('input', ()=>
    {
        console.log("input resize called");
        input.style.height='auto';
        input.style.height= `${input.scrollHeight}`;
        console.log(input.scrollHeight);
    });
createProcess();

const run = document.getElementById('run');
run.addEventListener('click',async ()=>{

    const CreateProcessOutput = document.getElementById('CreateProcessOutput');
    const output=document.getElementById('output');
    
    runProgram(input , CreateProcessOutput,output);
    
    /**try{
    const response = await  fetch('/fork', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('Create Process Successful');

        output.value=`Child Process Created Successfully`;
        CreateProcessOutput.appendChild(output);

    }
    else{
        console.error('Create Process Failed');
        output.value=`${data.error}`;
        CreateProcessOutput.appendChild(output);

        throw new Error("Create Process Failed ${data.error}");
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});




//File Handling


const FileHandling=document.getElementById('FileHandling');
const FileHandlingInput= document.getElementById('FileHandlingInput');
function fileHandling(){


console.log("FileHandling called");
if(!FileHandlingInput)
    console.error("Failed to create FileHandlingInput element");
else
    console.log("Created FileHandlingInput element successfully");
FileHandlingInput.value=`#include<stdio.h>
#include<string.h>
#include <io.h>
#include <stdlib.h>
#include <fcntl.h>

int main()
{

    int fd = _open("f.txt",_O_WRONLY | _O_CREAT);
    if(fd ==-1)   
    {
        perror("Cannot open file . An error occured");
        return 1;
    }

    const char*data = "File Handling demo";
    int size = _write(fd , data , sizeof(char)*strlen(data));
    if(size ==-1)
    {
        perror("Cannot write to the file. \nAn error occured\n");
        _close(fd);
        return 1;
    }

    printf("Data of %d size written duccessfully. \n",size);
    if(_close(fd)==-1)
    {
        perror("Error closing the file\n");
        return 1;
    }
}`;

console.log(FileHandlingInput.innerHTML);
FileHandling.appendChild(FileHandlingInput);
};


FileHandlingInput.addEventListener('input', ()=>
    {
        console.log("FileHandlingInput resize called");
        FileHandlingInput.style.height='auto';
        FileHandlingInput.style.height= `${FileHandlingInput.scrollHeight}`;
        console.log(FileHandlingInput.scrollHeight);
    });
fileHandling();
/**
const FileHandlingRun = document.getElementById('FileHandlingRun');
FileHandlingRun.addEventListener('click',async ()=>{

    const FileHandlingOutput = document.getElementById('FileHandlingOutput');
    const FileHandlingOutputContainer=document.getElementById('FileHandlingOutputContainer');
    
    runProgram(FileHandlingInput , FileHandlingOutputContainer,FileHandlingOutput);
    
   
}); */




//File Handle Read


const FileHandleRead=document.getElementById('FileHandleRead');
const FileHandleReadInput= document.getElementById('FileHandleReadInput');
function fileHandleRead(){


console.log("FileHandleRead called");
if(!FileHandleReadInput)
    console.error("Failed to create FileHandleReadInput element");
else
    console.log("Created FileHandleReadInput element successfully");
FileHandleReadInput.value=`#include <stdio.h>
#include <io.h>      // for _open, _read, _close
#include <fcntl.h>   // for _O_RDONLY
#include <stdlib.h>  // for exit
#include <errno.h>   // for errno
#include <string.h>  // for strerror

int main() {
    const char *filename = "example.txt";
    char buffer[1024];
    int bytesRead;

    // Open the file for reading
    int fd = _open(filename, _O_RDONLY);
    if (fd == -1) {
        fprintf(stderr, "Error opening file: %s\n", strerror(errno));
        exit(EXIT_FAILURE);
    }

    // Read from the file
    bytesRead = _read(fd, buffer, sizeof(buffer) - 1);
    if (bytesRead == -1) {
        fprintf(stderr, "Error reading file: %s\n", strerror(errno));
        _close(fd);
        exit(EXIT_FAILURE);
    }

    // Null-terminate and print buffer
    buffer[bytesRead] = '\0';
    printf("Read %d bytes:\n%s\n", bytesRead, buffer);

    // Close the file
    _close(fd);

    return 0;
}
`;

console.log(FileHandleReadInput.innerHTML);
FileHandleRead.appendChild(FileHandleReadInput);
};


FileHandleReadInput.addEventListener('input', ()=>
    {
        console.log("FileHandleReadInput resize called");
        FileHandleReadInput.style.height='auto';
        FileHandleReadInput.style.height= `${FileHandleReadInput.scrollHeight}`;
        console.log(FileHandleReadInput.scrollHeight);
    });
fileHandleRead();
/**
const FileHandleReadRun = document.getElementById('FileHandleReadRun');
FileHandleReadRun.addEventListener('click',async ()=>{

    const FileHandleReadOutput = document.getElementById('FileHandleReadOutput');
    const FileHandleReadOutputContainer=document.getElementById('FileHandleReadOutputContainer');
    
    runProgram(FileHandleReadInput , FileHandleReadOutputContainer,FileHandleReadOutput);
   
});
*/




//Memory Allocation


const MemoryAllocation=document.getElementById('MemoryAllocation');
const MemoryAllocationInput= document.getElementById('MemoryAllocationInput');
function memoryAllocation(){


console.log("MemoryAllocation called");
if(!MemoryAllocationInput)
    console.error("Failed to create MemoryAllocationInput element");
else
    console.log("Created MemoryAllocationInput element successfully");
MemoryAllocationInput.value=`#include <stdio.h>
#include <stdlib.h>

int main()
{
    void * buffer = malloc(sizeof(int));
    int * ptr = (int *)buffer;

    if(ptr ==NULL)
    {
        perror("Memory allocation failed\n");
        return 1;
    }
    else
    printf("memory allocation successful\n");
    *ptr =100;

    ptr= (int *) realloc(ptr , 5 *sizeof(int));
    if(ptr==NULL)
    {
        perror("Memory reallocation failed\n");
        return 1;
    }
    else
    printf("Memory reallocation successful\n");
    free(ptr);
    return 0;
}`;

console.log(MemoryAllocationInput.innerHTML);
MemoryAllocation.appendChild(MemoryAllocationInput);
};


MemoryAllocationInput.addEventListener('input', ()=>
    {
        console.log("MemoryAllocationInput resize called");
        MemoryAllocationInput.style.height='auto';
        MemoryAllocationInput.style.height= `${MemoryAllocationInput.scrollHeight}`;
        console.log(MemoryAllocationInput.scrollHeight);
    });
memoryAllocation();

const MemoryAllocationRun = document.getElementById('MemoryAllocationRun');
MemoryAllocationRun.addEventListener('click',async ()=>{

    const MemoryAllocationOutput = document.getElementById('MemoryAllocationOutput');
    const MemoryAllocationOutputContainer=document.getElementById('MemoryAllocationOutputContainer');
    runProgram(MemoryAllocationInput , MemoryAllocationOutputContainer,MemoryAllocationOutput);
    
   /** try{
    const response = await  fetch('/malloc', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        MemoryAllocationOutput.value=`${data.stdout}`;
        MemoryAllocationOutputContainer.appendChild(MemoryAllocationOutput);

    }
    else{
        console.error('File Open Failed');
        MemoryAllocationOutput.value=`${data.error}`;
        MemoryAllocationOutputContainer.appendChild(MemoryAllocationOutput);

        //throw new Error("File Open Failed ${data.error}");
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});




//Memory Expansion


const MemoryExpansion=document.getElementById('MemoryExpansion');
const MemoryExpansionInput= document.getElementById('MemoryExpansionInput');
function memoryExpansion(){


console.log("MemoryExpansion called");
if(!MemoryExpansionInput)
    console.error("Failed to create MemoryExpansionInput element");
else
    console.log("Created MemoryExpansionInput element successfully");
MemoryExpansionInput.value=`#include <stdio.h>
#include <windows.h>
int main()
{
    HANDLE heap = GetProcessHeap();
    if(heap == NULL)
    {
        printf("Could not get heap\n");
        return 1;
    }

    LPVOID lp = HeapAlloc(heap ,HEAP_ZERO_MEMORY ,512);
    if(lp == NULL)
    {
        printf("HeapAlloc could not be performed.\n Error : %lu", GetLastError());
        return 1;
    }
    printf("HeapAlloc successful");
    int * ptr = (int *)lp;

    if(!HeapFree(heap , 0 , lp))
    {
        printf("HeapFree failed . An error occured :%lu\n", GetLastError());
        return 1;
    }


}`;

console.log(MemoryExpansionInput.innerHTML);
MemoryExpansion.appendChild(MemoryExpansionInput);
};


MemoryExpansionInput.addEventListener('input', ()=>
    {
        console.log("MemoryExpansionInput resize called");
        MemoryExpansionInput.style.height='auto';
        MemoryExpansionInput.style.height= `${MemoryExpansionInput.scrollHeight}`;
        console.log(MemoryExpansionInput.scrollHeight);
    });
memoryExpansion();

const MemoryExpansionRun = document.getElementById('MemoryExpansionRun');
MemoryExpansionRun.addEventListener('click',async ()=>{

    const MemoryExpansionOutput = document.getElementById('MemoryExpansionOutput');
    const MemoryExpansionOutputContainer=document.getElementById('MemoryExpansionOutputContainer');
   
    runProgram(MemoryExpansionInput , MemoryExpansionOutputContainer,MemoryExpansionOutput);
    /**
      try{
    const response = await  fetch('/heapChange', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        MemoryExpansionOutput.value=`${data.stdout}`;
        MemoryExpansionOutputContainer.appendChild(MemoryExpansionOutput);

    }
    else{
        console.error('File Open Failed');
        MemoryExpansionOutput.value=`${data.error}`;
        MemoryExpansionOutputContainer.appendChild(MemoryExpansionOutput);

        throw new Error(`File Open Failed ${data.error}`);
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});





//File Memory Mapping


const FileMemoryMapping=document.getElementById('FileMemoryMapping');
const FileMemoryMappingInput= document.getElementById('FileMemoryMappingInput');
function fileMemoryMapping(){


console.log("FileMemoryMapping called");
if(!FileMemoryMappingInput)
    console.error("Failed to create FileMemoryMappingInput element");
else
    console.log("Created FileMemoryMappingInput element successfully");
FileMemoryMappingInput.value=`#include <windows.h>
#include <stdio.h>
#include <string.h>
int main()
{
    char * SHARED_MEMORY_NAME= "Local\\\\shmmap";
    HANDLE map;
    LPCSTR buffer;
    map= CreateFileMapping(INVALID_HANDLE_VALUE,NULL,PAGE_READWRITE,0,1024 ,SHARED_MEMORY_NAME);

    if(map==NULL)
    {
        printf("Could not create mapping object , Error :%d\n",GetLastError());
        return 1;
    }
    buffer = (LPCSTR) MapViewOfFile(map ,FILE_MAP_ALL_ACCESS,0,0,0);

    if(buffer ==NULL)
    {
        printf("Could not Map view of file.\n Error : %d\n",GetLastError());
        return 1;
    }
    char * str ="Transferred shared memory ";
    CopyMemory((PVOID)buffer , str ,strlen(str)+1);

    printf("Message shared : %s\n ", buffer);
    UnmapViewOfFile(buffer);
    CloseHandle(map);
    return 0;

}`;

console.log(FileMemoryMappingInput.innerHTML);
FileMemoryMapping.appendChild(FileMemoryMappingInput);
};


FileMemoryMappingInput.addEventListener('input', ()=>
    {
        console.log("FileMemoryMappingInput resize called");
        FileMemoryMappingInput.style.height='auto';
        FileMemoryMappingInput.style.height= `${FileMemoryMappingInput.scrollHeight}`;
        console.log(FileMemoryMappingInput.scrollHeight);
    });
fileMemoryMapping();

const FileMemoryMappingRun = document.getElementById('FileMemoryMappingRun');
FileMemoryMappingRun.addEventListener('click',async ()=>{

    const FileMemoryMappingOutput = document.getElementById('FileMemoryMappingOutput');
    const FileMemoryMappingOutputContainer=document.getElementById('FileMemoryMappingOutputContainer');
    runProgram(FileMemoryMappingInput , FileMemoryMappingOutputContainer,FileMemoryMappingOutput);
    
    /**try{
    const response = await  fetch('/shm', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        FileMemoryMappingOutput.value=`${data.stdout}`;
        FileMemoryMappingOutputContainer.appendChild(FileMemoryMappingOutput);

    }
    else{
        console.error('File Open Failed');
        FileMemoryMappingOutput.value=`${data.error}`;
        FileMemoryMappingOutputContainer.appendChild(FileMemoryMappingOutput);

        throw new Error(`File Open Failed ${data.error}`);
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});



//Memory Mapped Read


const MemoryMappedRead=document.getElementById('MemoryMappedRead');
const MemoryMappedReadInput= document.getElementById('MemoryMappedReadInput');
function memoryMappedRead(){


console.log("MemoryMappedRead called");
if(!MemoryMappedReadInput)
    console.error("Failed to create MemoryMappedReadInput element");
else
    console.log("Created MemoryMappedReadInput element successfully");
MemoryMappedReadInput.value=`#include <stdio.h>
#include <windows.h>

#define MEMORY_SIZE 1024
#define SHARED_MEMORY_NAME "Local\\\\shmmap"
int main()
{

    HANDLE map = OpenFileMapping(FILE_MAP_ALL_ACCESS, FALSE , SHARED_MEMORY_NAME);

    if(map ==NULL)
    {
        printf("Could not open file mapping object .\n Error %d\n",GetLastError());
        return 1;
    }

    LPVOID buffer = MapViewOfFile(map , FILE_MAP_ALL_ACCESS, 0, 0, MEMORY_SIZE );
    if(buffer==NULL)
    {

        printf("Could notmap view of file .\n Error %d",GetLastError());
        CloseHandle(map);
    }
    printf("Shared memory read is %s\n",(char *) buffer);
    UnmapViewOfFile(buffer);
    CloseHandle(map);

    return 0;
}`;

console.log(MemoryMappedReadInput.innerHTML);
MemoryMappedRead.appendChild(MemoryMappedReadInput);
};


MemoryMappedReadInput.addEventListener('input', ()=>
    {
        console.log("MemoryMappedReadInput resize called");
        MemoryMappedReadInput.style.height='auto';
        MemoryMappedReadInput.style.height= `${MemoryMappedReadInput.scrollHeight}`;
        console.log(MemoryMappedReadInput.scrollHeight);
    });
memoryMappedRead();
/**
const MemoryMappedReadRun = document.getElementById('MemoryMappedReadRun');
MemoryMappedReadRun.addEventListener('click',async ()=>{

    const MemoryMappedReadOutput = document.getElementById('MemoryMappedReadOutput');
    const MemoryMappedReadOutputContainer=document.getElementById('MemoryMappedReadOutputContainer');
    
    runProgram(MemoryMappedReadInput , MemoryMappedReadOutputContainer,MemoryMappedReadOutput);
    
}); */






//Pipe


const Pipe=document.getElementById('Pipe');
const PipeInput= document.getElementById('PipeInput');
function pipe(){


console.log("Pipe called");
if(!PipeInput)
    console.error("Failed to create PipeInput element");
else
    console.log("Created PipeInput element successfully");
PipeInput.value=`#include <stdio.h>
#include <windows.h>


int main()
{
    HANDLE pipe;
    DWORD dwWritten ;
    char * PIPE_NAME  ="\\\\\\\\.\\\\pipe\\\\pipet";
    pipe = CreateNamedPipe(PIPE_NAME , PIPE_ACCESS_OUTBOUND,PIPE_TYPE_MESSAGE| PIPE_READMODE_MESSAGE | PIPE_WAIT , 1,1024,1024 ,0 ,NULL);
        if(pipe == INVALID_HANDLE_VALUE)
        {
            printf("Error creating pipes\n");
            return 1;
        }
        printf("Waiting for client to connect to pipe");

        if(!ConnectNamedPipe(pipe ,NULL))
        {
            perror("Error connecting to pipe client\n");
            return 1;
        }

        const char * message = "Hello client\n";
        WriteFile(pipe , message ,strlen(message)+1,&dwWritten ,NULL);

        printf("Message sent to client\n");
        CloseHandle(pipe);
        return 0;
    
}`;

console.log(PipeInput.innerHTML);
Pipe.appendChild(PipeInput);
};


PipeInput.addEventListener('input', ()=>
    {
        console.log("PipeInput resize called");
        PipeInput.style.height='auto';
        PipeInput.style.height= `${PipeInput.scrollHeight}`;
        console.log(PipeInput.scrollHeight);
    });
pipe();
/**
const PipeRun = document.getElementById('PipeRun');
PipeRun.addEventListener('click',async ()=>{

    const PipeOutput = document.getElementById('PipeOutput');
    const PipeOutputContainer=document.getElementById('PipeOutputContainer');
    runProgram(PipeInput , PipeOutputContainer,PipeOutput);
});
*/

//Pipe Read


const PipeRead=document.getElementById('PipeRead');
const PipeReadInput= document.getElementById('PipeReadInput');
function pipeRead(){


console.log("PipeRead called");
if(!PipeReadInput)
    console.error("Failed to create PipeReadInput element");
else
    console.log("Created PipeReadInput element successfully");
PipeReadInput.value=`#include <stdio.h>
#include <windows.h>

int main()
{
    HANDLE pipe;
    DWORD dwRead;
    char * PIPE_NAME= "\\\\\\\\.\\\\pipe\\\\pipet";
    char buffer[128];
    pipe = CreateFile(PIPE_NAME ,GENERIC_READ , 0 ,NULL ,OPEN_EXISTING ,0 , NULL);
    if(pipe==INVALID_HANDLE_VALUE)
    {
        printf("Error opening named pipe \n");
        return 1;
    }
    if(ReadFile(pipe , buffer , sizeof(buffer),&dwRead ,NULL))
    {
        printf("Client received : %s\n",buffer);
    }
    else
    printf("Cannot read from file\n");
    CloseHandle(pipe);
    return 0;
}`;

console.log(PipeReadInput.innerHTML);
PipeRead.appendChild(PipeReadInput);
};


PipeReadInput.addEventListener('input', ()=>
    {
        console.log("PipeReadInput resize called");
        PipeReadInput.style.height='auto';
        PipeReadInput.style.height= `${PipeReadInput.scrollHeight}`;
        console.log(PipeReadInput.scrollHeight);
    });
pipeRead();


const PipeReadOutput = document.getElementById('PipeReadOutput');
const PipeReadOutputContainer=document.getElementById('PipeReadOutputContainer');

const PipeReadRun = document.getElementById('PipeReadRun');
PipeReadRun.addEventListener('click',async (event)=>{
    runProgram(PipeReadInput , PipeReadOutputContainer,PipeReadOutput,event );
   /** try{
    const response = await  fetch('/pipeclient', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        PipeReadOutput.value=`${data.stdout}`;
        PipeReadOutputContainer.appendChild(PipeReadOutput);

    }
    else{
        console.error('File Open Failed');
        PipeReadOutput.value=`${data.error}`;
        PipeReadOutputContainer.appendChild(PipeReadOutput);

        throw new Error(`File Open Failed ${data.error}`);
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});
async function runProgram(input, container, output, event) {
    // Prevent page reload if this is called from a form
    if (event) {
        event.preventDefault();
    }

    const inputval = replaceN(input.value.trim());
    const inputBody = { input: inputval };

    try {
        const response = await fetch('http://localhost:3000/dummy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputBody)
        });
        const data = await response.json();
        if (response.ok) {
            output.value = `${data.stdout}`;
            console.log(`Run output : ${data.stdout}`);
        } else {
            output.value = `${data.error}`;
            console.log(`Run output : ${data.error}`);
        }
        container.appendChild(output);
    } catch (err) {
        console.log(`An error occurred: ${err}`);
    }
}


async function runProgram(input, container, output) {
    // Try to prevent default if run inside an event context
    if (window.event && typeof window.event.preventDefault === 'function') {
        window.event.preventDefault();
    }

    const inputval = replaceN(input.value.trim());
    const inputBody = { input: inputval };

    try {
        const response = await fetch('http://localhost:3000/dummy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputBody)
        });

        const data = await response.json();
        if (response.ok) {
            output.value = `${data.stdout}`;
            console.log(`Run output : ${data.stdout}`);
        } else {
            output.value = `${data.error}`;
            console.log(`Run output : ${data.error}`);
        }

        container.appendChild(output);
    } catch (err) {
        console.log(`An error occurred: ${err}`);
    }
}





function replaceN(str) {
    let str1= str.replace(/"([^"]*)"/g, (match, p1) => {
            p1 = p1.replace(/\n/g, '\\n');
        return `"${p1}"`;
    });
    let str2;
    return str2= str1.replace(/"([^"]*)"/g, (match, p1) => {

        p1 = p1.replace(/\r/g, '\\r');
    return `"${p1}"`;
});
}


//Responsive codespace
document.querySelectorAll('.auto-resize-textarea').forEach(textarea => {
    // Initial adjustment
    adjustTextareaHeight(textarea);
    
    // Adjust on input
    textarea.addEventListener('input', () => adjustTextareaHeight(textarea));
  });
  
  function adjustTextareaHeight(textarea) {
    // Reset height to get correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height (but not exceeding max-height)
    const maxHeight = parseInt(getComputedStyle(textarea).maxHeight);
    const scrollHeight = textarea.scrollHeight;
    
    textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    
    // Show scrollbar only when at max height
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }