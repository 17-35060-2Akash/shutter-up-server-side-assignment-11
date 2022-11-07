const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');

//middlewares
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Shutter up server is running!');
});

app.listen(port, () => {
    console.log(`Shutter Up is running on port: ${port}`);
});