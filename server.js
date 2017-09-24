'use strict';

const express = require("express");
const http = require('http');
const geocoder = require('geocoder');
// Setup server
const app = express();
console.log('here', process.env)
const bodyParser = require('body-parser');
const server = http.createServer(app);
const io = require('socket.io')(server);
const Twitter = require('node-tweet-stream');// require('twitter');
let credentials;
if(process.env.environment !== 'production'){
    credentials = require('./config/twitterConf');
}

const client = new Twitter({
    consumer_key: process.env.twitConsumerKey || credentials.consumer.key,
    consumer_secret: process.env.twitConsumerSecret || credentials.consumer.secret,
    token: process.env.twitAcessToken ||credentials.access_token.key,
    token_secret: process.env.twitAcessTokenSecret || credentials.access_token.secret
});


client.on('tweet', function(tweet) {

    let obj = {
        id: tweet.id,
        coordinates: tweet.coordinates,
        created_at: tweet.created_at,
        text: tweet.text,
        userLoc: tweet.user.location,
        userName: tweet.user.name
    };
    if(tweet.coordinates && tweet.coordinates.coordinates ) {
        tweet.coordinates= tweet.coordinates.coordinates;
        console.log(obj)
        io.emit('tweet', obj);
    } else if(tweet.user.location) {
        geocoder.geocode(tweet.user.location, (err, data) => {
            if(!err && data.results && data.results.length > 0) {
                console.log(data.results[0].geometry)
                let latlng = data.results[0].geometry.location;
                obj.coordinates=[latlng.lng, latlng.lat]
                console.log(obj);
                io.emit('tweet', obj);
            } else {
                io.emit('tweet', obj);
            }
        })
    } else {
        io.emit('tweet', obj);
    }


});

client.on('error', function (err) {
    console.log('error!!!', err);
});

client.track('earthquake,mexicoquake');

io.on('connection', function (socket) {
    console.log('connection')
    socket.emit('news', { hello: 'world' });
});

app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), () => {
    console.log('Express server listening on %d', app.get('port'));
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Api Routes
// app.use('/api/get-towers', require('./api/getTowersInfo'));
// app.use('/api/get-carriers-count', require('./api/getCarriersInfo'));
app.use(express.static('public'));

// All other routes should redirect to the index.html
app.route('/')
    .get((req, res) => {
        res.sendFile(__base + 'public/index.html')
    });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});