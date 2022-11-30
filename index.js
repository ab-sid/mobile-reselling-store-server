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
        const userCollection = client.db('mobileStore').collection('users');

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

        app.get('/myphones', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            const phones = await phoneCollection.find(query).toArray();
            res.send(phones);
        })

        app.post('/phones', async (req, res) => {
            const phone = req.body;
            const result = await phoneCollection.insertOne(phone);
            res.send(result);
        })

        //users api
        app.get('/seller', async (req, res) => {
            const query = { category: 'seller' };
            const seller = await userCollection.find(query).toArray();
            res.send(seller);
        })

        app.get('/buyer', async (req, res) => {
            const query = { category: 'buyer' };
            const seller = await userCollection.find(query).toArray();
            res.send(seller);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
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
