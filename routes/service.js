var express = require('express');
var router = express.Router();
var axios = require('axios');
var asyncLoop = require('node-async-loop');

var dataset = require('../models/dataset');
var lastUpdate = require('../models/lastUpdate');


/**
 * Endpoint:  /datasets
 * Method:    GET
 * Description: Get all the datasets.
 */
router.get('/datasets', function (req, res, next) {

    var db_query = {};
    if (req.query.q){
        var query = req.query.q;
        db_query = {
            $or: [
                {$text: {$search: query}},
                {name: {$regex: query, $options: "i"}}
            ]
        }
    }

    dataset.find(db_query).sort({name:1}).exec(function(err, datasets){
        if (err){
            return res.send(err);
        }
        // Build the API response
        var api_response = {};
        api_response.datasets = datasets
        api_response.statusCode = 200;
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    })
})

/**
 * Endpoint:  /last-update
 * Method:    GET
 * Description: Get the details of last updated time.
 */
router.get('/last-update', function(req, res, next){
    lastUpdate.find({}).exec(function(err, lastUpdated){
        if(err){
            return res.send(err);
        }

        var api_response = {};
        api_response.lastUpdate = lastUpdated;

        api_response.statusCode = 200;
        if (typeof lastUpdated[0] === 'undefined'){
            api_response.errorMsg = "Not Found"
            api_response.statusCode = 404;
        }
        api_response.executionTime = new Date().toLocaleString();
        res.status(api_response.statusCode).json(api_response);
    })
})

/**
 * Endpoint:  /datasets/:datasetIdOrName
 * Method:    GET
 * Description: Get all the information of the specified dataset.
 */
router.get('/datasets/:id', function (req, res, next) {
    var toFind = req.params.id;

    var regex = new RegExp(["^", toFind, "$"].join(""), "i");
    // Exec query
    dataset.find({
        $or:[{ _id: toFind}, {name: regex }]  // Case Insensitive
    }, function(err, datasets){
        if (err){
            return res.send(err);
        }
        // Build the API Response
        var api_response = {};
        api_response.dataset = datasets[0];
        api_response.statusCode = 200;
        if (typeof datasets[0] === 'undefined'){
            api_response.errorMsg = "Not Found"
            api_response.statusCode = 404;
        }
        api_response.executionTime = new Date();
        res.status(api_response.statusCode).json(api_response);
    });
})

/**
 * Endpoint:  /update
 * Method:    GET
 * Description: Used to manually synchronise the database.
 */
router.get('/update', function(req, res, next){
    var minesUrl = "http://registry.intermine.org/service/instances";

    dataset.remove({}, function (err) {
        if(err) {
            console.log(err);
        }
        axios.get(minesUrl)
            .then(function (response) {
                var mines = response.data.instances;

                var minesQueriedWithSuccess = 0;

                var datasetsRetrieved = 0;

                asyncLoop(mines, function (mine, next) {
                    var mineName = mine.name;
                    var mineUrl = mine.url;

                    var mineQuery = mineUrl + "/service/query/results?query=%3Cquery%20name%20%3D%20%22%22%20model%3D%22genomic%22%20view%3D%22DataSet.name%20DataSet.url%20DataSet.description%20DataSet.dataSource.description%20DataSet.dataSource.name%20DataSet.dataSource.url%22%20longDescription%3D%22%22%20sortOrder%3D%22DataSet.name%20asc%22%3E%0A%3C%2Fquery%3E";

                    axios.get(mineQuery)
                        .then(function (response) {
                            minesQueriedWithSuccess++;

                            dataset.find().exec(function (err, found) {
                                if(err){
                                    return res.send(err);
                                }

                                var results = response.data.results;

                                datasetsRetrieved += results.length;

                                for (var i = 0; i < results.length; i++){
                                    var newDatasetObject = {
                                        name:               results[i][0],
                                        url:                results[i][1],
                                        description:        results[i][2],
                                        datasourcename:     results[i][4],
                                        datasourcedescription:  results[i][3],
                                        datasourceurl:      results[i][5],
                                        minename:           mineName,
                                        mineurl:            mineUrl
                                    }

                                    var newDataset = new dataset(newDatasetObject);

                                    newDataset.save(function (err) {
                                        if (err){
                                            console.log("Error saving");
                                        }

                                    })
                                }
                            })
                            next();
                        })
                        .catch(function(error){
                            next();
                        })
                }, function (err) {
                    if(err){
                        console.log("Asyncloop failed");
                    }
                    console.log("Mines queried with success : " +  minesQueriedWithSuccess);
                    console.log("Datasets retrieved : " + datasetsRetrieved);

                    lastUpdate.remove({}, function (err) {
                        if(err){
                            console.log(err);
                        } else {
                            lastUpdate.find().exec(function (err, found) {
                                if(err){
                                    return res.send(err);
                                }

                                var lastUpdated = {
                                    lastUpdated: new Date(),
                                    minesQueried: minesQueriedWithSuccess
                                }

                                var newUpdate = new lastUpdate(lastUpdated);

                                newUpdate.save(function (err) {
                                    if(err){
                                        console.log("Last update recording failed");
                                    }
                                })
                            })
                        }
                    })
                });

            })
            .catch(function (error) {
                console.log(error);
            });

    })
    var api_response = {};
    api_response.message = "Database synchronise initiated";
    api_response.executionTime = new Date();
    api_response.statusCode = 200;
    res.status(api_response.statusCode).json(api_response);
})

module.exports = router;
