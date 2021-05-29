
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 4000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a3ov0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const booksCollection = client.db(process.env.DB_NAME).collection("books");
    const readingList = client.db(process.env.DB_NAME).collection("readingList");
    const finishedList = client.db(process.env.DB_NAME).collection("finishedList");

    app.get("/books", (req,res) => {
        booksCollection.find({})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })

    app.get("/readingList/:user", (req,res) => {
        readingList.find({user:req.params.user})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })

    app.get("/finishedList/:user", (req,res) => {
        finishedList.find({user:req.params.user})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })

    app.post("/addToReadingList", (req, res) => {
        const {id, title, author, coverImageUrl, pageCount, publisher, synopsis} = req.body.book
        const user = req.body.user;
        readingList.insertOne({id, title, author, coverImageUrl, pageCount, publisher, synopsis, user})
        .then(result => res.send(result.insertedCount > 0))
    })

    app.post("/addToFinishedList", (req,res) => {
        const {id, title, author, coverImageUrl, pageCount, publisher, synopsis} = req.body.book
        const user = req.body.user
        finishedList.insertOne({id, title, author, coverImageUrl, pageCount, publisher, synopsis, user})
        .then(result => res.send(result.insertedCount > 0))
    })

    app.delete("/removeFromReading/:id", (req,res) => {
        const user = req.body.user
        readingList.deleteOne({id:req.params.id, user:user})
        .then(result => {
            res.send(result.deletedCount > 0)
        })
    })

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port)