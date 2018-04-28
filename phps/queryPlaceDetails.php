<?php

include('utils.php'); 

function searchHighResolutionPic($photo_reference, $max_width, $api_key)
{
	$url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=" . $max_width . "&photoreference=" . $photo_reference . "&key=" . $api_key;
	$responsetext = file_get_contents($url);
	$path = $photo_reference . ".jpg";
	file_put_contents($path, $responsetext);
	return "NearbySearchApp/phps/" . $path;
}

function convertTimeStampToDate($timestamp) 
{
		$data = new DateTime();
		$data->setTimestamp($timestamp);
		return $data->format('Y-m-d H:i:s');
}

function searchPlaceDetails($place_id, $api_key)
{
	$url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" . $place_id . "&key=" . $api_key;
	$json_responsetext = Utils::requestGoogleAPI($url);
	$requested_result = array();
	$requested_result['result']['reviews'] = array();
	$requested_result['result']['photos'] = array();

	// reviews
	$max_num = 10;
	$count = 1;
	foreach ($json_responsetext['result']['reviews'] as $review) 
	{

		$single_result = array();
		$single_result['author_name'] = $review['author_name'];
		$single_result['profile_photo_url'] = $review['profile_photo_url'];
		$single_result['text'] = $review['text'];
		$single_result['rating'] = $review['rating'];
		$single_result['time'] = convertTimeStampToDate((int)$review['time']);
		$single_result['url'] = $review['author_url'];
		
		array_push($requested_result['result']['reviews'], $single_result);

		if ($count >= $max_num) {
			break;
		}
		else
		{
			$count = $count + 1;
		}
	}

	//photos
	$count = 1;
	foreach ($json_responsetext['result']['photos'] as $photo) 
	{
		$path = searchHighResolutionPic($photo['photo_reference'], 600, $api_key);
		array_push($requested_result['result']['photos'], $path);

		if ($count >= $max_num) {
			break;
		}
		else
		{
			$count = $count + 1;
		}
	}

	$requested_result['result']['name'] = $json_responsetext['result']['name'];
	$requested_result['result']['formatted_address'] = $json_responsetext['result']['formatted_address'];
	$requested_result['result']['formatted_phone_number'] = $json_responsetext['result']['formatted_phone_number'];
	$requested_result['result']['rating'] = $json_responsetext['result']['rating'];
	$requested_result['result']['url'] = $json_responsetext['result']['url'];
	$requested_result['result']['website'] = $json_responsetext['result']['website'];
	$requested_result['result']['latitude'] = $json_responsetext['result']['geometry']['location']['lat'];
	$requested_result['result']['longitude'] = $json_responsetext['result']['geometry']['location']['lng'];
	$requested_result['result']['price_level'] = $json_responsetext['result']['price_level'];

	//address components
	$requested_result['result']['address_components']['street'] = "";
	$requested_result['result']['address_components']['city'] = "";
	$requested_result['result']['address_components']['state'] = "";
	$requested_result['result']['address_components']['country'] = "";
	$requested_result['result']['address_components']['zip_code'] = "";

	// $street_number = "";
	// $route = "";
	foreach ($json_responsetext['result']['address_components'] as $address) 
	{
		if ($address["types"][0] == "street_number") 
		{
			$street_number = $address["long_name"];
		}
		else if ($address["types"][0] == "route") 
		{
			$route = $address["long_name"];
		}
		else if ($address["types"][0] == "locality")
		{
			$requested_result['result']['address_components']['city'] = $address["long_name"];
		}
		else if ($address["types"][0] == "administrative_area_level_1")
		{
			$requested_result['result']['address_components']['state'] = $address["short_name"];
		}
		else if ($address["types"][0] == "country")
		{
			$requested_result['result']['address_components']['country'] = $address["short_name"];
		}
		else if ($address["types"][0] == "postal_code")
		{
			$requested_result['result']['address_components']['zip_code'] = $address["long_name"];
		}
	}
	$requested_result['result']['address_components']['street'] = $street_number . " " . $route;

	$requested_result['status'] = $json_responsetext['status'];

	return json_encode($requested_result);
	//return json_encode($json_responsetext);
}

$api_key = parse_ini_file('../properties/global.ini')['api_key'];
$place_id = $_GET["place_id"];

//return json
//{result:{reviews:[], photos:[], name:XXX}, 
//status:XXX
//}
echo searchPlaceDetails($place_id, $api_key);

// echo 1;
?>