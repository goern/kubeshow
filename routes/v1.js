var fs = require('fs'),
  http = require("http"),
  winston = require('winston'),
  cors = require('cors'),
  express = require('express'),
  kube = require('node-kubernetes-client');

var consts = require('../consts.js');

var app = module.exports = express();

// lets describe the API we offer
app.get('/', cors(), function(req, res, next) {
  res.json({groupVersion: 'v1',
            meta: {
              name: ''+consts.APPLICATION_NAME,
              version: 'v'+consts.APPLICATION_VERSION
            }
          });
})

app.get('/info/:q', cors(), function (req, res, next) {
  var token = '';
  var query = req.params.q.trim();
  winston.info(Date.now() + " some client requested info on ", query);

  fs.readFile('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8', function (err,data) {
    if (err) {
      return winston.error(err);
    }
    winston.info(data);
    token = data;
  });


  var client = new kube({
      host:     'kubernetes',
      protocol: 'https',
      version:  'v1',
      token:    token
  });

  try {
    client.pods.get(function (err, pods) {
      winston.info('pods:', pods);
    });
  }
  catch (err) {
    winston.error("cant get pods... " + err.message);
  }

  res.send("info on " + query + " delivered");
});
