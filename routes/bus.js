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

router.get('/routes/:route/', function (req, res) {
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
});

// http://bustime.mta.info/api/where/stops-for-location.json?lat=40.748433&lon=-73.985656&latSpan=0.005&lonSpan=0.005


// Discovery data for a location:

router.get('/location/', function (req, res) {
  let options = Object.assign({}, discoveryRequestParams);
  options.uri += 'stops-for-location.json';
  if (req.query.lat && req.query.long) {
    options.qs.lat = req.query.lat;
    options.qs.lon = req.query.long;
  } else {
    let err = 'Params "lat" and "lon" are required. ' + req.query.lat + ' * ' + req.query.long;
    e(err);
    res.json({error: err});
  }
  
  options.qs.latSpan = 0.005;
  options.qs.lonSpan = 0.005;
  if (req.query.latSpan) {
    options.qs.latSpan = req.query.latSpan;
  }
  if (req.query.lonSpan) {
    options.qs.lonSpan = req.query.lonSpan;
  }
  
  rp(options)
  .then((resJSON) => {
    res.json(resJSON);
  })
  .catch((err) => {
    e(err);
    res.json({error: err});
  });
});



// Real time bus data for a specific stop

router.get('/routes/:route/:stop/', function (req, res) {
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