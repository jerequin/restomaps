<?php

	$apiKey = "b1cd2a52d0e02ba345f0eb9f29088097";

	$url = "https://developers.zomato.com/api/v2.1/search?count=50&lat=10.3157&lon=123.8854&count=50&radius=4000";

    $curl = curl_init();

    $headers = array(
	    'Accept: application/json',
	    'user-key: '.$apiKey
	);
	// Set some options - we are passing in a useragent too here
	curl_setopt_array($curl, array(
	    CURLOPT_HTTPHEADER => $headers,
	    CURLOPT_RETURNTRANSFER => 1,
	    CURLOPT_URL => $url,
	    CURLOPT_USERAGENT => 'Codular Sample cURL Request'
	));
	// Send the request & save response to $resp
	$resp = curl_exec($curl);
	// Close request to clear up some resources
	curl_close($curl);

	$ret = json_decode($resp, true);

	$response['restaurants'] = $ret['restaurants'];

	$fp = fopen('../json/zomato.json', 'w+');
	fwrite($fp, json_encode($response, JSON_PRETTY_PRINT));
	fclose($fp);


	echo "Saved Zomato Data!";

?>