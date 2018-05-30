
let map, infoWindow, resultData, defaultLoc, marker;
let restaurants = [];
let allTypes = [];
let allMarkers = [];
let markerDetails;
let uniqueTypes = [], circle, rectangle, markerOptions, circleOptions;

function initMap() {
  defaultLoc = new google.maps.LatLng(10.3157, 123.8854); // Cebu City
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: defaultLoc,
    mapTypeId: 'roadmap'
  });

  infowindow = new google.maps.InfoWindow;

  $('#types').on('change', function() { //changing types
      clearMarkers();
      setPlaces();
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
        let circlerestaurants;

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
                 getUniqueTypes(allTypes);
            }
            let restoNumbers = 0;
            if (typeof circlerestaurants != "undefined") {
              restoNumbers = circlerestaurants.length;
            }


            createCircleLabel(circle.getCenter().lat(), circle.getCenter().lng(), restoNumbers, circlerestaurants);
        });
        // console.log('radius', circle.getRadius());
        // console.log('lat', circle.getCenter().lat());
        // console.log('lng', circle.getCenter().lng());
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


// generate retaurants list
function getList(newMarker) {
    document.getElementById('list').innerHTML += '<span><strong>Restaurants:</strong> ' + newMarker.name +'</span><br>';
}

function getRestaurants() { // restaurants from google
    service = new google.maps.places.PlacesService(map);
    console.log("Default Location : ",defaultLoc);

    let radiusVar = 5500;
      service.nearbySearch({
          location: defaultLoc,
          radius: radiusVar,
          type: ['restaurant'],
      }, function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              restaurants = results;
              // console.log("restaurants : ", restaurants);
              restaurants.forEach(function(resto){
                let retTypes = callMarker(resto);
                retTypes.forEach(function(types){
                  allTypes.push(types);
                });
              });

              getUniqueTypes(allTypes);
              setPlaces()

          }
      });
}

function getUniqueTypes(allTypes){
  allTypes.forEach(function(x){
    if($.inArray(x, uniqueTypes) === -1) 
      uniqueTypes[x] = x;
  });

  uniqueTypes.unshift("All");

  setTypes(uniqueTypes.sort()); 
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
    restaurants.forEach(function(resto){
      if(resto.types.includes(type) == true)
      {  
        console.log("TRUE : ", resto.types);
        clearMarkers();
        callMarker(resto);
      }
    });
}

function createCircleLabel(lat, lng, restoNumbers, resto){


   marker = new google.maps.Marker({
      map: map,
      position: {lat : lat, lng : lng},
      label: restoNumbers.toString()
  });

   allMarkers[resto.id] = marker;
   setMarkerInfo(marker, resto);
}

function callMarker(resto){

  var icon = {
      url: resto.icon,
      scaledSize: new google.maps.Size(30, 30),
  };


  marker = new google.maps.Marker({
      icon: icon,
      map: map,
      position: resto.geometry.location,
      title: resto.name
  });

  marker.id = resto.id;
  marker.name = resto.name;

  allMarkers[resto.id] = marker;

  getList(marker);

  let venuesFS = callFourSquare(resto.geometry.location.toUrlValue(7), resto.name);
    

  setMarkerInfo(marker,resto,venuesFS);

  return resto.types;

}

function setMarkerInfo(newMarker,resto,venuesFS = {}){

  var opening = '';
    if (resto.opening_hours) {
        if (resto.opening_hours.open_now) {
            opening = '<strong><span style="color: green;">Open now</span></strong><br>';
        } else {
            opening = '<strong><span style="color: red;">Closed</span></strong><br>';
        }
    }

  var restoName = (resto.name) ? '<strong>' + resto.name + ' </strong><br><br>' : '' ;
    var restoVicinity = (resto.vicinity) ? resto.vicinity + '<br> <a href="#" id="get-direction-' + resto.id + '" class="get-direction">GO HERE and see directions!</a><br><br>' : '' ;
    var specialty = (resto.specialty) ? 'Specialty : ' + resto.specialty + '<br>' : '' ;
    var restoTypes = (resto.types) ? 'Restaurant type : ' + resto.types + '<br>' : '';
    var rating = (resto.specialty) ? 'Rating : ' + resto.specialty + '<br>' : '' ;
    var checkinCount = (venuesFS.checkinCount) ? 'Checkin Count : ' + venuesFS.checkinCount + '<br>': "";
    var customerCount = (venuesFS.customerCount) ? 'Customer Count : ' + venuesFS.customerCount + '<br>': "";

    // add on click event on markers to show restaurant details
    google.maps.event.addListener(newMarker, 'click', function() {
        infowindow.setContent('<div>' + 
            restoName + '' +
            restoVicinity +
            opening +
            restoTypes +
            specialty +
            rating +
            checkinCount +
            customerCount
        );
        infowindow.open(map, this);
    });

    // on click get direction
    $(document).off('click', '#get-direction-' + resto.id).on('click', '#get-direction-' + resto.id, function() {
        calculateAndDisplayRoute(resto.geometry.location, resto.name);
    });
}

function callFourSquare(coordinates, restoName) { // get by coordinates and name, get customer counts and checkin counts
  try{

    var clientId = "3NDCCM2DYYVQUQXIDBB2MMIGVPTNDGYEXK4CIAQSUXNLQX3F";
    var clientSecret = "S3YYYPHGA1EGTMXGW5WZUQIFROAEHRFG43PYA2ENQITMCWYW";
    var oAuthToken = "I25B33JZSODPTRGZL51MUF1LH313XORDHNRQELUVIFHSBYEF";
    var xhttp = new XMLHttpRequest();
    // var url = "https://api.foursquare.com/v2/venues/search?intent=match&ll="+coordinates+"&name="+restoName+"&limit=10&client_id=3NDCCM2DYYVQUQXIDBB2MMIGVPTNDGYEXK4CIAQSUXNLQX3F&client_secret=S3YYYPHGA1EGTMXGW5WZUQIFROAEHRFG43PYA2ENQITMCWYW&v=20180530"
    var url = "https://api.foursquare.com/v2/venues/search?intent=match&ll="+coordinates+"&name="+restoName+"&limit=10&client_id="+clientId+"&client_secret="+clientSecret+"&oauth_token="+oAuthToken+"&v=20180530"

    
    xhttp.open("GET", url, false);
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);

    let returnResponse = {};

    // console.log(response.response.venues);
    if(response){
      returnResponse.customerCount = (typeof response.response.venues[0].stats.usersCount != "undefined") ? response.response.venues[0].stats.usersCount : "";
      returnResponse.checkinCount = (typeof response.response.venues[0].stats.checkinsCount != "undefined") ? response.response.venues[0].stats.checkinsCount : "";

    }
    
    return returnResponse;
  }catch(e){
    return {};
  }
}

// clear markers
function clearMarkers() {

    $.each(allMarkers, function(i, marker) {
        marker.setMap(null);
    });

    allMarkers = {};
}

// get and set destination
function calculateAndDisplayRoute(destination, name) {
    // directions request on service
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.set('directions', null);
    directionsDisplay.setMap(null);
    directionsDisplay.setDirections(null);

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