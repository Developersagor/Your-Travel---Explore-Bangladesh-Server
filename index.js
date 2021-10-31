// require necessary methods
const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

// ----Midleware start----------
app.use(cors());
app.use(express.json());
//-----Midleware end------------

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.igq8i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ============ working area start here ===========================
async function run() {
  try {
    await client.connect();
    const database = client.db("allServices");
    const serviceCollection = database.collection("service");
    const ordersCollection = database.collection("orders");

    // POST services in database
    app.post("/addServices", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    // GET services from database and send client site
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find({}).toArray();
      res.json(result);
    });

    // POST Orders in DB from client site
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });
    // GET Orders from database and send to the client site
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.json(result);
    });

    // GET single orders
    app.get("/orders/:id", async (req, res) => {
      const result = await ordersCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    // delet order
    app.delete("/deleteOrder/:id", async (req, res) => {
      ordersCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => {
          res.send(result);
        });
    });

    // update status

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateStatus = {
        $set: {
          status: "Approved",
        },
      };
      const result = await ordersCollection.updateOne(query, updateStatus);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// ============ working area end here =============================

// testing server site
app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`App Server listening at http://localhost:${port}`);
});
