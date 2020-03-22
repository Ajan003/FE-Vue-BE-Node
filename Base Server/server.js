// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/db'); // connect to our database
var Employee     = require('./models/employee');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // do logging
    console.log('API Hit!');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Successful Server Hit!' });   
});
router.route('/AddEmployee')

    // create an employee
    .post(function(req, res) {
        
        var employee = new Employee();      // create a new instance of the Employee model
        employee.name = req.body.name;  // set the employees name (comes from the request)

        // save the employee and check for errors
        employee.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Employee created!' });
        });
        
    })
    router.route('/getEmployees').get(function(req, res) {
        Employee.find(function(err, employees) {
            if (err)
                res.send(err);

            res.json(employees);
        });
    });
    router.route('/getEmployee/:employee_id')

    // get the employee with that id
    .get(function(req, res) {
        Employee.findById(req.params.employee_id, function(err, employee) {
            if (err)
                res.send(err);
            res.json(employee);
        });
    });
    router.route('/updateEmployee/:employee_id')
    .put(function(req, res) {

        // use employee model to find the employee we want
        Employee.findById(req.params.employee_id, function(err, employee) {

            if (err)
                res.send(err);

            employee.name = req.body.name;  // update the employees info

            // save the employee
            employee.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Employee updated!' });
            });

        });
    });

    router.route('/deleteEmployee/:employee_id')
    // delete the employee with this id
    .delete(function(req, res) {
        Employee.remove({
            _id: req.params.employee_id
        }, function(err, employee) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
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