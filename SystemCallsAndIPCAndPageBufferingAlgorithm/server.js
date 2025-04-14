
const path=require('path');
const express=require('express');
const {exec} =require('child_process');
const server= new express();
const fs =require('fs');
const PORT=3000;
server.use(express.json());


server.listen(PORT, (err)=>
{
    if(err)
    {
        console.error("An error occured while listening to the ports");
    }
    else
    {
        console.log(`Server is now listening at port http://localhost:${PORT} \n http://localhost:${PORT}/ipc`);
    }
});

server.use(express.static(path.join(__dirname, 'views')));


server.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname,'views','functioncalls.html'));
});
server.get('/ipc', (req,res)=> {
    res.sendFile(path.join(__dirname,'views','ipc.html'));
});
server.get('/pagebuffer',(req,res) => {
    res.sendFile(path.join(__dirname , 'views', 'pagebuffer.html'));
})

server.get('/fork', (req,res)=> {

    const cmd = 'fork.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});



server.get('/fd', (req,res)=> {

    const cmd = 'fd.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});

server.get('/fdr', (req,res)=> {

    const cmd = 'fdr.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});


server.get('/malloc', (req,res)=> {

    const cmd = 'malloc.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});



server.get('/heapChange', (req,res)=> {

    const cmd = 'heapChange.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});

server.get('/shm', (req,res)=> {

    const cmd = 'shm.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});

server.get('/shmr', (req,res)=> {

    const cmd = 'shmr.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});


server.get('/pipe', (req,res)=> {

    const cmd = 'pipe.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});

server.get('/pipeclient', (req,res)=> {

    const cmd = 'pipeclient.exe';
exec(cmd ,(error ,stdout , stderr) =>{
    if(error)
    {
        console.error(`An error occured : \n ${error.message}`);
        res.status(400).send({error:error.message})
    }
    if(stderr)
    {
        console.error(`stderr : ${stderr}`);
        res.status(400).send({error:stderr});
    }
    console.log(`stdout:${stdout}`); 
    res.status(200).send({stdout:stdout});
});
    
});

server.post('/dummy' , (req,res) =>{
    
    //const content =req.body.input ;

    const content = req.body.input;  // Normalize to Unix-style newlines
    console.log("content:", content);;
     fs.writeFile("dummy.c",content ,(err)=>
    {
        if(err)
        {
            console.error("Could not create dummy file");
            //res.status(500).send({error:err});
        }
        else
            console.log("Dummy File creation successful");

    });
    const cmd = 'gcc dummy.c -lm -o dummy';
    const cmdf = 'dummy.exe';
    exec(cmd ,(error ,stdout , stderr) =>{
        if(error)
        {
            console.error(`An error occured : \n ${error.message}`);
            //res.status(400).send({error:error.message})
        }
        if(stderr)
        {
            console.error(`stderr : ${stderr}`);
            //res.status(400).send({error:stderr});
        }
        console.log(`stdout:${stdout}`); 
        //res.status(200).send({stdout:stdout});
        exec(cmdf ,(error ,stdout , stderr) =>{
            if(error)
            {
                console.error(`An error occured : \n ${error.message}`);
                res.status(400).send({error:error.message})
            }
            if(stderr)
            {
                console.error(`stderr : ${stderr}`);
                res.status(400).send({error:stderr});
            }
            console.log(`stdout:${stdout}`); 
            res.status(200).send({stdout:stdout});
        })
    });
});