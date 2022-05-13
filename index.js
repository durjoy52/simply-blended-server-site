const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { parse } = require("dotenv");
const { json } = require("express/lib/response");
const jwt = require('jsonwebtoken');
const { query } = require("express");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

function verifyJwt(req,res,next){
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message:'unauthorized access'})
  }
  console.log('inside verifyJWT',authHeader)
  next()
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sctdy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("simply-blended").collection("juice");

    // auth 
    app.post('/login',async(req,res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
      res.send(accessToken)
    })


    // services api 
    app.get("/products", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      if (!result?.length) {
        res.send({ success: false, error: "No product found" });
      }
      res.send({ success: true, data: result });
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await userCollection.findOne(query);
      if (!service) {
        res.send({ success: false, error: "No product found" });
      }
      res.send({ success: true, data: service });
    });

    // post
    app.post("/products", async (req, res) => {
      const query = req.body;
      const result = await userCollection.insertOne(query);
      res.send(result);
    });

    // delete
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await userCollection.deleteOne(query);

      res.send(result);
    });

    // update
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateData.quantity
        },
      };
      const result =await userCollection.updateOne(filter,updateDoc,options)
      res.send(result);
    });

    // get my items 
    app.get('/myItems',verifyJwt,async(req,res)=>{
      const email = req.query.email
      const query = {email:email}
      const cursor = userCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
  } 
  finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello how are you?");
});

app.listen(port, () => {
  console.log("your port running now", port);
});
