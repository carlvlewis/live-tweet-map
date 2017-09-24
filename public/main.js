(function () {
    mapboxgl.accessToken = 'pk.eyJ1Ijoid3d5bWFrIiwiYSI6IkxEbENMZzgifQ.pxk3bdzd7n8h4pKzc9zozw';
    const socket = io();
    // const socket = io('http://localhost:3000');
    let tweetTextArr = [];
    let latLngArr = [];
    let convertLngLatToGeojson = function (latLngArr) {
        let geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        latLngArr.forEach(d => geojson.features.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [d[0], d[1]]
            }
        }));
        return geojson;
    };
    let plotMarkers = function (map, geojsonData) {
        if(map.getSource('geojsonData')){
            map.getSource('geojsonData').setData(geojsonData);
            return;
        }
        map.addSource("geojsonData", {
            type: "geojson",
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 15, // Max zoom to cluster points on
            clusterRadius: 20
        });

        let layers = [
            [0, 'green'],
            [10, 'orange'],
            [100, 'red']
        ];

        layers.forEach(function (layer, i) {
            map.addLayer({
                "id": "cluster-" + i,
                "type": "circle",
                "source": "geojsonData",
                "paint": {
                    "circle-color": layer[1],
                    "circle-radius": 70,
                    "circle-blur": 1 // blur the circles to get a heatmap look
                },
                "filter": i === layers.length - 1 ?
                    [">=", "point_count", layer[0]] :
                    ["all",
                        [">=", "point_count", layer[0]],
                        ["<", "point_count", layers[i + 1][0]]]
            });
        });

        map.addLayer({
            id: 'tweetLocations',
            type: 'circle',
            source: 'geojsonData',
            "paint": {
                "circle-color": 'rgba(0,255,0,0.5)',
                "circle-radius": 20,
                "circle-blur": 1
            },
            "filter": ["!=", "cluster", true]
        });

    };

    let pushQueue = function (data) {
        let maxLen = 10;
        if(tweetTextArr.length < maxLen) {
            tweetTextArr.push(data);
        } else {
            let tweetTextArr2 = tweetTextArr.splice(1);
            tweetTextArr2.push(data);
            tweetTextArr = tweetTextArr2;
        }
    };
    let tweetDisplay = function (tweetTextArr) {
        let htmlString = "";
        tweetTextArr.forEach(d => {
            htmlString += `
            <div>
                <h4>${d.userName}</h4>
                <p>${d.text}</p>
            </div>
            `
        })
        $("#tweets").empty();
        $("#tweets").append(htmlString);
    }
    // map setup
    let mapDisplay = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/wwymak/cj5mix0vr3gom2rqovhi5cix9',
        zoom: 2,
        center: [-95, 35]
    });
    mapDisplay.addControl(new mapboxgl.NavigationControl());



    socket.on('tweet', function (data) {
        // console.log(data);
        if(data.coordinates) {latLngArr.push(data.coordinates)};
        pushQueue(data);
        tweetDisplay(tweetTextArr);
    });

    let ticks = 0;
    let timer = setInterval(() => {
        // latLngArr = latLngArr.slice(0.5 * latLngArr.length, latLngArr.length)
        let geojson = convertLngLatToGeojson(latLngArr);
        plotMarkers(mapDisplay, geojson);
        ticks+=1;
        if(ticks > 20) {
            latLngArr = latLngArr.slice(0.5 * latLngArr.length, latLngArr.length);
            ticks=0;
        }
    }, 3000);

    let stopTime = function() {
        clearInterval(timer);
    }
})();