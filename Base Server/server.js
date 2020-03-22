// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("mydb");
    dbo.createCollection("employees", function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
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
router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // do logging
    console.log('API Hit!');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'Successful Server Hit!' });
});
router.route('/AddEmployee')
    .post(function (req, res) {
        const employee = {
            id: req.body.id,
            name: req.body.name,
        }
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("employees").insertOne(employee, function (err, result) {
                if (err) throw err;
                res.json({ message: '1 document inserted!' });
                db.close();
            });
        });
    });
router.route('/getEmployees').get(function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("employees").find({}).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            res.json(result)
            db.close();
        });
    });
});
router.route('/getEmployee/:employee_id')
    .get(function (req, res) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var query = {
                id: +req.params.employee_id,
            }
            console.log(query)
            dbo.collection("employees").findOne(query, function (err, result) {
                if (err) throw err;
                console.log(result.name);
                res.json(result)
                db.close();
            });
        });
    });
router.route('/updateEmployee/:employee_id')
    .put(function (req, res) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myquery = { id: +req.params.employee_id };
            var newvalues = { $set: { name: req.body.name } };
            dbo.collection("employees").updateOne(myquery, newvalues, function (err, result) {
                if (err) throw err;
                res.json({ message: '1 document updated!' });
                db.close();
            });
        });
    });

router.route('/deleteEmployee/:employee_id')
    .delete(function (req, res) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var myquery = { id: +req.params.employee_id };
            dbo.collection("employees").deleteOne(myquery, function (err, obj) {
                if (err) throw err;
                res.json({ message: '1 document deleted!' });
                db.close();
            });
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