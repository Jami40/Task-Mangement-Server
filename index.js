const express=require('express')
const cors = require('cors');
const app=express()
require('dotenv').config()
const port=process.env.PORT || 5000

// UHwbtNRttJigLGaJ
// tasks_management


app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.knxzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("TaskManagementSystem");
    const userCollection = database.collection("user");
    const taskCollection=database.collection("tasks")

    app.get('/user/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const user = await userCollection.findOne(query);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.send(user);
    
});

  app.post('/user/:email',async(req,res)=>{
      const email=req.params.email
      const query={email}
      const user=req.body
      const isExists=await userCollection.findOne(query)
      if(isExists){
          return res.send(isExists)
      }

      const result=await userCollection.insertOne({...user,timestamp:Date.now(),})
      res.send(result)

  })

    // Task Routes
    app.get('/api/tasks', async (req, res) => {
        const tasks = await taskCollection.find().toArray();
        res.json(tasks);
    });

    app.post('/api/tasks', async (req, res) => {
        const newTask = { ...req.body, timestamp: new Date(), category: 'To-Do' };
        const result = await taskCollection.insertOne(newTask);
        res.json({ _id: result.insertedId, ...newTask });
    });

    app.put('/api/tasks/:id', async (req, res) => {
        const { id } = req.params;
        const updatedTask = await taskCollection.findOneAndUpdate(
            { _id: new MongoClient.ObjectId(id) },
            { $set: req.body },
            { returnOriginal: false }
        );
        res.json(updatedTask.value);
    });

    app.delete('/api/tasks/:id', async (req, res) => {
        const { id } = req.params;
        await taskCollection.deleteOne({ _id: new MongoClient.ObjectId(id) });
        res.sendStatus(204);
    });

    app.put('/api/tasks/reorder', async (req, res) => {
        const tasks = req.body;
        await Promise.all(tasks.map(task => 
            taskCollection.updateOne(
                { _id: new MongoClient.ObjectId(task._id) },
                { $set: task }
            )
        ));
        res.sendStatus(204);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('TaskManagement is running')
})

app.listen(port,()=>{
    console.log('Task-Management is running at',port)
})