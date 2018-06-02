
<?php

	$apiKey = "AIzaSyDlZ8Y5sZPKNOxTmR4c1AdHUxBHGNJpvQw";
	$coordinates = "10.3157,123.8854";

	$url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=".$coordinates."&radius=4000&type=restaurant&key=".$apiKey;

    $curl = curl_init();
	// Set some options - we are passing in a useragent too here
	curl_setopt_array($curl, array(
	    CURLOPT_RETURNTRANSFER => 1,
	    CURLOPT_URL => $url
	));
	// Send the request & save response to $resp
	$resp = curl_exec($curl);
	// Close request to clear up some resources
	curl_close($curl);

	$ret = json_decode($resp,true);
	$response['restaurants'] = $ret['results'];

	$fp = fopen('../json/googleplace.json', 'w+');
	fwrite($fp, json_encode($response, JSON_PRETTY_PRINT));
	fclose($fp);

	echo "Saved GooglePlace Data!";

?>