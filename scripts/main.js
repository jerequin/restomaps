// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map, defaultLocation;
var markers = [];


function initMap() {
  // Create the map.
  defaultLocation = {lat: 10.3157, lng: 123.8854};
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 15
  });

  // Create the places service.
  var service = new google.maps.places.PlacesService(map);
  var getNextPage = null;
  var moreButton = document.getElementById('more');
  moreButton.onclick = function() {
    moreButton.disabled = true;
    if (getNextPage) getNextPage();
  };

  // Perform a nearby search.
  service.nearbySearch(
  {
    location: defaultLocation, 
    radius: 1000, 
    type: ['restaurant']
  },
  function(results, status, pagination) {
    if (status !== 'OK') return;

    createMarkers(results);
    moreButton.disabled = !pagination.hasNextPage;
    getNextPage = pagination.hasNextPage && function() {
      pagination.nextPage();
    };
  });

  $('#types').on('change', function() { //changing types
      deleteMarkers();
      deleteLists();
      filterTypes();
  });

}


function filterTypes() {
  // Create the map.
  let types = document.getElementById("types").value;


  defaultLocation = {lat: 10.3157, lng: 123.8854};
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 15
  });

  // Create the places service.
  var service = new google.maps.places.PlacesService(map);
  var getNextPage = null;
  var moreButton = document.getElementById('more');
  moreButton.onclick = function() {
    moreButton.disabled = true;
    if (getNextPage) getNextPage();
  };

  // Perform a nearby search.
  service.nearbySearch(
  {
    location: defaultLocation, 
    radius: 1000, 
    type: [types]
  },
  function(results, status, pagination) {
    if (status !== 'OK') return;

    createMarkers(results);
    moreButton.disabled = !pagination.hasNextPage;
    getNextPage = pagination.hasNextPage && function() {
      pagination.nextPage();
    };
  });


}

function deleteLists(places) {
  document.getElementById('places').innerHTML = '';

}

function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  var placesList = document.getElementById('places');



  for (var i = 0, place; place = places[i]; i++) {
    // console.log("place : ", place);
    var image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    var marker = new google.maps.Marker({
      map: map,
      icon: image,
      title: place.name,
      position: place.geometry.location
    });

    markers.push(marker);

    var li = document.createElement('li');
    var a = document.createElement('a');
    var placeVicinity = (place.vicinity) ?  '<a href="#" id="get-direction-' + place.id + '" class="get-direction">'+ place.name+'GO HERE!</a><br><br>' : '' ;
    a.textContent = place.name;
    a.setAttribute("id", 'get-direction-' + place.id )
    a.setAttribute("class", 'get-direction' + place.id )
    li.appendChild(a);
    placesList.appendChild(li);

    bounds.extend(place.geometry.location);

    setMarkerInfo(marker,place); // set marker info 


  }
  map.fitBounds(bounds);

}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}


function setMarkerInfo(newMarker, place){

  var infowindow = new google.maps.InfoWindow;
  var opening = '';
    if (place.opening_hours) {
        if (place.opening_hours.open_now) {
            opening = '<strong><span style="color: green;">Open now</span></strong><br>';
        } else {
            opening = '<strong><span style="color: red;">Closed</span></strong><br>';
        }
    }

  var placeName = (place.name) ? '<strong>' + place.name + ' </strong><br><br>' : '' ;
    var placeVicinity = (place.vicinity) ? place.vicinity + '<br> <a href="#" id="get-direction-' + place.id + '" class="get-direction">GO HERE and see directions!</a><br><br>' : '' ;
    var specialty = (place.specialty) ? 'Specialty : ' + place.specialty + '<br>' : '' ;
    var placeTypes = (place.types) ? 'Restaurant type : ' + place.types + '<br>' : '';
    var rating = (place.specialty) ? 'Rating : ' + place.specialty + '<br>' : '' ;

    var from = "";
    var checkinCount = "";
    var customerCount = "";
    
    // add on click event on markers to show restaurant details
    google.maps.event.addListener(newMarker, 'click', function() {
      let venues = callFourSquare(place.geometry.location.toUrlValue(5), place.name); //to display data from FourSquare
      if (venues != ""){
        from = "<strong>From FOURSQUARE :</strong><br>";
        checkinCount = (venues.checkinCount) ? 'Checkin Count : ' + venues.checkinCount + '<br>': "";
        customerCount = (venues.customerCount) ? 'Customer Count : ' + venues.customerCount + '<br>': "";

      }

        infowindow.setContent('<div>' + 
            placeName + '' +
            placeVicinity +
            opening +
            placeTypes +
            specialty +
            rating + "<br>" + 
            from +
            checkinCount +
            customerCount
        );
        infowindow.open(map, this);
    });

    // on click get direction
    $(document).off('click', '#get-direction-' + place.id).on('click', '#get-direction-' + place.id, function() {

        calculateAndDisplayRoute(place.geometry.location, place.name);

    });
}

// get and set destination
function calculateAndDisplayRoute(destination, name) {
    // directions request on service
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(map);
    directionsService.route({
      origin: defaultLocation,
      destination: destination,
      waypoints: [],
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    }, 
    function(response, status)
    {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        var route = response.routes[0];
        var summaryPanel = document.getElementById('directions-panel');
        summaryPanel.innerHTML = '';
        // For each route, display summary information.
        for (var i = 0; i < route.legs.length; i++) {
          var routeSegment = i + 1;
          summaryPanel.innerHTML += '<b>Route : ' + routeSegment +
              '</b><br>';
          summaryPanel.innerHTML += "START " + route.legs[i].start_address + ' to <br>';
          summaryPanel.innerHTML += "END " + route.legs[i].end_address + '<br>';
          summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
        }
      } else {
        window.alert('Directions request failed due to ' + status);
      }
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

    if(response){
      returnResponse.customerCount = (typeof response.response.venues[0].stats.usersCount != "undefined") ? response.response.venues[0].stats.usersCount : "";
      returnResponse.checkinCount = (typeof response.response.venues[0].stats.checkinsCount != "undefined") ? response.response.venues[0].stats.checkinsCount : "";

    }
    
    return returnResponse;
  }catch(e){
    console.log("error : ", e);
    return "";
  }
}

