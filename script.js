$(document).ready(function() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG91Z2xhc2FzdGFybmVzIiwiYSI6IkxfZ1ZxN1kifQ.ycBd3UWFRS08zAJJfxGkPw';
    var overtonParkMap = L.mapbox.map('map', 'mapbox.run-bike-hike').setView([35.147203, -89.989724], 15);
    // L.mapbox.styleLayer('mapbox://styles/mapbox/emerald-v8').addTo(overtonParkMap);
    var overtonParkPlantLayer = L.mapbox.featureLayer();
    overtonParkPlantLayer.addTo(overtonParkMap);
    overtonParkPlantLayer.on('click', function(e) { console.log(e.layer.feature.properties); });
    $.ajax('https://www.inaturalist.org/observations.json?swlat=35.142358&swlng=-89.996579&nelat=35.150951&nelng=-89.981602', {
        success: function(data) {
            features = [];
            $.each(data, function(i, point) {
              var lat = point.latitude;
              var lng = point.longitude;
              var feature = {
                type: 'Feature',
                properties: point,
                geometry: {
                  type: 'Point',
                  coordinates: [
                    lng,
                    lat
                  ]
                }
              };
              features.push(feature);
            });
            overtonParkPlantLayer.setGeoJSON({
              type: "FeatureCollection",
              features: features
            });
        }
      });
});
