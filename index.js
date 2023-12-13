const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');


app.use(express.json()); // Use express.json() middleware for parsing JSON data

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors())
app.use(cors(
    {
        origin: ["https://mern-job-five.vercel.app"],
        methods: ["POST", "GET", "DELETE", "PATCH"],
        credentials: true
    }
));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jhxvd7t.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        // create db
        const db = client.db('mernJobPortal');
        const jobCollection = db.collection('mernJobCollection');

        // post a job
        app.post('/post-job', async (req, res) => {
            const body = req.body;
            body.createAt = new Date();
            const result = await jobCollection.insertOne(body);

            try {
                if (result.insertedId) {
                    console.log(body)
                    return res.status(200).send(result);
                } else {
                    return res.status(404).send({ message: 'Can not insert, try again', status: false });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).send({ message: 'Internal Server Error', status: false });
            }
        });

        // get all jobs
        app.get('/all-jobs', async (req, res) => {
            const jobs = await jobCollection.find({}).toArray(); // Correct variable name to jobCollection
            res.send(jobs);
        });

        //get jobs by email 
        app.get('/my-jobs/:email', async (req, res) => {
            const jobs = await jobCollection.find({ postedBy: req.params.email }).toArray();
            res.send(jobs)
        })

        delete job
        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await jobCollection.deleteOne(filter);
            res.send(result);
            console.log(result)
        })

        // app.delete('/job/:id', async (req, res) => {
        //     try {
        //         const id = req.params.id;
        //         const filter = { _id: id }; // No need for new Object(id)
        //         const result = await jobCollection.deleteOne(filter);

        //         if (result.deletedCount === 1) {
        //             res.status(200).json({ acknowledged: true });
        //         } else {
        //             res.status(404).json({ acknowledged: false, error: 'Job not found' });

        //         }

        //         console.log(result);
        //     } catch (err) {
        //         console.error(err);
        //         res.status(500).json({ acknowledged: false, error: 'Internal server error' });
        //     }
        // });


        app.get('/all-jobs/:id', async (req, res) => {
            const id = req.params.id;
            const job = await jobCollection.findOne({
                _id: new ObjectId(id)
            })
            res.send(job);
        })

        //update
        app.patch('/update-job/:id', async (req, res) => {
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
        })

        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");
    } finally {
        // Do not close the MongoDB connection here; keep the connection open for your Express app
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello developer');
});

app.get('/hi', (req, res) => {
    res.send('Hii');
});



app.listen(port, () => {
    console.log('listening on port ', port);
});
