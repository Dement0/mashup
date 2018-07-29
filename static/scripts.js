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

// Add marker for place to map
function addMarker(place)
{
  // Instantiate variables
  var my_lat_lng = new google.maps.LatLns(place["latitude"], place["longitude"]);
  var marker = new google.maps.Marker({
    position: my_lat_lng,
    map: map,
    title: place["place_name"] + ", " + place["admin_name1"],
    label: place["place_name"] + ", " + place["admin_name1"]
  });

  // Get articles for my_lat_lng
  $.getJSON(("/articles"), {geo: place.postal_code}, function(data) {
    if (!$.isEmptyObject(data))
    {
      // Start unordered list
      contentString = "<ul>";

      // Loop through JSON data object key->value pairs
      for (var i=0; i<data.length; i++) {
        contentString += "<li><a target='_NEW' href='" + data[i].link + "'>" + data[i].title + "</a></li>";
      }

      // End unordered list
      contentString += "</ul>";
    }
  });

  // Add listener for click on marker
  google.maps.event.addListener(marker, "click", function() {
    showInfo(marker, contentString);
  });

  // Push clicked marker to markers[]
  markers.push(marker);
}

// Configure application
function configure()
{
  // Update UI after map has been dragged
  google.maps.event.addListener(map, "dragend", function() {
    // If info window is not open
    // http://stackoverflow.com/a/12410385
    if (!info.getMap || !info.getMap())
    {
      update();
    }
  });

  // Update UI after zoom level changes
  google.maps.event.addListener(map, "zoom_changed", function() {
    update();
  });

  // Configure typeahead
  $("#q").typeahead({
    highlight: false,
    minLength: 1
  },
  {
    display: function(suggestion) { return null; },
    limit: 10,
    source: search,
    templates: {
      suggestion: Handlebars.compile(
        "<div>" +
        "{{place_name}}, " +
        "{{admin_name1}}, " +
        "{{postal_code}}" +
        "</div>"
      )
    }
  });

  // Re-center map after place is selected from drop-down
  $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {
    // Select map's center
    map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

    // Update UI
    update();
  });

  // Hide info window when text box has focus
  $("#q").focus(function(eventData) {
    info.close();
  });

  // Re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
  // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
  document.addEventListener("contextmenu", function(event) {
    event.returnValue = true;
    event.stopPropagation && event.stopPropagation();
    event.cancelBubble && event.cancelBubble();
  }, true);

  // Update UI
  update();

  // Give focus to text box
  $("#q").focus();
}

// Remove markers from map
function removeMarkers()
{
  // remove all markers from the map
  for (var j=0, n=markers.length; j<n;j++)
  {
    markers[j].setMap(null);
  }
}

// Search database for typeahead's suggestions
function search(query, syncResults, asyncResults)
{
  // Get places matching query (asynchronously)
  let parameters = {
    q: query
  };
  $.getJSON("/search", parameters, function(data, textStatus, jqXHR) {
    // Call typeahead's callback with search results (i.e., places)
    asyncResults(data);
  });
}

// Show info window at marker with content
function showInfo(marker, content)
{
  // Start div
  let div = "<div id='info'>";
  if (typeof(content) == "undefined")
  {
    //http://www.ajaxload.info
    div += "<img alt='loading' src='static/ajax-loader.gif'/>";
  }
  else
  {
    div += content;
  }

  // End div
  div += "</div>";

  // Set info window's content
  info.setContent(div);

  // Open info window (if not already open)
  info.open(map, marker);
}

// Update UI's markers
function update()
{
  // Get map's bounds
  let bounds = map.getBounds();
  let ne = bounds.getNorthEast();
  let sw = bounds.getSotuhWest();

  // Get places within bounds (asynchronously)
  let parameters = {
    ne: `${ne.lat()},${ne.lng()}`,
    q: $("#q").val(),
    sw: `${sw.lat()},${sw.lng()}`
  };
  $.getJSON("/update", parameters, function(data, textStatus, jqXHR) {
    // Remove old markers from map
    removeMarkers();

    // Add new markers to map
    for (let i = 0; i < data.length; i++)
    {
      addMarker(data[i]);
    }
  });
};
