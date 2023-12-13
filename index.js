const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: ["https://mern-job-five.vercel.app"],
    methods: ["POST", "GET", "DELETE", "PATCH"],
    credentials: true
}));

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jhxvd7t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToMongoDB() {
    await client.connect();
    return client.db('mernJobPortal').collection('mernJobCollection');
}

// Routes
app.post('/post-job', async (req, res) => {
    try {
        const jobCollection = await connectToMongoDB();
        const body = req.body;
        body.createAt = new Date();
        const result = await jobCollection.insertOne(body);

        if (result.insertedId) {
            console.log(body);
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ message: 'Can not insert, try again', status: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error', status: false });
    }
});

app.get('/all-jobs', async (req, res) => {
    const jobCollection = await connectToMongoDB();
    const jobs = await jobCollection.find({}).toArray();
    res.send(jobs);
});

app.get('/my-jobs/:email', async (req, res) => {
    const jobCollection = await connectToMongoDB();
    const jobs = await jobCollection.find({ postedBy: req.params.email }).toArray();
    res.send(jobs);
});

app.delete('/job/:id', async (req, res) => {
    const jobCollection = await connectToMongoDB();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await jobCollection.deleteOne(filter);
    res.send(result);
    console.log(result);
});

app.get('/all-jobs/:id', async (req, res) => {
    const jobCollection = await connectToMongoDB();
    const id = req.params.id;
    const job = await jobCollection.findOne({ _id: new ObjectId(id) });
    res.send(job);
});

app.patch('/update-job/:id', async (req, res) => {
    const jobCollection = await connectToMongoDB();
    const id = req.params.id;
    const jobdata = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            ...jobdata
        },
    };
    const result = await jobCollection.updateOne(filter, updateDoc, options);
    res.send(result);
});

// Ping MongoDB
app.get('/', (req, res) => {
    res.send('Hello developer');
});

app.get('/hi', (req, res) => {
    res.send('Hii');
});

// Server start
app.listen(port, () => {
    console.log('Listening on port ', port);
});
