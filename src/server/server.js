var fs = require('fs');
var httpProxy = require('http-proxy');
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();

app.use(function (req, res, next) {
    console.log(req);
    if (req.url === '/') {
      console.log("Transforming response");

      var _write = res.write;

      // Rewrite the livereload port with our secure one
      res.write = function (data) {
        _write.call(res, data.toString().replace('35729', '35700'), 'utf8');
      }
    }

    proxy.web(req, res);
  }
);

// Proxy fpr connect server to use
var proxy = httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 8100
  }
});

//https://matoski.com/article/node-express-generate-ssl/
var secureServer = https.createServer({ 
    key: fs.readFileSync('./server.key'), 
    cert: fs.readFileSync('./server.crt'), 
    ca: fs.readFileSync('./ca.crt'), 
    requestCert: true, 
    rejectUnauthorized: false 
}, app).listen('8101', function() { 
    console.log('Secure Express server listening on port 8101'); 
});
//x8LGP2d3VEn41IbtcSPMaz2xnmTFPf4KShnmWpUOmC2HsjEO2P