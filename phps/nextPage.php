<?php
include('utils.php');

$api_key = parse_ini_file('../properties/global.ini')['api_key'];

function transferStrToJson($str)
{
	$temp = explode(',', $str);
	$json_str = "{\"lat\": $temp[0], \"lng\": $temp[1]}";
	return json_decode($json_str, true);
}

function nextPage($pageToken, $api_key)
{
	$url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" . $pageToken . "&key=" . $api_key;
	$json_responsetext = Utils::requestGoogleAPI($url);		
	return $json_responsetext;

}

function searchNextPage($pageToken, $api_key)
{
	$json_responsetext = nextPage($pageToken, $api_key);

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

$pageToken = $_GET["next_page_token"];

echo searchNextPage($pageToken, $api_key);

?>