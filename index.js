// Declare our dependencies
var fs = require('fs'),
  http = require('http'),
  https = require('https'),
  nodemailer = require('nodemailer'),
  express = require('express'),
  credentials = require('./credentials.js');

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');




StartServer();


// Here starts the main script of our backend!
function StartServer() {

    // Create our express app
    var app = express();

    console.log('running')
    //
    // Settings & middleware
    //

    // Get db up and running
    // var db = require('./server/models/db')

    // Set the view engine to use EJS as well as set the default views directory
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/public/views/');
    // This tells Express out of which directory to serve static assets like CSS and images
    app.use(express.static(__dirname + '/static'));


    // Spotify creds
    var client_id = credentials.client_id;
    var client_secret = credentials.client_secret;
    var redirect_uri = credentials.redirect_uri;
    var code = credentials.code;
    var access_token = '';
    var refresh_token = '';

    request.post(authOptions, function(error, response, body) {
      console.log('thee')
      console.log(response.statusCode)
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        refresh_token = body.refresh_token;
      } else {
        console.log('error')
        console.log(error)
      }
      });


    app.get('/auth', function (req, res) {
      res.render('login')
    })


    app.get('', function (req, res) {

      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
      var options = {
        url: 'https://api.spotify.com/v1/playlists/5gRXdj3PMdFpFrKmVRlFrO/tracks',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };

      console.log('requesting')
      // use the access token to access the Spotify Web API
      request.get(options, function(error, response, body) {
        console.log(body);
      });



      console.log('tje')
      var queue = [
        {
          'track': 'I DO EVERYTHING!',
          'artist': 'Masego',
          'user': 'Philip Claesson'
        },
        {
          'track': 'TJENA!',
          'artist': 'Stefanz',
          'user': 'Anders Andersson'
        },
        {
          'track': 'TJENA!',
          'artist': 'Stefanz',
          'user': 'Anders Andersson'
        },
        {
          'track': 'TJENA!',
          'artist': 'Stefanz',
          'user': 'Anders Andersson'
        },
        {
          'track': 'TJENA!',
          'artist': 'Stefanz',
          'user': 'Anders Andersson'
        },
        {
          'track': 'TJENA!',
          'artist': 'Stefanz',
          'user': 'Anders Andersson'
        }
      ]
      var history = ['old song', 'older song']

      res.render('queue', {'queue': queue, 'history': history})
    })

    // Spotify boilerplate
    var stateKey = 'spotify_auth_state';

    var generateRandomString = function(length) {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    app.get('/login', function(req, res) {
      console.log('tjeeeee')
      var state = generateRandomString(16);
      res.cookie(stateKey, state);

      // your application requests authorization
      var scope = 'user-read-private user-read-email';
      res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: client_id,
          scope: scope,
          redirect_uri: redirect_uri,
          state: state
        }));
    });

    app.get('/callback', function(req, res) {

      // your application requests refresh and access tokens
      // after checking the state parameter

      code = req.query.code || null;

      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
              refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });

    });

    app.get('/refresh_token', function(req, res) {

      // requesting access token from refresh token
      var refresh_token = req.query.refresh_token;
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token;
          res.send({
            'access_token': access_token
          });
        }
      });
    });

    // END of spotify boilerplate


    //
    // Email sender, sends emails on contacts to the homepage forms.
    //

    app.post('/contact/:type', function (req, res) {
      type = req.params.type

      if ((req.body.email.length > 0) && (type === "cta" || type === "message")){
        if (type === "cta"){
          var mailOptions = {
            from: 'philip@klimato.se',
            to: 'henric@klimato.se',
            replyTo: req.body.email,
            subject: 'Kontaktförfrågan från ' + req.body.email,
            text: 'Klimato har fått en kontaktförfrågan från ' + req.body.email
          };
        } else { // (type == "message")
          var mailOptions = {
            from: 'philip@klimato.se',
            to: 'henric@klimato.se',
            replyTo: req.body.email,
            subject: 'Meddelande från ' + req.body.name,
            text: "Meddelande från " + req.body.name + " (" + req.body.email + ") via formulär på Klimato.se. \n Meddelande: " + req.body.text
          };
      }

      var transporter = nodemailer.createTransport({
        host: 'email-smtp.eu-west-1.amazonaws.com',
        port: 587,
        secure: false,
        auth: {
          user: 'AKIAJCDTXBRNNZC7RNIA',
          pass: 'AgrQ9LjplqmQVJjkaEPbJVMfbidCiyI1Has7aaXpq8Br'
        }
      });

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent!');
        }
      });
      res.end("Success")

      } else {
          // do something
        res.status(500).send('Bad email request. ')
      }
    })


    //
    // Runs the server
    //

    var httpServer = http.createServer(app);
    httpServer.listen(3000)
}


