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
       // Normally we'd have these in a database instead.
       var locations = [
       {title: 'Dog Eared Books', location: {lat: 37.7612, lng: -122.4348}},
       {title: 'Russian Hill Bookstore', location: {lat: 37.7967, lng: -122.4218}},
       {title: 'City Lights', location: {lat: 37.7976, lng: -122.4066}},
       {title: 'Booksmith', location: {lat: 37.7698, lng: -122.4494}},
       {title: 'Owl Cave Books', location: {lat: 37.7627, lng: -122.4143}},
       {title: 'The Green Arcade', location: {lat: 37.7733, lng: -122.4219}}
       ];

       var largeInfowindow = new google.maps.InfoWindow();


       // Style the markers a bit. This will be our listing marker icon.
       var defaultIcon = makeMarkerIcon('0091ff');

       // Create a "highlighted location" marker color for when the user 
       //mouses over the marker.
       var highlightedIcon = makeMarkerIcon('ffff24');


       // var bounds = new google.maps.LatLngBounds(); DO I NEED THIS??

       // The following group uses the location array to create an array of markers on initialize
       for (var i = 0; i < locations.length; i++) {
        // Get the position from the local array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array
        var marker = new google.maps.Marker({
          position: position,
          title: title,
          icon: defaultIcon,
          animation: google.maps.Animation.DROP,
          id: i
        });
        // Push the marker to our array of markers
        markers.push(marker);
        // Extend the boundaries of the map for each marker
        // bounds.extend(marker.position);
        // Create an onclick event to open an infowindow at each marker
        marker.addListener('click', function() {
          populateInfoWindow(this, largeInfowindow);
        });
       }
       // Two event listeners - one for mouseover, one for mouseout, 
       // to changethe colors back and forth
       marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
       });
       marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
       });
      }

       document.getElementById('show-bookstores').addEventListener('click', showBookstores);
       document.getElementById('hide-bookstores').addEventListener('click', hideBookstores);

       // This function populates the infowindow when the marker is clicked. We'll only allow
       // one infowindow which will open at the marker that is clicked, and populate based
       // on that markers position.
       function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed
          infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In this case the status is OK, which means the pano was found, compute the 
          // position of the streetview image, then calculate the heading, then get a 
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewService.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
              infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
              var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 30
                }
              };
            var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
              }
            }
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // Open the infowindow on the correct marker.
            infowindow.open(map.marker);
          }
        }

     // This function will loop through the markers array and display them all.
     function showBookstores() {
      var bounds = new google.maps.LatLngBounds();
      // Extend the boundaries of the map for each marker and display the marker
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