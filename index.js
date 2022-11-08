const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        //services
        app.get('/services', async (req, res) => {
            const query = {};
            const limit = parseInt(req.query.limit);
            // console.log(limit)
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(limit).toArray();
            res.send(services);
        });



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