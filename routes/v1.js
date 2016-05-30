var fs = require('fs'),
  http = require("http"),
  winston = require('winston'),
  cors = require('cors'),
  express = require('express'),
  Client = require('node-kubernetes-client');

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

// get info on kubernetes node id or, if id is not supplied on all nodes
var getNodeInfo = function(id) {
  var token = '';

  // lets read the token, it is part of the pod's filesystem,
  // see http://kubernetes.io/docs/user-guide/accessing-the-cluster/#accessing-the-api-from-a-pod
  fs.readFile('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8', function (err,data) {
    if (err) {
      winston.error(err);
      return {"error": err}
    }

    token = data;
  });

  // connectiong to the Kube API server is described at
  // http://kubernetes.io/docs/user-guide/accessing-the-cluster/#accessing-the-api-from-a-pod
  var client = new Client({
      host:     'kubernetes:'+process.env.KUBERNETES_SERVICE_PORT,
      protocol: 'https',
      version:  'v1',
      token:    token
  });

  // and lets get a list of all kubernetes nodes
  try {
    client.nodes.get(function (err, nodesArr) {
      if (!err) {
        winston.info('kubernetes nodes: ' + JSON.stringify(nodesArr));
        return nodesArr[0].items;
      }
    });
  }
  catch (err) {
    winston.error("cant get nodes... " + err.message);
    return {"error": err}
  }
}

app.get('/info/nodes', cors(), function (req, res, next) {
  winston.info(Date.now() + " some client requested to get a list of all nodes");

  res.send(getNodeInfo());
});

app.get('/info/node/:id', cors(), function (req, res, next) {
  var nodeId = req.params.id

  winston.info(Date.now() + " some client requested to get info about node "+nodeId);

  res.send(getNodeInfo(nodeId));
});
