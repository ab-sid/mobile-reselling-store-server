const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middlewears
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iikigzo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const mobileCollection = client.db('mobileStore').collection('mobiles');
        const phoneCollection = client.db('mobileStore').collection('phones');

        app.get('/mobileBrands', async (req, res) => {
            const query = {}
            const cursor = mobileCollection.find(query);
            const mobileBrands = await cursor.toArray();
            res.send(mobileBrands);
        })

        app.get('/mobileBrands/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const mobileBrand = await mobileCollection.findOne(query);
            res.send(mobileBrand);
        })

        //phone api

        app.post('/addPhone', async (req, res) => {
            const phone = req.body;
            const result = await phoneCollection.insertOne(phone);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send('mobile-reselling-server is running');
})

app.listen(port, () => {
    console.log(`mobile-reselling-server is running on ${port}`);
})
