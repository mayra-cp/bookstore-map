var map;
var markers = [];

// Initialize map function
function initMap() {
  //Adds styling to map
  var styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#286da8' },
        { lightness: 20 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#cd5360' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#e3e3a5' },
        { lightness: 10 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off'}
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#e3e3a5' },
        { lightness: -10 }
      ]
    }
  ];

  // Creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7956, lng: -122.3933},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  // These are the bookstore locations shown to the user
  var locations = [
    {
      title: 'Dog Eared Books (Castro)', 
      description: 'Supplying San Francisco with new, used, and remaindered books in the Mission and Castro districts.',
      location: {lat: 37.76120877479613, lng: -122.43490211719666}
    },{
      title: 'Dog Eared Books (Mission)', 
      description: 'Supplying San Francisco with new, used, and remaindered books in the Mission and Castro districts.',
      location: {lat: 37.758404, lng: -122.42150049999998}
    },{
      title: 'Russian Hill Bookstore', 
      description: 'One of the last family-owned used and new bookstores in San Francisco.',
      location: {lat: 37.796738532096256, lng: -122.42186062209015}
    },{
      title: 'City Lights', 
      description: 'A landmark independent bookstore and publisher that specializes in world literature, the arts, and progressive politics.',
      location: {lat: 37.79764968857877, lng: -122.40656030000002}
    },{
      title: 'Booksmith', 
      description: 'Vibrant, roomy independent bookshop offering author readings, best-sellers & hard-to-find titles.',
      location: {lat: 37.7698, lng: -122.4494}
    },{
      title: 'Owl Cave Books', 
      description: 'An independent artist-run bookseller and publisher specializing in international contemporary art, theory, culture, and politics.',
      location: {lat: 37.76270299999999, lng: -122.41428100000002}
    },{
      title: 'The Green Arcade',
      description: 'Specializing in books on San Francisco & California history.',
      location: {lat: 37.7733, lng: -122.4219}
    },{
      title: 'Alexander Book Company',
      description: 'Your independent downtown San Francisco bookstore.', 
      location: {lat: 37.7886, lng: -122.4007}
    },{
      title: 'Book Passage',
      description: 'Serves visitors and locals, offering regional maps, guidebooks, and Bay Area literature, postcards and gifts.', 
      location: {lat: 37.795274, lng: -122.39342099999999}
    }
  ];

  var largeInfowindow = new google.maps.InfoWindow();
 
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user mouses over the marker.
  var highlightedIcon = makeMarkerIcon('ffff24');

  // The following group uses the location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the local array.
    var position = locations[i].location;
    var title = locations[i].title;
    var description = locations[i].description;
    // Create a marker per location, and put into markers array
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      description: description,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers
    markers.push(marker);
    // Extend the boundaries of the map for each marker
    // bounds.extend(marker.position); //NEEDED?
    // Create an onclick event to open an infowindow at each marker
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    // Two event listeners - one for mouseover, one for mouseout, to changethe colors back and forth
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  document.getElementById('show-bookstores').addEventListener('click', showBookstores);
  document.getElementById('hide-bookstores').addEventListener('click', hideBookstores);

  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });
}

   // This function populates the infowindow when the marker is clicked. We'll only allow one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.

  function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div class="bold">' + marker.title + '</div>' + marker.description + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 5
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div class="bold">' + marker.title + '</div>' + marker.description + '</div><div> No Street View Found</div>');
        }
      }

      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      infowindow.open(map, marker);
    }
  }
  // This function will loop through the markers array and display them all.
  function showBookstores() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }
  // This function will loop through the listings and hide them all.
  function hideBookstores() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  //This function zooms into a specific area from a user's input
  function zoomToArea() {
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('zoom-to-area-text').value;
    if (address == '') {
      window.alert('You must enter an area, or address.')
    } else {
      geocoder.geocode(
      { address: address,
        componentRestrictions: {locality: 'San Francisco'}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
        } else {
          window.alert('We could not find that location - try entering a more' + ' specific place.');
        }
      });
    }
  }
  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin 
  // of 0, 0 and be anchored at 10, 34.
  function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'img/book-marker.png',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
  }
// }
 