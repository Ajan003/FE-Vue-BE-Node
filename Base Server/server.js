// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

let dataBase
let dataBaseObject
MongoClient.connect(url, (err, db) => {
    if (err) throw err;
    console.log("Database created!");
    dataBase = db
    dataBaseObject = db.db("mydb");
    dataBaseObject.createCollection("employees", (err, res) => {
        if (err) throw err;
        console.log("Collection created!");
    });
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // do logging
    console.log('API Hit!');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
    res.json({ message: 'Successful Server Hit!' });
});
router.route('/AddEmployee')
    .post((req, res) => {
        const employee = {
            id: req.body.id,
            name: req.body.name,
        }
        dataBaseObject.collection("employees").insertOne(employee, (err, result) => {
            if (err) throw err;
            res.json({ message: '1 document inserted!' });
        });
    });
router.route('/getEmployees').get((req, res) => {
    dataBaseObject.collection("employees").find({}).toArray((err, result) => {
        if (err) throw err;
        console.log(result);
        res.json(result)
    });
});
router.route('/getEmployee/:employee_id')
    .get((req, res) => {
        var query = {
            id: +req.params.employee_id,
        }
        console.log(query)
        dataBaseObject.collection("employees").findOne(query, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.json(result)
        });
    });
router.route('/updateEmployee')
    .put((req, res) => {
        var myquery = { id: +req.body.id };
        var newvalues = { $set: { name: req.body.name } };
        dataBaseObject.collection("employees").updateOne(myquery, newvalues, (err, result) => {
            if (err) throw err;
            res.json({ message: '1 document updated!' });
        });
    });

router.route('/deleteEmployee')
    .delete((req, res) => {
        var myquery = { id: +req.body.id };
        dataBaseObject.collection("employees").deleteOne(myquery, (err, obj) => {
            if (err) throw err;
            res.json({ message: '1 document deleted!' });
        });
    });

process.on('SIGINT', function () {
    dataBase.close(function () {
        console.log('MongoClient disconnected on app termination');
        process.exit(0);
    });
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started on port ' + port);