const rp = require('request-promise-native');

const express = require('express')
var router = express.Router()

const e = require('../helpers/error').log;


// Full documentation here:
// http://bustime.mta.info/wiki/Developers/SIRIStopMonitoring

var realTimeRequestParams = {
  uri: 'https://bustime.mta.info/api/siri/stop-monitoring.json',
  qs: {
    key: process.env.BUSTIME_KEY, // Request a key here: http://bustime.mta.info/wiki/Developers/Index
    version: '2', // either '1' or '2'
    OperatorRef: 'MTA', // Always 'MTA'
    MonitoringRef: null, // ** ADD Stop ID
    LineRef: 'MTA NYCT_', // ** UPDATE Add line ID to the end
    //DirectionRef: null, // ** ADD Either 0 or 1 (optional)
    StopMonitoringDetailLevel: 'calls', // options: 'minimum', 'basic', 'normal', 'calls'
    MaximumNumberOfCallsOnwards: 10,
    MaximumStopVisits: 10,
    MinimumStopVisitsPerLine: 3
  },
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true
}

// Full documentaiton here:
// http://bustime.mta.info/wiki/Developers/OneBusAwayRESTfulAPI

// http://bustime.mta.info/api/where/stops-for-location.json?lat=40.748433&lon=-73.985656&latSpan=0.005&lonSpan=0.005&key=69f9c12c-d751-4e16-8bd7-a12aaf8c7b0e

var discoveryRequestParams = {
  uri: 'http://bustime.mta.info/api/where/',
  qs: {
    key: process.env.BUSTIME_KEY
  },
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true
}

router.get('/', function (req, res) {
  res.send('<h1>Bus</h1>')
});

// list of routes:
router.get('/routes/', (req, res) => {
  let options = Object.assign({}, discoveryRequestParams);
  options.uri += 'routes-for-agency/MTA%20NYCT.json';
  rp(options)
  .then((resJSON) => {  
    res.json(resJSON);
  })
  .catch((err) => {
    e(err);
    res.json({error: err});
  });
});


// Info about a bus Route or a bus Stop:

// real: http://bustime.mta.info/api/where/stops-for-route/MTA NYCT_B38.json
// mine: http://bustime.mta.info/api/where/routes-for-agency/MTA%20NYCT_B38.json",

router.get('/:route/', function (req, res) {
  let options = Object.assign({}, discoveryRequestParams);
  options.uri += 'stops-for-route/MTA NYCT_' + req.params.route.toUpperCase() + '.json';
  options.qs.includePolylines = false;
  options.qs.version = 2;
  rp(options)
  .then((resJSON) => {
    res.json(resJSON);
  })
  .catch((err) => {
    e(err);
    res.json({error: err});
  });
  //
  //
});


// Real time bus data for a specific stop

router.get('/:route/:stop/', function (req, res) {
  let options = Object.assign({}, realTimeRequestParams);
  options.qs.MonitoringRef = req.params.stop;
  options.qs.LineRef = 'MTA NYCT_' + req.params.route.toUpperCase();
  //options.qs.DirectionRef = 1;
  
  console.log(JSON.stringify(options))
  
  rp(options)
  .then((resJSON) => {
    
    console.log(JSON.stringify(resJSON));
    res.json(resJSON);
    
  })
  .catch((err) => {
    e(err);
    res.json({error: err});
  });
});



module.exports = router