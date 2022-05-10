const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sctdy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect()
        const userCollection = client.db('simply-blended').collection('juice')

        app.get('/products',async(req,res)=>{
            const cursor = userCollection.find()
            const result = await cursor.toArray()
            if(!result?.length){
                res.send({success:false,error:'No product found'})
            }
            res.send({success:true,data:result})
        })

        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id)
            const query = {_id: ObjectId(id)}
            const service = await userCollection.findOne(query)
            if(!service){
                res.send({success:false,error:'No product found'})
            }
            res.send({success:true,data:service})
        })
    }finally{

    }
}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('hello how are you?')
})

app.listen(port,()=>{
    console.log('your port running now',port)
})
