
const CreateProcess=document.getElementById('CreateProcess');
const input= document.getElementById('input');
function createProcess(){


console.log("CreateProcess called");
if(!input)
    console.error("Failed to create input element");
else
    console.log("Created input element successfully");
input.value=`#include <stdio.h>
#include <stdlib.h>

#define FRAME_COUNT 3
#define BUFFER_SIZE 2

typedef struct {
    int page;
    int referenceBit;
} Frame;

typedef struct {
    int page;
} Buffer;

Frame frames[FRAME_COUNT];
Buffer buffer[BUFFER_SIZE];
int bufferIndex = 0;

int pageExistsInFrames(int page) {
    for (int i = 0; i < FRAME_COUNT; i++) {
        if (frames[i].page == page)
            return i;
    }
    return -1;
}

int pageExistsInBuffer(int page) {
    for (int i = 0; i < BUFFER_SIZE; i++) {
        if (buffer[i].page == page)
            return 1;
    }
    return 0;
}

void addToBuffer(int page) {
    buffer[bufferIndex % BUFFER_SIZE].page = page;
    bufferIndex++;
}

void secondChanceReplace(int page) {
    static int pointer = 0;

    while (1) {
        if (frames[pointer].referenceBit == 0) {
            // Evict this page
            printf("Replacing page %d with page %d\n", frames[pointer].page, page);
            addToBuffer(frames[pointer].page);
            frames[pointer].page = page;
            frames[pointer].referenceBit = 1;
            pointer = (pointer + 1) % FRAME_COUNT;
            break;
        } else {
            // Give second chance
            frames[pointer].referenceBit = 0;
            pointer = (pointer + 1) % FRAME_COUNT;
        }
    }
}

void accessPage(int page) {
    int frameIndex = pageExistsInFrames(page);

    if (frameIndex != -1) {
        printf("Page %d hit in frame %d\n", page, frameIndex);
        frames[frameIndex].referenceBit = 1;
    } else {
        printf("Page %d not in memory\n", page);

        if (pageExistsInBuffer(page)) {
            printf("Page %d found in buffer - loading to frame\n", page);
        }

        // Check for free frame
        int loaded = 0;
        for (int i = 0; i < FRAME_COUNT; i++) {
            if (frames[i].page == -1) {
                frames[i].page = page;
                frames[i].referenceBit = 1;
                loaded = 1;
                printf("Loaded page %d into empty frame %d\n", page, i);
                break;
            }
        }

        if (!loaded) {
            secondChanceReplace(page);
        }
    }
}

void initialize() {
    for (int i = 0; i < FRAME_COUNT; i++) {
        frames[i].page = -1;
        frames[i].referenceBit = 0;
    }
    for (int i = 0; i < BUFFER_SIZE; i++) {
        buffer[i].page = -1;
    }
}

int main() {
    int pages[] = {1, 2, 3, 2, 4, 1, 5, 2, 1, 2};
    int n = sizeof(pages) / sizeof(pages[0]);

    initialize();

    for (int i = 0; i < n; i++) {
        printf("\nAccessing page %d:\n", pages[i]);
        accessPage(pages[i]);
    }

    return 0;
}
`;

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
  }