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
    const bidsCollection = db.collection("bids");
    const usersCollection = db.collection("users");

    //products: CREATE (POST)
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      //   console.log("user info", newProduct); // ক্লায়েন্ট পাঠানো ডেটা কনসোলে দেখাবে
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    //bids: CREATE (POST)
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    //users: CREATE (POST)
    app.post("/users", async (req, res) => {
      const newUser = req.body; //শুধু email বের করা হচ্ছে, যাতে দেখা যায় একই user আগেই আছে কি না।

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        //MongoDB এর findOne দিয়ে ডাটাবেসে ওই email আগে আছে কি না চেক করা হচ্ছে।
        res.send({
          message: "user already exists. do not need to insert again",
        });
      } else {
        //না থাকলে → insertOne(newUser) দিয়ে নতুন user ডাটাবেসে সংরক্ষণ হচ্ছে এবং result পাঠানো হচ্ছে।
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    //products: READ (GET all users)
    app.get("/products", async (req, res) => {
      // //.project(projectFields) → শুধু title, price_min, price_max, image দেখাবে
      // const projectFields = { title: 1, price_min: 1, price_max: 1, image: 1 };
      // // Products collection থেকে price_min অনুযায়ী ascending (বড় থেকে ছোট )
      // const cursor = productsCollection
      //   .find() //সব records
      //   .sort({ price_min: -1 }) //descending order
      //   .skip(2) //প্রথম 2 records বাদ
      //   .limit(2) //পরের 2 records নাও
      //   .project(projectFields); //শুধু নির্দিষ্ট fields দেখাও

      console.log(req.query);
      const email = req.query.email; //এখানে query parameter থেকে email বের করে নেওয়া হচ্ছে।
      //প্রথমে একটি খালি query অবজেক্ট বানানো হচ্ছে। এটি MongoDB-র find() ফাংশনে পাঠানো হবে।
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray(); //array আকারে fetch করো
      res.send(result);
    });

    //bids: READ (GET all users)
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray(); //array আকারে fetch করো
      res.send(result);
    });

    //products: READ (GET single user by ID)
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log("need user with id", id);
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //products: PATH (Server side)
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

    //products: DELETE
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
