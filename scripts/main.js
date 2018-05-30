
let map, infoWindow, resultData, defaultLoc, marker;
let restaurants = [];
let allTypes = [];
let markerDetails;
let uniqueTypes, circle, rectangle, allMarkers = [], markerOptions, circleOptions,
circlerestaurants;

function initMap() {
  defaultLoc = new google.maps.LatLng(10.3157, 123.8854); // Cebu City
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: defaultLoc,
    mapTypeId: 'roadmap'
  });

  infowindow = new google.maps.InfoWindow;

  $('#types').on('change', function() { //changing types
      // clearOverlays();
      // eachRestaurants();

      clearMarkers();
      setPlaces();
      // setTotals();
  });
  // getUserLocation() // used if you want to get your current location
  getRestaurants();
  draw()



}

function draw(){
  var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [ 'circle']
      },
      // markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
      circleOptions: {
        fillColor: '#044B94',
        fillOpacity: 0.4,
        strokeWeight: 5,
        clickable: false,
        editable: false,
        zIndex: 1
      }
    });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, 'circlecomplete', onCircleComplete);

}


function onCircleComplete(shape) {
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;

        if (circle != null) {
            circle.setMap(null);
            circle = null;
        }

        circle = shape;

        let newService = new google.maps.places.PlacesService(map);

        newService.nearbySearch({
            location: {lat : circle.getCenter().lat(), lng : circle.getCenter().lng() },
            radius: circle.getRadius(),
            type: ['restaurant'],
        }, function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                circlerestaurants = results;
                console.log("circlerestaurants : ", circlerestaurants.length);

                 circlerestaurants.forEach(function(resto){
                  let retTypes = callMarker(resto);
                  retTypes.forEach(function(types){
                    allTypes.push(types);
                  });
                });
            }

            createCircleLabel(circle.getCenter().lat(), circle.getCenter().lng(), circlerestaurants.length);
        });
        // console.log('radius', circle.getRadius());
        // console.log('lat', circle.getCenter().lat());
        // console.log('lng', circle.getCenter().lng());
    }

function createCircleLabel(lat, lng, restoNumbers){
  console.log("restoNumbers : ", restoNumbers);
  var newmarker = '';
   newmarker = new google.maps.Marker({
      map: map,
      position: {lat : lat, lng : lng},
      label: restoNumbers.toString()
  });
}


function getUserLocation(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}


function getRestaurants() { // restaurants from google
    service = new google.maps.places.PlacesService(map);
    console.log("Default Location : ",defaultLoc);
    service.nearbySearch({
        location: defaultLoc,
        radius: 5500,
        type: ['restaurant'],
    }, function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            restaurants = results;
            console.log("restaurants : ", restaurants);
            restaurants.forEach(function(resto){
              let retTypes = callMarker(resto);
              retTypes.forEach(function(types){
                allTypes.push(types);
              });
            });


            uniqueTypes = [];
            allTypes.forEach(function(x){
              if($.inArray(x, uniqueTypes) === -1) 
                uniqueTypes[x] = x;
            });

            uniqueTypes.unshift("All"); // add All in first selection
            console.log("uniqueTypes : ", uniqueTypes);

            setTypes(uniqueTypes.sort());
            setPlaces();
        }
    });
}

function setTypes (uniqueTypes) { // setting of resto types in panel
  let select = document.getElementById("types");
  for(index in uniqueTypes) {
      select.options[select.options.length] = new Option(uniqueTypes[index], index);
  }

}

// go through each restaurants
function setPlaces() {

  
    let type = document.getElementById("types").value;
    console.log("THIS RESTAURANTS : ", type);
    restaurants.forEach(function(resto){
      if(restaurants.indexOf(type) != -1 || type != "0")
      {  
        console.log("TRUE");
         callMarker(resto);
      }else{ //if All is selected
        console.log("FALSE");
        // callMarker(resto);
      }
    });
    // setTotals();

    /*// check if circle exists; if true, count summary within the radius
    if (circle) {
        var circle_pos = new google.maps.LatLng(circle.getCenter().lat(), circle.getCenter().lng());
        totalResto = 0, total_customers = 0, total_sales = 0; // reset counters
        document.getElementById('restaurants_list').innerHTML = ''; // clear restaurants list

        $.each(markersArray, function(i, v) {
            if (google.maps.geometry.spherical.computeDistanceBetween(v.getPosition(), circle_pos) < circle.getRadius()) {
                listRestaurants(v); // restaurants_list
                totalResto++;
            }
        });
    }*/

    // renderTotals();
}


/*function setTotals() {
    document.getElementById('totalResto').innerHTML = totalResto; // total restaurants fetched
}*/


function callMarker(resto){


  var icon = {
      url: resto.icon,
      scaledSize: new google.maps.Size(25, 25),
  };

  marker = new google.maps.Marker({
      icon: icon,
      map: map,
      position: resto.geometry.location,
      title: resto.name
  });

  // marker = {
  //   id : resto.id,
  //   name : resto.name,
  //   analytics : resto.analytics,
  //   type : resto.types
  // }

  allMarkers[resto.id] = (marker);

    var opening = '';
    if (resto.opening_hours) {
        if (resto.opening_hours.open_now) {
            opening = '<strong><span style="color: green;">Open now</span></strong><br>';
        } else {
            opening = '<strong><span style="color: red;">Closed</span></strong><br>';
        }
    }

    var specialty = '';
    if (resto.specialty) {
        specialty = 'Specialty : ' + resto.specialty + '<br>';
    }

    var rating = '';
    if (resto.rating) {
        rating = 'Rating : ' + resto.rating + '<br>';
    }

    var report = '';
    if (resto.analytics) {
        report = '<br><br><a href="#" id="get-report-' + resto.id + '">Get analytical report for this restaurant</a></div>';
    }

    // add on click event on markers to show restaurant details
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('<div><strong>' + resto.name + '</strong><br>' +
            resto.vicinity + '<br> <a href="#" id="get-direction-' + resto.id + '" class="get-direction">Get directions to this restaurant</a><br><br>' +
            opening +
            'Restaurant type : ' + resto.types + '<br>' +
            specialty +
            rating +
            report
        );
        infowindow.open(map, this);
    });

    // on click get direction
    $(document).off('click', '#get-direction-' + resto.id).on('click', '#get-direction-' + resto.id, function() {
        calculateAndDisplayRoute(resto.geometry.location, resto.name);
    });



  return resto.types;

}

// clear markers
function clearMarkers() {

  console.log("allMarkers : ", marker);

  // allMarkers.forEach(function(marker){
  //   marker.setMap(null);
  // });

  // allMarkers = [];
    $.each(allMarkers, function(i, marker) {
        marker.setMap(null);
    });
    allMarkers = {};
}

// set destination
function setDestination(destination, name) {
    var request = {
        destination: destination,
        origin: defaultLoc,
        travelMode: 'DRIVING'
    };

    // directions request on service
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    calculateAndDisplayRoute(directionsService, directionsDisplay);
    /*directionsService.route(request, function(response, status) {
        if (status == 'OK') {
            document.getElementById('routes').innerHTML = '<div><strong>GOING TO '+name+'</strong></div>'; // reset routes details

            var routes = response.routes[0].legs[0].steps;
            if (routes) {
                for (var i = 1; i <= routes.length; i++) {
                    document.getElementById('routes').innerHTML += '<div><strong>(' + i + ')</strong><br>' + routes[i - 1].instructions + '</div><br>';
                }
            } else {
                document.getElementById('routes').innerHTML = 'No direction found.';
            }

            directionsDisplay.setDirections(response);
        }
    });*/
}

// get and set destination
function calculateAndDisplayRoute(destination, name) {
    // directions request on service
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.set('directions', null);
    directionsDisplay.setMap(null);

    directionsDisplay.setMap(map);
  directionsService.route({
    origin: defaultLoc,
    destination: destination,
    waypoints: [],
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      console.log(route);
      var summaryPanel = document.getElementById('directions-panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}