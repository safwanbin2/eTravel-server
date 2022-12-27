const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mogpxeu.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).send({ message: "Unauthorized access" })
    }
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Unauthorized access" })
        }
        req.decoded = decoded;
    })
    next();
}

function run() {
    try {
        client.connect();
        console.log(`mongodb connected successfully`);
    } catch (error) {
        console.log(error)
    }
}

run();

// collections
const UsersCollection = client.db('eTravel').collection('users');

app.get('/', (req, res) => {
    res.send("eTravel server is running fine");
})

// saving users
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        const filter = { email: newUser.email };
        const exist = await UsersCollection.findOne(filter);
        if (exist) {
            return res.send({ message: "User already exist" });
        }
        const result = await UsersCollection.insertOne(newUser);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})
// assigning jwt token
app.get('/jwt/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const accessToken = jwt.sign(process.env.JWT_SECRET, email);
        res.send({ accessToken: accessToken });
    } catch (error) {
        console.log(error);
    }
})










app.listen(port, () => console.log(`eTravel server is running on ${port}`));