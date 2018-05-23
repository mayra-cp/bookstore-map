var map;
var markers = [];

// Bookstore locations shown to User
var locations = [
  {
    title: 'Dog Eared Books (Castro)', 
    description: 'Supplying San Francisco with new, used, and remaindered books.',
    location: {lat: 37.76120877479613, lng: -122.43490211719666}
  },{
    title: 'Dog Eared Books (Mission)', 
    description: 'Supplying San Francisco with new, used, and remaindered books.',
    location: {lat: 37.758404, lng: -122.42150049999998}
  },{
    title: 'Russian Hill Bookstore', 
    description: 'One of the last family-owned used and new bookstores in San Francisco.',
    location: {lat: 37.796738532096256, lng: -122.42186062209015}
  },{
    title: 'City Lights', 
    description: 'Specializes in world literature, the arts, and progressive politics.',
    location: {lat: 37.79764968857877, lng: -122.40656030000002}
  },{
    title: 'Booksmith', 
    description: 'Offering author readings, best-sellers & hard-to-find titles.',
    location: {lat: 37.7698, lng: -122.4494}
  },{
    title: 'Owl Cave Books', 
    description: 'Specializing in international contemporary art, theory, culture, and politics.',
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
    description: 'Offering regional maps, guidebooks, Bay Area literature, postcards and gifts.', 
    location: {lat: 37.795274, lng: -122.39342099999999}
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

  // Autocomplete for use in the search within time entry bos
  var timeAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('search-within-time-text'));
  var zoomAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('zoom-to-area-text'));
  zoomAutocomplete.bindTo('bounds', map);

  var largeInfowindow = new google.maps.InfoWindow();
 
  // This will be our listing marker icon
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user mouses over the marker. Currently does NOT work
  var highlightedIcon = makeMarkerIcon('ffff24');

  // Use a location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
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
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    // Two event listeners to change colors back and forth
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  var acc = document.getElementById('show-bookstores');
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function() {
      this.idList.toggle('active');
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight){
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  document.getElementById('show-bookstores').addEventListener('click', showBookstores);
  document.getElementById('hide-bookstores').addEventListener('click', hideBookstores);

  // REMOVED FOR THIS VERSION BUT MAY USE LATER
  // document.getElementById('zoom-to-area').addEventListener('click', function() {
  //   zoomToArea();
  // });
  document.getElementById('search-within-time').addEventListener('click', function() {
    searchWithinTime();
  });
}

   // This function populates the infowindow when the marker is clicked
  function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('');
      infowindow.open(map, marker);
      // Make sure marker property is cleared if infowindow is closed
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
  // Loop through the markers array and display them all
  function showBookstores() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }
  // Loop through the listings and hide them all
  function hideBookstores() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  // Intended to make new marker with color but instead shows new icon imgs --- COLOR CHANGE NOT WORKING 
  function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'img/book-marker.png',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
  }
// REMOVED FOR THIS VERSION BUT MAY USE LATER
  // // Zooms into a specific area from the User's input
  // function zoomToArea() {
  //   var geocoder = new google.maps.Geocoder();
  //   var address = document.getElementById('zoom-to-area-text').value;
  //   if (address == '') {
  //     window.alert('You must enter an area, or address.')
  //   } else {
  //     geocoder.geocode(
  //     { address: address,
  //       componentRestrictions: {locality: 'San Francisco'}
  //     }, function(results, status) {
  //       if (status == google.maps.GeocoderStatus.OK) {
  //         map.setCenter(results[0].geometry.location);
  //         map.setZoom(15);
  //       } else {
  //         window.alert('We could not find that location - try entering a more' + ' specific place.');
  //       }
  //     });
  //   }
  // }

  // Allows User to input a desired travel time & only show listings within that travel time
  function searchWithinTime() {
    var distanceMatrixService = new google.maps.DistanceMatrixService;
    var address = document.getElementById('search-within-time-text').value;
    if (address == '') {
      window.alert('You must enter an address.');
    } else {
      hideBookstores();
      var origins = [];
      for (var i = 0; i < markers.length; i++) {
        origins[i] = markers[i].position;
      }
      var destination = address;
      var mode = document.getElementById('mode').value;
      distanceMatrixService.getDistanceMatrix({
        origins: origins,
        destinations: [destination],
        travelMode: google.maps.TravelMode[mode],
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      }, function(response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
          window.alert('Error was: ' + status);
        } else {
          displayMarkersWithinTime(response);
        }
      });
    }
  }

  // Go through each result -- if distance is less than the value, show it on map
  function displayMarkersWithinTime(response) {
    var maxDuration = document.getElementById('max-duration').value;
    var origins = response.originAddresses;
    var destinations = response.destinationAdresses;
    var atLeastOne = false;
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        if (element.status === "OK") {
          var distanceText = element.distance.text;
          var duration = element.duration.value / 60;
          var durationText = element.duration.text;
          if (duration <= maxDuration) {
            markers[i].setMap(map);
            atLeastOne = true;
            var infowindow = new google.maps.InfoWindow({
              content: durationText + ' away, ' + distanceText + 
              '<div><input type=\"button\" value=\"View Route\" onclick =' + 
              '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
            });
            infowindow.open(map, markers[i]);
            markers[i].infowindow = infowindow;
            google.maps.event.addListener(markers[i], 'click', function() {
              this.infowindow.close();
            });
          }
        }
      }
    }
    if (!atLeastOne) {
      window.alert('We could not find any locations within that distance!');
    }
  }

  // When User selects "show route" on a marker, will display route on map
  function displayDirections(origin) {
    hideBookstores();
    var directionsService = new google.maps.DirectionsService;
    var destinationAddress =
      document.getElementById('search-within-time-text').value;
    var mode = document.getElementById('mode').value;
    directionsService.route({
      origin: origin,
      destination: destinationAddress,
      travelMode: google.maps.TravelMode[mode]
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          draggagle: true,
          polylineOptions: {
            strokeColor: 'green'
          }
        });
      } else {
        window.alert('Directions request failed do to ' + status);
      }
    });
  }


  var Location = function(data) {
    this.title = ko.observable(data.title);
    this.description = ko.observable(data.description);
    this.location = ko.observable(data.location);
  }

  var ViewModel = function() {
    var self = this;

    this.locationsList = ko.observableArray([]);

    locations.forEach(function(locationsItem){
      self.locationsList.push( new Location(locationsItem) );
    });

    this.currentLocation = ko.observable( this.locationsList()[0] );
  }

  ko.applyBindings(new ViewModel());
 