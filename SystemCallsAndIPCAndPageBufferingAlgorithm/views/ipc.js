<<<<<<< HEAD:SystemCallsAndIPC/views/ipc.js
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
    
});
*/





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

/**
const PipeReadOutput = document.getElementById('PipeReadOutput');
const PipeReadOutputContainer=document.getElementById('PipeReadOutputContainer');

const PipeReadRun = document.getElementById('PipeReadRun');
PipeReadRun.addEventListener('click',async ()=>{
    runProgram(PipeReadInput , PipeReadOutputContainer,PipeReadOutput);

});

*/
async function runProgram(input , container ,output )
{
    const inputval = replaceN(input.value.trim());
    //console.log("inputval is ",inputval);
    //console.log("Run Program Called");
    const inputBody = {input :inputval} ;
    try{
        const response = await fetch('/dummy',{method: 'POST', headers: {'Content-Type' : 'application/json'},body: JSON.stringify(inputBody) } );
        const data =await response.json();
        if(response.ok)
        {
            output.value=`${data.stdout}`;
            console.log(`Run output : ${data.stdout}`);
        }
        else
        {
            output.value=`${data.error}`;
            console.log(`Run output : ${data.error}`);
        }
        container.appendChild(output);
    } catch(err){
        console.log(`An error occured :${err.message}`);
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
=======
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

const MemoryMappedReadRun = document.getElementById('MemoryMappedReadRun');
MemoryMappedReadRun.addEventListener('click',async ()=>{

    const MemoryMappedReadOutput = document.getElementById('MemoryMappedReadOutput');
    const MemoryMappedReadOutputContainer=document.getElementById('MemoryMappedReadOutputContainer');
    
    runProgram(MemoryMappedReadInput , MemoryMappedReadOutputContainer,MemoryMappedReadOutput);
    /** try{
    const response = await  fetch('/shmr', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        MemoryMappedReadOutput.value=`${data.stdout}`;
        MemoryMappedReadOutputContainer.appendChild(MemoryMappedReadOutput);

    }
    else{
        console.error('File Open Failed');
        MemoryMappedReadOutput.value=`${data.error}`;
        MemoryMappedReadOutputContainer.appendChild(MemoryMappedReadOutput);

        throw new Error(`File Open Failed ${data.error}`);
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    } */
});






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

const PipeRun = document.getElementById('PipeRun');
PipeRun.addEventListener('click',async ()=>{

    const PipeOutput = document.getElementById('PipeOutput');
    const PipeOutputContainer=document.getElementById('PipeOutputContainer');
    runProgram(PipeInput , PipeOutputContainer,PipeOutput);
    /**
    try{
    const response = await  fetch('/pipe', {method:'GET'} ) ;
    const data= await response.json();
    console.log(data);
    if(response.ok)
    {
        
        console.log('File Opened Successful');

        PipeOutput.value=`${data.stdout}`;
        PipeOutputContainer.appendChild(PipeOutput);

    }
    else{
        console.error('File Open Failed');
        PipeOutput.value=`${data.error}`;
        PipeOutputContainer.appendChild(PipeOutput);

        throw new Error(`File Open Failed ${data.error}`);
        
    } 
    } catch(err){
        console.log(`An error occured : ${err.message}`);
    }
        */
});


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
PipeReadRun.addEventListener('click',async ()=>{
    runProgram(PipeReadInput , PipeReadOutputContainer,PipeReadOutput);
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


async function runProgram(input , container ,output )
{
    const inputval = replaceN(input.value.trim());
    //console.log("inputval is ",inputval);
    //console.log("Run Program Called");
    const inputBody = {input :inputval} ;
    try{
        const response = await fetch('/dummy',{method: 'POST', headers: {'Content-Type' : 'application/json'},body: JSON.stringify(inputBody) } );
        const data =await response.json();
        if(response.ok)
        {
            output.value=`${data.stdout}`;
            console.log(`Run output : ${data.stdout}`);
        }
        else
        {
            output.value=`${data.error}`;
            console.log(`Run output : ${data.error}`);
        }
        container.appendChild(output);
    } catch(err){
        console.log(`An error occured :${err.message}`);
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
>>>>>>> 8a1e40ff4278c6d537193bb2e58ef811679e5894:SystemCallsAndIPCAndPageBufferingAlgorithm/views/ipc.js
  }