/**
 * lastUpdate Model.
 */
// Registry Connection
var mongoose = require('mongoose');

// mongoose.connect(process.env.MONGODB_URL);
// mongoose.connect("mongodb://127.0.0.1:27017/lastUpdate");
mongoose.connect("mongodb://heroku_jwd5nd8c:c59q95k7f3rc8iobnad6qbbc17@ds111059.mlab.com:11059/heroku_jwd5nd8c");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema Modeling
var Schema = mongoose.Schema;

var schema = new Schema({
        lastUpdated:        Date,
        minesQueried:       Number
    },
    {
        collection: 'lastUpdate'
    }
);

var lastUpdate = mongoose.model("lastUpdate", schema);
module.exports = lastUpdate;
