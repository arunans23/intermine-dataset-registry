/**
 * Dataset Model.
 */
// Dataset Connection
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema Modeling
var Schema = mongoose.Schema;

var schema = new Schema({
        name:               {type: String, index:  true},
        url:                String,
        description:        String,
        datasourcename:     String,
        datasourcedescription:  String,
        datasourceurl:      String,
        minename:           String,
        mineurl:            String
    },
    {
        collection: 'dataset'
    }
);

// Create Text index on description field
schema.index({description: "text"});

var dataset = mongoose.model("dataset", schema);
module.exports = dataset;
