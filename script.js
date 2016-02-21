$(document).ready(function() {
    var fetch_observation_data = function() {
      var base_url = 'https://www.inaturalist.org/observations.json?swlat=35.142358&swlng=-89.996579&nelat=35.150951&nelng=-89.981602';
      $.ajax(base_url, {
          success: function(data) {
            process_observation_data(data);
            process_popup_info();
          },
          alert: function(err) {
            alert("Unable to fetch plant data, please try again.");
          }
        });
    };

    var process_observation_data = function(data) {
        // Fetch the data from iNaturalist and populate our feature layer.
        features = [];

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
          observed_species[point.taxon_id] = feature;
          features.push(feature);
        });
        overtonParkPlantLayer.setGeoJSON({
          type: "FeatureCollection",
          features: features
        });
    };

    var process_popup_info = function() {
      // Parse through our features and add popups!
      overtonParkPlantLayer.eachLayer(function (plant) {
        // Shorten locale.feature.properties to just `prop` so we're not
          // writing this long form over and over again.
          var prop = plant.feature.properties;

          // Each marker on the map.
          var popup = '<div class="popup-div"><h3 class="popup-title">' + prop.species_guess + '</h3>';

          if (prop.photos.length > 0) {
            popup += '<img class="popup-image" src="' + prop.photos[0].square_url + '" />';
          }
          popup += '<br /><a class="popup-link" href="' + prop.uri + '" target="_blank">';
          popup += 'More info</a>';

          // Marker interaction
          plant.on('click', function(e) {
            // 1. center the map on the selected marker.
            overtonParkMap.panTo(plant.getLatLng());
          });

          popup += '</div>';
          plant.bindPopup(popup);
      });

    };

    var setup_catalog_list = function() {
      var catalogList = $('#catalog-list');

      var loadMoreLi = $('<li>');
      loadMoreLi.addClass('load-more');

      loadMoreLi.css('text-align', 'center');
      loadMoreLi.css('padding', '20px');
      loadMoreLi.css('background-color', '#333');
      loadMoreLi.css('color', '#FFF');

      var loadMoreP = $('<p>');
      loadMoreP.css('font-size', '18px');
      loadMoreP.html('Load More');
      loadMoreP.appendTo(loadMoreLi);

      loadMoreLi.appendTo(catalogList);
    };


    var getSpinner = function() {
      var img = $('<img>').attr('src', 'images/ajax-loader.gif');
      return img;
    };

    var species_url = function(taxon_id) {
        var base_url = 'http://www.inaturalist.org/taxa/';
        return base_url + taxon_id;
    };

    var loadPage = function(checklist_url) {
        $('.load-more').html('');
        $('.load-more').append(getSpinner());
        $.ajax(checklist_url, {
            success: function(data) {
                $('.load-more').html('Load more');
                $('.load-more').find('img').remove();
                var catalogData = data['listed_taxa'];
                $.each(catalogData, function(idx, val) {
                    var li = $('<li>');
                    var containerDiv = $('<div>');
                    var thumbnail = $('<div>');
                    var content = $('<div>');
                    var icon = $('<div>');

                    li.addClass('list-group-item');
                    content.addClass('catalog-list-content');
                    icon.addClass('catalog-list-icon');
                    thumbnail.addClass('catalog-list-thumbnail');

                    var thumbnailLink = $('<a>');
                    thumbnailLink.attr('href', species_url(val['taxon_id']));
                    thumbnailLink.attr('target', '_blank');
                    var thumbnailImg = $('<img>');
                    thumbnailImg.attr('src', val['taxon']['photo_url']);

                    thumbnailImg.appendTo(thumbnailLink);
                    thumbnailLink.appendTo(thumbnail);

                    var default_name = $('<h4>');
                    default_name.html(val['taxon']['default_name']['name']);
                    default_name.addClass('default_name');

                    var taxon_name = $('<p>');
                    taxon_name.html(val['taxon']['name']);
                    taxon_name.css('font-style', 'italic');

                    default_name.appendTo(content);
                    taxon_name.appendTo(content);

                    thumbnail.appendTo(containerDiv);
                    content.appendTo(containerDiv);
                    icon.appendTo(containerDiv);

                    var span = $('<span>');
                    span.addClass('glyphicon glyphicon-map-marker');

                    if (val['taxon_id'] in observed_species) {
                      span.appendTo(icon);
                      icon.on('click', function() {
                        apply_filter(val.taxon_id);
                        $('#map_link').click();
                      });
                    }

                    var clearDiv = $('<div>');
                    clearDiv.css('clear', 'both');

                    clearDiv.appendTo(containerDiv);

                    containerDiv.appendTo(li);

                    $('.load-more').before(li);
                });
                var options = {
                  valueNames: ['default_name']
                };
                var speciesList = new List('catalog-content', options);
            }
        });
    };

    var apply_filter = function(taxon_id) {
      overtonParkPlantLayer.setFilter(function(f) {
          if (!taxon_id) return true;
          return f.properties.taxon_id === taxon_id;
      });
      process_popup_info();
      return false;
    };

    var getINaturalistLink = function() {
      var text = 'To contribute to the data in the catalog, please install iNaturalist.<br/><br/>';
      var userAgent = navigator.userAgent;
      if (userAgent.indexOf('iPhone') > 0) {
        return text + '<a href="https://geo.itunes.apple.com/us/app/inaturalist/id421397028?mt=8" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg) no-repeat;width:165px;height:40px;"></a>';
      } else if (userAgent.indexOf('Android') > 0) {
        return text + '<a href="http://play.google.com/store/apps/details?id=org.inaturalist.android"><img src="images/android.png" style="width:135px;height:40px;"></a>';
      } else {
        return 'no app';
      }
    };

    var refreshPointData = function() {
        apply_filter();
        fetch_observation_data();
    };

    L.Control.RefreshPoints = L.Control.extend(
    {
        options:
        {
            position: 'topright',
        },
        onAdd: function (map) {
            var controlDiv = L.DomUtil.create('div', 'leaflet-control-locate leaflet-bar leaflet-control');
            controlDiv.style.paddingRight = '10px';
            // break here
            L.DomEvent
                .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', function () {
              refreshPointData();
            });

            var controlUI = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', controlDiv);
            controlUI.title = 'Refresh points';
            controlUI.href = '#';
            var icon = L.DomUtil.create('span', 'glyphicon glyphicon-refresh', controlUI);
            icon.style.fontSize = '20px';
            return controlDiv;
        }
    });

    /**
     * Main
     */
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG91Z2xhc2FzdGFybmVzIiwiYSI6IkxfZ1ZxN1kifQ.ycBd3UWFRS08zAJJfxGkPw';
    // Construct a bounding box to prevent users from moving outside of Overton Park.
    var southWest = L.latLng(35.139358, -89.997579),
    northEast = L.latLng(35.155951, -89.980602),
    bounds = L.latLngBounds(southWest, northEast);

    // URL that affects the data that displays on the map
    var observations_url = 'https://www.inaturalist.org/observations.json?swlat=35.142358&swlng=-89.996579&nelat=35.150951&nelng=-89.981602';
    // URL that affects data displayed in the catalog
    var checklist_url = 'https://www.inaturalist.org/check_lists/194500-Overton-Park-Check-List.json?iconic_taxon=47126';

    // Properties of the marker. To look up other symbols, search for mapbox maki icons.
    var marker_config = {
      "marker-color": "#3DFF59",
      "marker-size": "medium",
      "marker-symbol": "garden"
    };

    var overtonParkMap = L.mapbox.map('map', 'mapbox.run-bike-hike', {
      maxBounds: bounds,
      maxZoom: 22,
      minZoom: 15
    }).setView([35.147203, -89.989724], 15);
    L.control.locate().addTo(overtonParkMap);
    // If you want to change to a custom style one day, add this and remove the style
    // string from the map constructor.
    // L.mapbox.styleLayer('mapbox://styles/mapbox/emerald-v8').addTo(overtonParkMap);
    var overtonParkPlantLayer = L.mapbox.featureLayer();
    var observed_species = {};

    var refreshPointsControl = new L.Control.RefreshPoints();
    overtonParkMap.addControl(refreshPointsControl);
    overtonParkPlantLayer.addTo(overtonParkMap);

    fetch_observation_data(observations_url);
    setup_catalog_list();
    loadPage(checklist_url);
    $('#app-link').html(getINaturalistLink());
});
