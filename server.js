var http = require("http"),
  winston = require('winston'),
  express = require('express'),
  cors = require('cors'),
  app = express();

var consts = require('./consts.js');

// These are the API versions known by now
var VERSIONS = {'API v1': '/v1'};

app.use(cors());

// route to display versions
app.get('/', function(req, res) {
    res.json(VERSIONS);
})

// versioned routes go in the routes/ directory
// import the routes
for (var k in VERSIONS) {
    app.use(VERSIONS[k], require('./routes' + VERSIONS[k]));
}

app.listen(8088, function () {
  winston.info("Server running at 0.0.0.0:8088/");
});

process.on('SIGTERM', function () {
  winston.info("Received SIGTERM. Exiting.")

  app.close();
  process.exit(0);
});
