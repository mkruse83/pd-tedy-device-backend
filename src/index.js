const express = require('express');
const IOTService = require('./iotService');
const cors = require('cors')

const app = express();
const iotService = new IOTService();

app.use(cors())

app.get('/state/', function (req, res) {
  console.log('Current State: ' + JSON.stringify(iotService.state));
  res.json(iotService.state);
});

app.get('/init/:thing', function(req, res) {
  iotService.init(req.params.thing);
  res.send(200);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});