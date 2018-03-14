/**
 * Scheduled cron for the InterMine Registry automatic Update taks.
 * This script is excecuted every 24 hours at 00:00:00 server time.
 */
var cron = require('node-cron');
var asyncLoop = require('node-async-loop');
var axios = require('axios');
var dataset = require('../models/dataset');

// Every 24 hours: 0 0 * * *
cron.schedule('0 0 * * *', function(){
    var minesUrl = "http://registry.intermine.org/service/instances";

    dataset.remove({}, function (err) {
        if(err) {
            console.log(err);
        }
        axios.get(minesUrl)
            .then(function (response) {
                var mines = response.data.instances;

                var minesQueriedWithSuccess = 0;
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
});
