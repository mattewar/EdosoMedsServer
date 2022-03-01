const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const mongodb = require('mongodb')
const connectionString = 'mongodb+srv://edoso:edoso@cluster0.tgkx6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('edoso')
        const medsCollection = db.collection('medicines')

        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header(
              'Access-Control-Allow-Headers',
              'Origin, X-Requested-With, Content-Type, Accept'
            );
            next();
          });

        app.get('/meds', (req, res) => {
            medsCollection.find({client:req.query.id}).toArray()
                .then(results => {
                    res.send(results);
                })
                .catch(error => console.error(error))
        })

        app.post('/meds', (req, res) => {
            medsCollection.insertOne(req.body)
                .then(result => {
                    res.sendStatus(201)
                })
                .catch(error => console.error(error))
        })

        app.delete('/meds', (req, res) => {
            medsCollection.deleteOne(
                { _id: new mongodb.ObjectId(req.query.id) }
            ).then(
                result => {
                    res.sendStatus(200)
                }
            )
                .catch(error => console.error(error))
        })
        app.listen(3000, function () {
            console.log('listening on 3000')
        })
    })
    .catch(error => console.error(error))

