// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map, defaultLocation, circle, circleMarker, directionsDisplay, directionsService, 
      infowindow;
var marker, markers = [];
var circlemarkers = [];
var zomatoKEY = "b1cd2a52d0e02ba345f0eb9f29088097";

function initMap() {
  // Create the map.
  defaultLocation = {lat: 10.3157, lng: 123.8854};
  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER
    },
    center: defaultLocation,
    zoom: 15
  });


  // Create the places service.
  var service = new google.maps.places.PlacesService(map);
  var getNextPage = null;
  var moreButton = document.getElementById('more');
  moreButton.onclick = function() {
    infowindow.close();
    moreButton.disabled = true;
    if (getNextPage) getNextPage();
  };

  // Perform a nearby search.
  service.nearbySearch(
  {
    location: defaultLocation, 
    radius: 4000, 
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

  draw();

  initAutocomplete();

  google.charts.load('current', {'packages':['bar']});
  google.charts.setOnLoadCallback(zomatoChart);
  google.charts.setOnLoadCallback(foursquareChart);

}


function zomatoChart() {

  var restaurants;
  $.getJSON( "json/zomato.json", function( data ) {
    //first 10 only 
    restaurants = data.restaurants.slice(0,10);
    var arrayResults = [];
    arrayResults.push(['Restaurant', 'Rating', 'Votes', 'Average Cost for 2']);
    // arrayResults.push(['Restaurant', 'Rating']);

    
    restaurants.forEach(function(val) {
      arrayResults.push([val.restaurant.name, parseFloat(val.restaurant.user_rating.aggregate_rating), parseInt(val.restaurant.user_rating.votes), parseInt(val.restaurant.average_cost_for_two)]);
      // arrayResults.push([val.restaurant.name, parseFloat(val.restaurant.user_rating.aggregate_rating)]);
    });

    var data = google.visualization.arrayToDataTable(
        arrayResults
    );

    var options = {
      chart: {
        title: 'Zomato',
        subtitle: 'Restaurants Rating',

      },
      bars: 'vertical' // Required for Material Bar Charts.
    };

    var chart = new google.charts.Bar(document.getElementById('zomato'));
    chart.draw(data, google.charts.Bar.convertOptions(options));



  });
}

function foursquareChart() {
  var restaurants;
  $.getJSON( "json/foursquare.json", function( data ) {
    //first 10 only 
    restaurants = data.restaurants.slice(0,10);
    var arrayResults = [];
    arrayResults.push(['Restaurant', 'No. Check-Ins', 'No. Customers']);
    // arrayResults.push(['Restaurant', 'Rating']);

    
    restaurants.forEach(function(val) {
      arrayResults.push([val.name, parseInt(val.stats.usersCount), parseInt(val.stats.checkinsCount)]);
    });

    var data = google.visualization.arrayToDataTable(
        arrayResults
    );

    var options = {
      chart: {
        title: 'FourSquare',
        subtitle: 'Restaurants Rating',

      },
      bars: 'vertical' // Required for Material Bar Charts.
    };

    var chart = new google.charts.Bar(document.getElementById('foursquare'));
    chart.draw(data, google.charts.Bar.convertOptions(options));

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

  if (types == "") {
    types = "restaurant";
  }
  // Perform a nearby search.
  service.nearbySearch(
  {
    location: defaultLocation, 
    radius: 4000, 
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

  draw();


}

function deleteLists(places) {
  document.getElementById('places').innerHTML = '';

}

function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  var placesList = document.getElementById('places');

  for (var i = 0, place; place = places[i]; i++) {

    var newIcon = place.icon.replace("place_api/icons", "ms2/micons");
        newIcon = newIcon.replace("-71","");

    var iconShadow = newIcon.replace(".png", ".shadow.png");

    if(~newIcon.indexOf("generic_business")){
        newIcon = newIcon.replace("generic_business","restaurant");
    }else if(~newIcon.indexOf("cafe")){
        newIcon = newIcon.replace("cafe","restaurant");
    }


    var pinImage = new google.maps.MarkerImage(newIcon,
        new google.maps.Size(71, 71),
        new google.maps.Point(0, 0),
        new google.maps.Point(17, 34),
        new google.maps.Size(30, 30));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(71, 71),
        new google.maps.Point(0, 0),
        new google.maps.Point(17, 34));

    var image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(30, 30)
    };

    marker = new google.maps.Marker({
      map: map,
      icon: pinImage,
      shadow: pinShadow,
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

function setMapOnAllCircle(map) {
  for (var i = 0; i < circlemarkers.length; i++) {
    circlemarkers[i].setMap(map);
  }
}

function clearCircleMarkers() {
  setMapOnAllCircle(null);
}

function deleteCircleMarkers() {
  clearCircleMarkers();
  circlemarkers = [];
}

function setMarkerInfo(newMarker, place){

  infowindow = new google.maps.InfoWindow;
  var opening = '';
    if (typeof place != "undefined" && place.opening_hours) {
        if (place.opening_hours.open_now) {
            opening = '<h3 style="color: green;">Open now</h3>';
        } else {
            opening = '<h3 style="color: red;">Closed</h3>';
        }

    }

    if(place){
      var placeName = (place.name) ? '<h2>' + place.name + ' </h2>' : '' ;
      var placeVicinity = (place.vicinity) ? place.vicinity + '<br> <a href="#" id="get-direction-' + place.id + '" class="get-direction">GO HERE and see directions!</a><br>' : '' ;
      var specialty = (place.specialty) ? 'Specialty : ' + place.specialty + '<br>' : '' ;
      var placeTypes = (place.types) ? 'Restaurant type : ' + place.types + '<br>' : '';
      var rating = ""
      if (place.rating){
        if(place.rating > 3.9){
          rating = '<h3 style="color: green;">Rating : ' + place.rating + '</h3>';
        }else if(place.rating > 2.5){
          rating = '<h3 style="color: orange;">Rating : ' + place.rating + '</h3>';
        }else{
          rating = '<h3 style="color: red;">Rating : ' + place.rating + '</h3>';
        }
      }
    }
    

    var from = "";
    var checkinCount = "";
    var customerCount = "";
    
    // add on click event on markers to show restaurant details
    google.maps.event.addListener(newMarker, 'click', function() {
      let venues = callFourSquare(place.geometry.location.toUrlValue(5), place.name); //to display data from FourSquare
      if (venues != ""){
        from = "<strong style='color: orange; font-size: 15px;'>FOURSQUARE :</strong><br>";
        checkinCount = (venues.checkinCount) ? 'Checkin Count : ' + venues.checkinCount + '<br>': "";
        customerCount = (venues.customerCount) ? 'Customer Count : ' + venues.customerCount + '<br>': "";

      }
        infowindow.setContent('<div>' + 
            placeName + '' +
            placeVicinity +
            opening +
            specialty +
            rating  + 
            placeTypes + "<br>" + 
            from +
            checkinCount +
            customerCount
        );

        infowindow.open(map, this);

    });

    // on click get direction
    $(document).off('click', '#get-direction-' + place.id).on('click', '#get-direction-' + place.id, function() {

        // Clear past routes
        if (directionsDisplay != null) {
            directionsDisplay.setMap(null);
            directionsDisplay = null;
        }

        calculateAndDisplayRoute(place.geometry.location, place.name);

    });
}

// get and set destination
function calculateAndDisplayRoute(destination, name) {
    // directions request on service
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

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
          // var routeSegment = i + 1;
          summaryPanel.innerHTML += "START " + route.legs[i].start_address + '<br><br>';
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
    var url = "https://api.foursquare.com/v2/venues/search?intent=match&ll="+coordinates+"&name="+restoName+"&limit=10&client_id="+clientId+"&client_secret="+clientSecret+"&oauth_token="+oAuthToken+"&v=20180530";

    
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
    return "";
  }
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
  deleteCircleMarkers();
    if (shape == null || (!(shape instanceof google.maps.Circle))) return;

    if (circle != null) {
        circle.setMap(null);
        circle = null;
    }

    circle = shape;

    let newService = new google.maps.places.PlacesService(map);
    let circlerestaurants;

    let types = document.getElementById("types").value;

    if (types == "") {
      types = "restaurant";
    }

    newService.nearbySearch({
        location: {lat : circle.getCenter().lat(), lng : circle.getCenter().lng() },
        radius: circle.getRadius(),
        type: [types],
        }, function callback(results, status) {
        let restoNumbers = 0;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            circlerestaurants = results;
            createMarkers(circlerestaurants);
            restoNumbers = circlerestaurants.length;
        }

        createCircleLabel(circle.getCenter().lat(), circle.getCenter().lng(), restoNumbers, circlerestaurants);
    });
}

function createCircleLabel(lat, lng, restoNumbers, place){

   circleMarker = new google.maps.Marker({
      map: map,
      position: {lat : lat, lng : lng},
      label: restoNumbers.toString()
  });

   circlemarkers.push(circleMarker);
   setMarkerInfo(circleMarker, place);
}
 


 function initAutocomplete() {

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    createMarkers(places);

  });
}