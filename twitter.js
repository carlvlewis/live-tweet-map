const Twitter = require('node-tweet-stream');// require('twitter');

const credentials = require('./config/twitterConf');

const client = new Twitter({
    consumer_key: process.env.twitConsumerKey || credentials.consumer.key,
    consumer_secret: process.env.twitConsumerSecret || credentials.consumer.secret,
    token: process.env.twitAcessToken ||credentials.access_token.key,
    token_secret: process.env.twitAcessTokenSecret || credentials.access_token.secret
});


client.on('tweet', function(tweet) {
    io.emit('tweet', tweet);
});

client.on('error', function (err) {
    console.log('error!!!', err);
});

client.track('javascript');