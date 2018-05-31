# RestoMaps

Plotting of Restaurants in **Google Map**, using Google Map Javascript API.

See : https://jerequin.github.io/restomaps/

## Features

 - Display Restaurants using Google Maps Places API
	 - Displays in Right Panel
 - Filter list using dropdown types
 	 - Displays in Right Panel
 - See Destination from point A to point B
	 - Direction Service
	 - Direction Display
	 - Displays in Right Panel the Streets
 - Draw Circle using DrawingManager Circle
	 - Display Number of Restaurants (or any type you have set)
	 - Search and Display Restaurants around the radius of the Circle
 - Clicking on the Marker Icon displays information
	 - Displays Customer and Check-in Counts using FourSquare API
	 - Can see Destination


### Exercise 

 1. ***Plot restaurants across Cebu.***
	- Using Places API, it has restriction to get only 20 and upto 60 records if using pagination. Added button More Results to display the records.
 2.  ***Each restaurant will have at least 1 food specialty.*** 
	 - There's no specialty field when using nearbysearch Places API (I think) so I didn't place or display one.
	 - sample response:  
			`geometry:{location:  _.K,  viewport:  _.qc}
			html_attributions:["Listings by <a href="http://www.openrice.com/">OpenRice</a>"]
			icon:"https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png"
			id:"b60426b40b1433092cf93945e05c1e59bf240e87"
			name:"M Citi Suites"
			opening_hours:{open_now:  true,  weekday_text:  Array(0)}
			photos:[{…}]
			place_id:"ChIJMUxTlk6ZqTMRb6rATEaXG2A"
			rating:3.8
			reference:"CmRRAAAAT8FT2x531b-WLX2fVnyHqVqb0ECmMXtjMY6SijRxV0AuE4sSsuauJFf3BjBiE7HjakoCYKYC9XmUQGL6E9pLGd8IcPzMjcUVuvwH9blNf4URV7qw3oFC-wjHz8qU0MvzEhCecEVo-s7fNNx5ZcU6I7ZaGhTi-tXS_2a1cO2ENyGI_cVxf2YF9g"
			scope:"GOOGLE"
			types:(7) ["cafe",  "store",  "lodging",  "restaurant",  "food",  "point_of_interest",  "establishment"]
			vicinity:"J. Llorente Street, Cebu City`

 3.  ***A layer panel can filter the restaurant type to show.***
	 - In the right-panel, indicated types which I think can display different types of restaurant based on what I got in Places API
		 - Food
		 - Restaurant
		 - Cafe
		 - Store
		 - Meal Delivery
		 - Night Club
	 - Refresh the list when Type is changed
 4.  ***Each restaurant can keep track of the number of customers that visited.***
	 - Using FourSquare API, get and display Check-in and Customer count in infowindow of marker
 5.  ***Customers can get direction to the restaurant from current location.*** 
	 - Clicking the item in the List will set the direstions from point A to point B
 6.  ***Draw a circle or rectangle on the map and and show the number of restaurants within the circle or rectangle.***
	 - Using Drawing Manager, I enabled only the Circle. Can see this at the top of the page, hand tool and circle tool.
	 - When used, it will display the number of restaurants (or type when you changed it) in a marker
	 - Also added search feature around the radius of the circle to display other restaurants.
 8.  Add any value adding feature like analytics to show relationships between patrons, restaurant and revenue. 
 
