const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middlewears
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iikigzo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const mobileCollection = client.db('mobileStore').collection('mobiles');
        const phoneCollection = client.db('mobileStore').collection('phones');
        const userCollection = client.db('mobileStore').collection('users');
        const bookingsCollection = client.db('mobileStore').collection('bookings');

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

        app.get('/phones', async (req, res) => {
            let query = {}
            if (req.query.productCat) {
                query = {
                    productCat: req.query.productCat
                }
            }
            const cursor = phoneCollection.find(query);
            const phones = await cursor.toArray();
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

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await userCollection.findOne(query)
            res.send({ isBuyer: user?.category === 'buyer' })
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await userCollection.findOne(query)
            res.send({ isSeller: user?.category === 'seller' })
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await userCollection.findOne(query)
            res.send({ isAdmin: user?.category === 'admin' })
        })

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail }
            const user = await userCollection.findOne(query)
            if (user.category !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const UpdateDoc = {
                $set: {
                    category: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, UpdateDoc, options);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            console.log(user);
            res.status(403).send({ token: '' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
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
