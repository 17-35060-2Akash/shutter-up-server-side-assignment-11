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

function verifyJWT(req, res, next) {
    // console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access!' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res.status(401).send({ message: 'unauthorized access!' });
        }
        req.decoded = decoded;
        next();
    });
}




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

        //getting service wise reviews
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { serviceId: id };
            // const cursor = reviewsCollection.find(query).sort({ _id: -1 });
            const cursor = reviewsCollection.find(query).sort({ fullDateTime: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        //getting email wise reviews and using jwt
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            // console.log(decoded);

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Forbidden Access!' });
            }


            const query = {
                email: req.query.email
            };
            // const cursor = reviewsCollection.find(query).sort({ _id: -1 });
            const cursor = reviewsCollection.find(query).sort({ fullDateTime: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        //getting a specific review
        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewsCollection.findOne(query);
            res.send(review);
        });

        //updating a review
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const prevReview = req.body;
            // console.log(prevReview);

            const option = { upsert: true };
            const updatedReview = {
                $set: {
                    comment: prevReview.comment,
                }
            }

            const result = await reviewsCollection.updateOne(query, updatedReview, option);
            res.send(result);

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

        //reading latest services
        app.get('/latestservices', async (req, res) => {
            const query = {};
            const limit = parseInt(req.query.limit);
            const avoid = parseInt(req.query.avoid);
            console.log(avoid, limit);
            const cursor = servicesCollection.find(query);
            const services = await cursor.skip(avoid).limit(limit).toArray();
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

        //deletion
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        ///services end

        //jwt token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
            res.send({ token });
        });





        ///search items
        app.get('/search', async (req, res) => {
            const searchString = req.query.string;
            // console.log(searchString);
            const query = { $text: { $search: searchString } };
            const cursor = servicesCollection.find(query);
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