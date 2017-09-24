# Real time tweet streaming app

Quick experiment with socketio and mapbox-gl heatmap to display real time tweet

To run locally:
- npm install
- set up your twitter configs in a `./config/twitterConf.js` file
- twitterConfig looks like:
```
    var credentials = {
        "consumer":{
            "key": "myConsumerKey",
            "secret": "myConsumerSecret"
        },
        "access_token":{
            "key": "myAccessToken",
            "secret": "myAccessSecret"
        }
    };

    module.exports =  credentials;
```

- `node server`
- navigate to `localhost:3000`

To change what topics you are tracking, change `client.track('topic');`
line in `server.js`

Currently, the app is deployed at https://live-tweet-heatmap.herokuapp.com/
(but no guarantees that it's still up and running when you stumble across this repo)
