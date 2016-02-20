L.mapbox.accessToken = 'pk.eyJ1IjoiZG91Z2xhc2FzdGFybmVzIiwiYSI6IkxfZ1ZxN1kifQ.ycBd3UWFRS08zAJJfxGkPw';
var overtonParkMap = L.mapbox.map('map', 'mapbox.run-bike-hike').setView([35.147203, -89.989724], 15);
$.ajax('https://www.inaturalist.org/observations.json?swlat=35.142358&swlng=-89.996579&nelat=35.150951&nelng=-89.981602', {
    success: function(data) {
        var geo = JSON.parse(data);
        var point = geo[0];
        var lat = point.latitude;
        var lng = point.longitude;
        var levittShellLayer = L.mapbox.featureLayer({
            type: 'Feature',
            geometry: {
                type: 'Point', 
                coordinates: [
                    -89.994076,
                    35.145983
                ]
            }
        });
        levittShellLayer.on('click', function() { alert(point.iconic_taxon_name); });
    }
});
    