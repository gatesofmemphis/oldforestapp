$(document).ready(function() {

    L.mapbox.accessToken = 'pk.eyJ1IjoiZG91Z2xhc2FzdGFybmVzIiwiYSI6IkxfZ1ZxN1kifQ.ycBd3UWFRS08zAJJfxGkPw';
    var overtonParkMap = L.mapbox.map('map', 'mapbox.run-bike-hike').setView([35.147203, -89.989724], 15);
    // L.mapbox.styleLayer('mapbox://styles/mapbox/emerald-v8').addTo(overtonParkMap);
    var overtonParkPlantLayer = L.mapbox.featureLayer();

    var fetch_naturalist_data = function() {
      var base_url = 'https://www.inaturalist.org/observations.json?swlat=35.142358&swlng=-89.996579&nelat=35.150951&nelng=-89.981602';
      base_url += '&projects=field-guide-to-overton-park-old-forest-memphis-tn';
      $.ajax(base_url, {
          success: function(data) {
            process_naturalist_data(data);
            process_popup_info();
          }
        });
    };

    var process_naturalist_data = function(data) {
        // Fetch the data from iNaturalist and populate our feature layer.
        console.log("Processing naturalist data...");
        features = [];
        $.each(data, function(i, point) {
          var lat = point.latitude;
          var lng = point.longitude;
          point.icon = {
            "className": "my-icon"
          };
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
    };

    var process_popup_info = function() {
      // Parse through our features and add popups!
      console.log("Processing popup info...");
      overtonParkPlantLayer.eachLayer(function (plant) {
        // Shorten locale.feature.properties to just `prop` so we're not
          // writing this long form over and over again.
          var prop = plant.feature.properties;

          // Each marker on the map.
          var popup = '<h3>' + prop.species_guess + '</h3><div>';

          if (prop.photos.length > 0) {
            popup += '<br /><img src="' + prop.photos[0].square_url + '" />';
          }

          // var listing = listings.appendChild(document.createElement('div'));
          // listing.className = 'item';

          // var link = listing.appendChild(document.createElement('a'));
          // link.href = '#';
          // link.className = 'title';

          // link.innerHTML = prop.address;
          // if (prop.crossStreet) {
          //   link.innerHTML += '<br /><small class="quiet">' + prop.crossStreet + '</small>';
          //   popup += '<br /><small class="quiet">' + prop.crossStreet + '</small>';
          // }
          //
          // var details = listing.appendChild(document.createElement('div'));
          // details.innerHTML = prop.city;
          // if (prop.phone) {
          //   details.innerHTML += ' &middot; ' + prop.phoneFormatted;
          // }
          //
          // link.onclick = function() {
          //   setActive(listing);
          //
          //   // When a menu item is clicked, animate the map to center
          //   // its associated locale and open its popup.
          //   map.setView(locale.getLatLng(), 16);
          //   locale.openPopup();
          //   return false;
          // };

          // Marker interaction
          plant.on('click', function(e) {
            // 1. center the map on the selected marker.
            overtonParkMap.panTo(plant.getLatLng());
          });

          popup += '</div>';
          plant.bindPopup(popup);
      });

    };

    overtonParkPlantLayer.addTo(overtonParkMap);
    fetch_naturalist_data();
    // overtonParkPlantLayer.on('click', function(e) { console.log(e.layer.feature.properties); });
});
