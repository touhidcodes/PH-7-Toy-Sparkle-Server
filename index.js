const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.57whvd4.mongodb.net/?retryWrites=true&w=majority`;

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
		client.connect();
		const toyCollection = client.db("toyDB").collection("toy_collection");

		// get all toys data
		app.get("/toys", async (req, res) => {
			const result = await toyCollection.find().toArray();
			res.send(result);
		});

		// get 20 limit data
		app.get("/all", async (req, res) => {
			const limit = 20;
			const result = await toyCollection.find().limit(limit).toArray();
			res.send(result);
		});

		// get individual data by id
		app.get("/details/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toyCollection.findOne(query);
			res.send(result);
		});

		// get specific user data by query parameter
		app.get("/my", async (req, res) => {
			let query = {};
			if (req.query?.email) {
				query = { sellerEmail: req.query.email };
			}
			const result = await toyCollection.find(query).toArray();
			res.send(result);
		});

		// get data by search name (query)
		app.get("/search", async (req, res) => {
			const limit = 20;
			let query = {};
			if (req.query?.search) {
				query = { toyName: req.query.search };
			} else {
				query = {};
			}
			const result = await toyCollection.find(query).limit(limit).toArray();
			res.send(result);
		});

		// get query to sort data
		app.get("/sort", async (req, res) => {
			const query = { sellerEmail: req.query.email };
			let options = {};
			if (req.query.by === "ascending") {
				options = {
					sort: { price: 1 },
				};
			}
			if (req.query.by === "descending") {
				options = {
					sort: { price: -1 },
				};
			}
			const result = await toyCollection.find(query, options).toArray();
			res.send(result);
		});

		// post toy data
		app.post("/add", async (req, res) => {
			const toy = req.body;
			const result = await toyCollection.insertOne(toy);
			res.send(result);
		});

		// update toy data
		app.patch("/my/:id", async (req, res) => {
			const id = req.params.id;
			const toy = req.body;
			const filter = { _id: new ObjectId(id) };
			const updatedToy = {
				$set: {
					price: toy.price,
					quantity: toy.quantity,
					description: toy.description,
				},
			};
			const options = { upsert: true };
			const result = await toyCollection.updateOne(filter, updatedToy, options);
			res.send(result);
			console.log(result);
		});

		//  delete toy data
		app.delete("/my/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toyCollection.deleteOne(query);
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
	res.send("Toy Sparkle is running...");
});

app.listen(port, () => {
	console.log(`Toy Sparkle app listening on port ${port}`);
});


