const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://smartdbUser:ZNVGEcjKXwIkQg2i@cluster0.0a7phnt.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("smart_db"); // smart_db ডাটাবেসের সাথে কানেকশন নিলাম
    const productsCollection = db.collection("products"); // products collection ধরলাম

    // CREATE (POST)
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      //   console.log("user info", newProduct); // ক্লায়েন্ট পাঠানো ডেটা কনসোলে দেখাবে
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // READ (GET all users)
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // READ (GET single user by ID)
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log("need user with id", id);
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //PATH (Server side)
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      //   console.log("to update", id, updatedProduct);

      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };

      const options = {};
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    // DELETE
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});
