<?php

include('utils.php');

function transferStrToJson($str)
{
	$temp = explode(',', $str);
	$json_str = "{\"lat\": $temp[0], \"lng\": $temp[1]}";
	return json_decode($json_str, true);
}

function mapAddressToGeo($address, $api_key)
{
	$url_map = "https://maps.googleapis.com/maps/api/geocode/json?address=" . $address . "&key=" . $api_key;		
	$json_responsetext = Utils::requestGoogleAPI($url_map);
	$geometry = $json_responsetext['results'][0]['geometry']['location']['lat'] . "," . $json_responsetext["results"][0]["geometry"]["location"]["lng"];	

	return $geometry;
}

function nearyby($keyword, $radius, $type, $geometry, $api_key)
{
	$url_nearby = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" . $geometry . "&radius=" . $radius . "&type=" . $type . "&keyword=" . $keyword . "&key=" . $api_key;
	$json_responsetext = Utils::requestGoogleAPI($url_nearby);		
	return $json_responsetext;
}

function searchNearby($keyword, $radius, $type, $geometry, $api_key)
{
	$json_responsetext = nearyby($keyword, $radius, $type, $geometry, $api_key);
	$requested_result = array();
	$requested_result['results'] = array();
	foreach ($json_responsetext['results'] as $result) 
	{
		$single_result = array();
		$single_result['icon'] = $result['icon'];
		$single_result['name'] = $result['name'];
		$single_result['vicinity'] = $result['vicinity'];
		$single_result['place_id'] = $result['place_id'];
		$single_result['geometry'] = $result['geometry']['location'];
		array_push($requested_result['results'], $single_result);
	}
	$requested_result['geometry'] = transferStrToJson($geometry);
	$requested_result['status'] = $json_responsetext['status'];
	$requested_result['next_page_token'] = $json_responsetext['next_page_token'];

	return json_encode($requested_result);
}

$api_key = parse_ini_file('../properties/global.ini')['api_key'];

$keyword = $_GET["keyword"];
$radius = $_GET["radius"];
$type = $_GET["category"];
$location = $_GET["location"];
$flag = $_GET["flag"];

if ($flag == "here") 
{
	$geometry = $location;
}
else if ($flag == "location")
{
	$geometry = mapAddressToGeo(Utils::replaceSpaceWithPlus($location), $api_key);
}		

echo searchNearby(Utils::replaceSpaceWithPlus($keyword), $radius, Utils::replaceSpaceWithUnderscore($type), $geometry, $api_key);

?>