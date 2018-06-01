<?php

	$clientId = "3NDCCM2DYYVQUQXIDBB2MMIGVPTNDGYEXK4CIAQSUXNLQX3F";
    $clientSecret = "S3YYYPHGA1EGTMXGW5WZUQIFROAEHRFG43PYA2ENQITMCWYW";
    $oAuthToken = "I25B33JZSODPTRGZL51MUF1LH313XORDHNRQELUVIFHSBYEF";
	$coordinates = "10.3157,123.8854";

	$url = "https://api.foursquare.com/v2/venues/search?&ll=".$coordinates."&client_id=".$clientId."&client_secret=".$clientSecret."&oauth_token=".$oAuthToken."&v=20180530";

    $curl = curl_init();
	// Set some options - we are passing in a useragent too here
	curl_setopt_array($curl, array(
	    CURLOPT_RETURNTRANSFER => 1,
	    CURLOPT_URL => $url,
	    CURLOPT_USERAGENT => 'Codular Sample cURL Request'
	));
	// Send the request & save response to $resp
	$resp = curl_exec($curl);
	// Close request to clear up some resources
	curl_close($curl);

	$ret = json_decode($resp, true);

	$response['restaurants'] = $ret['response']['venues'];

	$fp = fopen('json/foursquare.json', 'w+');
	fwrite($fp, json_encode($response, JSON_PRETTY_PRINT));
	fclose($fp);

	print_r($response['restaurants']);
?>