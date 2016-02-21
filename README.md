# Old Forest Map App

## Intro
The Old Forest map app was created to enhance the user experience as people travelled through the Old Forest. Users can contribute more data through iNaturalist and invasive species can also be filtered through the catalog list in the app.

##Deployment
* From the root of the repository run `npm install`
* Run `npm install -g gulp-cli`
* Run `gulp compile-scripts`
* The files to deploy are in the `/public` directory

## App Requirements

### JS Library dependencies
* Mapbox.js (extension of leaflet.js)
  * Used for creating the map and plotting points
* jQuery
  * Used for referencing/manipulating the DOM
* Bootstrap
  * Used for styling the DOM
* listjs
  * Used to search the catalog
* lodash
  * Utility functions for JS

## Organization
The site is broken up into three files:
* index.html
  * Creation of the layout.
* script.js
  * Creation of the map and map related events
  * Fetching data from iNaturalist
* style.css
  * Aesthetics

## References
* [Mapbox.com](http://mapbox.com)
  * Manage how many views the map has received and also refresh your public key if you ever need to.
* [OpenStreetMap.org](http://openstreetmap.org/)
  * Users can edit the basemap they see within the app via OSM iD editor.
* [Bootstrap](http://getbootstrap.com)
  * The appearance of the app is utilizing a bootstrap theme. This theme can be changed.
* [iNaturalist](http://inaturalist.org/)
  * Where all the plant information is pulled from.

## The Future
### Updating URLs
There are two main links to modify:
  * observations_url
    * Currently we are pulling **all** observations within the Overton Park area (via geospatial filter).
  * checklist_url
    * Currently we are pulling from the Overton Park check list, filtering on plants.
