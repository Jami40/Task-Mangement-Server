const express=require('express')
const cors = require('cors');
const app=express()
require('dotenv').config()
const port=process.env.PORT || 5000


app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send('TaskManagement is running')
})

app.listen(port,()=>{
    console.log('Task-Management is running at',port)
})