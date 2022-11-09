const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');

//middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mktejfv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const servicesCollection = client.db('shutter-up').collection('services');
        const reviewsCollection = client.db('shutter-up').collection('reviews');

        ///reviews start

        //inserting a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        //getting all reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        ///reviews end

        ///services start
        //reading all services
        app.get('/services', async (req, res) => {
            const query = {};
            const limit = parseInt(req.query.limit);
            // console.log(limit)
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(limit).toArray();
            res.send(services);
        });


        //reading individual service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        //adding a service
        app.post('/services/', async (req, res) => {
            const service = req.body;
            // console.log(service);
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        });

        ///services end



        //search items
        app.get('/search', async (req, res) => {
            const searchString = req.query.string;
            const query = { $text: { $search: searchString } };
            const cursor = storeProductsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });


    }
    finally {

    }
};

run().catch(error => console.log(error));



app.get('/', (req, res) => {
    res.send('Shutter up server is running!');
});

app.listen(port, () => {
    console.log(`Shutter Up is running on port: ${port}`);
});