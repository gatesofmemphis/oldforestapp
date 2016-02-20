$(document).ready(function() {

    L.mapbox.accessToken = 'pk.eyJ1IjoiZG91Z2xhc2FzdGFybmVzIiwiYSI6IkxfZ1ZxN1kifQ.ycBd3UWFRS08zAJJfxGkPw';
    // Construct a bounding box for this map that the user cannot
    // move out of
    var southWest = L.latLng(35.142358, -89.996579),
    northEast = L.latLng(35.150951, -89.981602),
    bounds = L.latLngBounds(southWest, northEast);

    var overtonParkMap = L.mapbox.map('map', 'mapbox.run-bike-hike', {
      maxBounds: bounds,
      maxZoom: 20,
      minZoom: 15
    }).setView([35.147203, -89.989724], 15);
    L.control.locate().addTo(overtonParkMap);
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
        var marker_config = {
          "marker-color": "#3DFF59",
          "marker-size": "medium",
          "marker-symbol": "garden"
        };
        $.each(data, function(i, point) {
          var lat = point.latitude;
          var lng = point.longitude;
          point.icon = {
            "className": "my-icon"
          };
          var feature = {
            type: 'Feature',
            properties: _.extend(point, marker_config),
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
          popup += '<br /><a href="' + prop.uri + '" target="_blank"><small>More info</small></a>';

          // The following is taken from the example found at:
          // https://www.mapbox.com/help/building-a-store-locator/
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
    
    var page_size = 10;
    var page = 1;
    
    var catalogList = $('#catalog-list');
    
    var loadMoreLi = $('<li>');
    loadMoreLi.addClass('load-more');
    loadMoreLi.addClass('ul-li-static');
    
    loadMoreLi.css('text-align', 'center');
    loadMoreLi.css('padding', '20px');
    loadMoreLi.css('background-color', '#333');
    loadMoreLi.css('color', '#FFF')
    
    var loadMoreP = $('<p>');
    loadMoreP.css('font-size', '18px');
    loadMoreP.html('Load More');
    loadMoreP.appendTo(loadMoreLi);
    
    loadMoreLi.appendTo(catalogList);
    
    $('.load-more').click(function() {
        loadPage();
    })
    
    function loadPage() {
        var url = 'https://www.inaturalist.org/check_lists/194500-Overton-Park-Check-List.json?per_page=' + page_size;
        url += '&page=' + page;
        $.ajax(url, {
            success: function(data) {
                var catalogData = data['listed_taxa']
                $.each(catalogData, function(idx, val) {
                    if (val['last_observation_id'] != null) {
                        var li = $('<li>');
                        li.addClass('ui-li-has-thumb');
                        $('.load-more').before(li);
                        
                        var link = $('<a>');
                        link.addClass('ui-btn ui-btn-icon-right ui-icon-location');
                        
                        var thumb = $('<img>');
                        thumb.attr('src', val['taxon']['photo_url']);
                        thumb.appendTo(link);
                        
                        var default_name = $('<h3>');
                        default_name.html(val['taxon']['default_name']['name']);
                        default_name.appendTo(link);
                        
                        var taxon_name = $('<p>');
                        taxon_name.html(val['taxon']['name']);
                        taxon_name.css('font-style', 'italic');
                        taxon_name.appendTo(link);
                        
                        link.appendTo(li);
                    } else {
                        var li = $('<li>');
                        li.addClass('ui-li-has-thumb ui-li-static');
                        $('.load-more').before(li);
                        
                        var thumb = $('<img>');
                        thumb.attr('src', val['taxon']['photo_url']);
                        thumb.appendTo(li);
                        
                        var default_name = $('<h3>');
                        default_name.html(val['taxon']['default_name']['name']);
                        default_name.appendTo(li);
                        
                        var taxon_name = $('<p>');
                        taxon_name.html(val['taxon']['name']);
                        taxon_name.css('font-style', 'italic');
                        taxon_name.appendTo(li);
                    }
                });
                console.log(catalogData[0]);
                page += 1;
            }
        });
    }
    
    loadPage();
});
