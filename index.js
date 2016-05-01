// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var SimpleMailgunAdapter = require('parse-server/lib/Adapters/Email/SimpleMailgunAdapter');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_h6zg9h0d:2o2djeebl7gu50vvqi0ilhab4b@ds011462.mlab.com:11462/heroku_h6zg9h0d',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'emailTestAppId',
  masterKey: process.env.MASTER_KEY || 'emailTestMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://emailtest01.herokuapp.com/parse',  // Don't forget to change to https if needed
  publicServerURL: "http://emailtest01.herokuapp.com/parse",
  emailAdapter: new SimpleMailgunAdapter({
    apiKey: 'key-b54a309ea20924558ea6f22a007bb8ee',
    domain: 'sandboxb6015be984e349a4a51038c5e18fc422.mailgun.org',
    fromAddress: 'creativesoftwareios@gmail.com'
  }),
  customPages: {
    invalidLink: 'http://yourpage/link_invalid.html',
    verifyEmailSuccess: 'http://yourpage/verify_email_success.html',
    choosePassword: 'http://yourpage/new_password.html',
    passwordResetSuccess: 'http://yourpage/sucess.html'
  }
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
