import express from 'express';
import cors from 'cors';
import nodemon from 'nodemon';
import dayjs from 'dayjs';

const app = express();
app.use(express.json())
app.use(cors())


let participants =[];
let messages =[];
let messagesFiltred =[];

app.post("/participants", (req, res) => {
    const user = req.body;
    if(user.name.length === 0 || participants.find((each) => each.name === user.name)){
        res.sendStatus(400);
    }
    else{
        user.lastStatus = Date.now();
        participants.push(user);
        const success = {
            from: user.name,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: dayjs(user.lastStatus).format("HH:mm:ss")
        }
        messages.push(success);
        res.sendStatus(200);
    }
});
app.get('/participants',(req,res)=>{
    res.send(participants)
})
app.get('/messages',(req,res)=>{
    let limit = parseInt(req.query.limit);
    const user = req.header("User");


    messagesFiltred = messages.filter(message => message.to === user || message.to === "Todos" || message.type === "status" || message.from === user || (message.type === "private_message" && message.to === user))
    
    if(req.query.limit){
        res.send(messagesFiltred.slice(-limit))
    }
    else{
        res.send(messagesFiltred)
    }
    
    
})
app.post('/messages',(req,res)=>{
    const user = req.header("User");
    if((req.body.to.length > 0 && req.body.text.length > 0) && (req.body.type === 'message' || req.body.type === 'private_message') && participants.find(i => i.name === user)){
    messages.push({from: user,...req.body, time: dayjs().format('HH:mm:ss')})
    } else {
        res.sendStatus(400)
    }
})

app.post('/status',(req,res) => {
    const user =  req.header("User");
    const isStillOnline = participants.find(current => current.name === user)
    isStillOnline? ((isStillOnline.lastStatus = Date.now()) && res.sendStatus(200)): res.sendStatus(400);
})

setInterval(()=> {

    console.log(participants)
    participants = participants.filter(each => {
        if((Date.now() - each.lastStatus) < 10000 ){
            
            return true;
            
        } else{
            messages.push({
                from: each.name,
                to:"Todos",
                text:"saiu da sala...",
                type:"status",
                time: dayjs().format("HH:mm:ss")
            });
           
            return false;
        }
        
    })
},15000)

app.listen(4000,()=>{console.log('server rodando!')})