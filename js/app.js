var map;
var markers = [];
// These are the bookstore locations shown to the user
var locations = [
  {
    title: 'Dog Eared Books', 
    description: 'Since 1992, Dog Eared Books has been supplying a book-hungry San Francisco with new, used, and remaindered books in the Mission and Castro districts.',
    location: {lat: 37.7612, lng: -122.4348}
  },{
    title: 'Russian Hill Bookstore', 
    description: 'Russian Hill Bookstore, established in 1993, is one of the last family-owned used and new bookstores in San Francisco.',
    location: {lat: 37.7967, lng: -122.4218}
  },{
    title: 'City Lights', 
    description: 'City Lights is a landmark independent bookstore and publisher that specializes in world literature, the arts, and progressive politics.',
    location: {lat: 37.7976, lng: -122.4066}
  },{
    title: 'Booksmith', 
    description: '',
    location: {lat: 37.7698, lng: -122.4494}
  },{
    title: 'Owl Cave Books', 
    description: 'Owl Cave Books is a San Francisco-based independent artist-run bookseller and publisher specializing in international contemporary art, theory, culture, and politics.',
    location: {lat: 37.7627, lng: -122.4143}
  },{
    title: 'The Green Arcade',
    description: 'Specializing in books on San Francisco & California history and more.',
    location: {lat: 37.7733, lng: -122.4219}
  },{
    title: 'Alexander Book Company',
    description: 'Your Independent Downtown San Francisco Bookstore.', 
    location: {lat: 37.7886, lng: -122.4007}
  },{
    title: 'Book Passage',
    description: 'Book Passage serves visitors and locals, offering regional maps, guidebooks, and Bay Area literature, postcards and gifts.', 
    location: {lat: 37.7953, lng: -122.3934}
  }
];

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

  var largeInfowindow = new google.maps.InfoWindow();
  // var bounds = new google.maps.LatLngBounds(); DO I NEED THIS??

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
  
  // map.fitBounds(bounds); //NEEDED?

  document.getElementById('show-bookstores').addEventListener('click', showBookstores);
  document.getElementById('hide-bookstores').addEventListener('click', hideBookstores);

  // This function populates the infowindow when the marker is clicked. We'll only allow one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.

  function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>' + marker.description + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
    };
  
      // In this case the status is OK, which means the pano was found, compute the 
      // position of the streetview image, then calculate the heading, then get a 
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latlng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div> id="pano"></div>');
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' + '<div> No Street View Found</div>');
        }
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        }
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById("pano"), panoramaOptions);
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map.marker);
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

     // This function takes in a COLOR, and then creates a new marker
     // icon of that color. The icon will be 21 px wide by 34 high, have an origin 
     // of 0, 0 and be anchored at 10, 34.
     function makeMarkerIcon(markerColor) {
      var markerImage = {
        url: 'img/book-marker.png', //attr: https://pixabay.com/en/book-blue-closed-literature-297246/
        size:new google.maps.Size(21, 34),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 34),
        scaledSize: new google.maps.Size(21, 34),
      }
      return markerImage;
    }
  }
   