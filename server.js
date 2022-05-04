const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
var formidable = require('formidable');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const mongodb = require('mongodb')
const connectionString = 'mongodb+srv://edoso:edoso@cluster0.tgkx6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
app.use('/public', express.static('public'));

MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {

        console.log(__dirname)
        const db = client.db('edoso')
        const medsCollection = db.collection('medicines')

        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            );
            next();
        });

        app.get('/meds', (req, res) => {
            medsCollection.find({ client: req.query.id }).toArray()
                .then(results => {
                    res.send(results);
                })
                .catch(error => console.error(error))
        })

        app.post('/meds', (req, res) => {
            console.log(req.body)
            var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

            require("fs").writeFile("public/" + req.body.imageName, base64Data, 'base64', function (err) {
                console.log(err);
            });
            req.body.image = undefined; 
            medsCollection.insertOne(req.body)
                .then(result => {
                    res.sendStatus(201)
                })
                .catch(error => console.error(error))
        })

        app.delete('/meds', (req, res) => {
            medsCollection.deleteOne({ _id: new mongodb.ObjectId(req.query.id) })
                .then(
                    result => {
                        res.sendStatus(200)
                    }
                )
                .catch(error => console.error(error))
        })
        let port = process.env.PORT;
        if (port == null || port == "") {
            port = 3000;
        }
        app.listen(port, function () {
            console.log('listening on ' + port)
        })
    })
    .catch(error => console.error(error))

function saveImage(baseImage) {
    //path of folder where you want to save the image.
    const localPath = `/images/`;
    //Find extension of file
    const ext = baseImage.substring(baseImage.indexOf("/") + 1, baseImage.indexOf(";base64"));
    const fileType = baseImage.substring("data:".length, baseImage.indexOf("/"));
    //Forming regex to extract base64 data of file.
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, 'gi');
    //Extract base64 data.
    const base64Data = baseImage.replace(regex, "");
    const rand = Math.ceil(Math.random() * 1000);
    //Random photo name with timeStamp so it will not overide previous images.
    const filename = `Photo_${Date.now()}_${rand}.${ext}`;

    //Check that if directory is present or not.
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);
    }
    fs.writeFileSync(localPath + filename, base64Data, 'base64');
    return { filename, localPath };
}