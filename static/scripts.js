// Google Map
let map;

// Markers for map
let markers =[];

// Info window
let info = new google.maps.InfoWindow();


// Execute when DOM is fully loaded
$(document).ready(function() {
  // Styles for map
  // https://developers.google.com/maps/documentation/javascript/styling
  let styles = [
    // Hide Google's labels
    {
      featureType: "all",
      elementType: "labels",
      stylers: [
        {visibility:"off"}
      ]
    },

    // Hide roads
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {visibility: "off"}
      ]
    }
  ];

  // Options for map
  // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
  let options = {
    center: {lat: 37.4236, lng: -122.1619}, // Stanford, California
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    maxZoom: 14,
    panControl: true,
    sytles: styles,
    zom: 13,
    zoomControl: true
  };

  // Get DOM node in which map will be installed
  let canvas = $("#map-canvas").get(0);

  // Instantiate map
  map = new google.maps.Map(canvas, options);

  // Configure UI once Google Map is idle (i.e., loaded)
  google.maps.event.addListenerOnce(map, "idle", configure);

});
