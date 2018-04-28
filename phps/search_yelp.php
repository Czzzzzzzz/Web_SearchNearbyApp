<?php
/**
 * Yelp Fusion API code sample.
 *
 * This program demonstrates the capability of the Yelp Fusion API
 * by using the Business Search API to query for businesses by a 
 * search term and location, and the Business API to query additional 
 * information about the top result from the search query.
 * 
 * Please refer to http://www.yelp.com/developers/v3/documentation 
 * for the API documentation.
 * 
 * Sample usage of the program:
 * `php sample.php --term="dinner" --location="San Francisco, CA"`
 */
// API key placeholders that must be filled in by users.
// You can find it on
// https://www.yelp.com/developers/v3/manage_app
$API_KEY = parse_ini_file('../properties/global.ini')['yelp_api_key'];
// Complain if credentials haven't been filled out.
assert($API_KEY, "Please supply your API key.");
// API constants, you shouldn't have to change these.
$API_HOST = "https://api.yelp.com";
$SEARCH_PATH = "/v3/businesses/search";
$BUSINESS_PATH = "/v3/businesses/";  // Business ID will come after slash.
$BEST_MATCH_PATH = "/v3/businesses/matches/best";

/** 
 * Makes a request to the Yelp API and returns the response
 * 
 * @param    $host    The domain host of the API 
 * @param    $path    The path of the API after the domain.
 * @param    $url_params    Array of query-string parameters.
 * @return   The JSON response from the request      
 */
function request($host, $path, $url_params = array()) {
    // Send Yelp API Call
    try {
        $curl = curl_init();
        if (FALSE === $curl)
            throw new Exception('Failed to initialize');
        $url = $host . $path . "?" . http_build_query($url_params);
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,  // Capture response.
            CURLOPT_ENCODING => "",  // Accept gzip/deflate/whatever.
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "authorization: Bearer " . $GLOBALS['API_KEY'],
                "cache-control: no-cache",
            ),
        ));
        $response = curl_exec($curl);
        if (FALSE === $response)
            throw new Exception(curl_error($curl), curl_errno($curl));
        $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($response, $http_status);
        curl_close($curl);
    } catch(Exception $e) {
        trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
    }
    return $response;
}

function bestMatch($name, $street, $city, $state, $country, $zip_code)
{
    $url_params = array();
    
    $url_params['name'] = $name;
    $url_params['city'] = $city;
    $url_params['state'] = $state;
    $url_params['country'] = $country;
    $url_params['address1'] = $street;   
    $url_params['zip_code'] = $zip_code;

    return request($GLOBALS['API_HOST'], $GLOBALS['BEST_MATCH_PATH'], $url_params);
}

function get_reviews($id)
{
    $path = "/v3/businesses/" . $id . "/reviews";
    return request($GLOBALS['API_HOST'], $path);   
}

function query_reviews($name, $street, $city, $state, $country, $zip_code)
{
    $reponse = json_decode(bestMatch($name, $street, $city, $state, $country, $zip_code), true);
    $id = $reponse['businesses'][0]['id'];
    // $id = "1";

    $requested_result = array();
    $requested_result['result']['reviews'] = array();

    if ($id) 
    {
         $json_responsetext = json_decode(get_reviews($id), true);
         foreach ($json_responsetext['reviews'] as $review)
         {
            $single_result = array();
            $single_result['author_name'] = $review['user']['name'];
            $single_result['profile_photo_url'] = $review['user']['image_url'];
            $single_result['text'] = $review['text'];
            $single_result['time'] = $review['time_created'];
            $single_result['rating'] = $review['rating'];
            $single_result['url'] = $review['url'];

            array_push($requested_result['result']['reviews'], $single_result);
         }
         $requested_result['status'] = "OK";
    }
    else
    {
        $requested_result['status'] = "ZERO_RESULTS";
    }

    return json_encode($requested_result);
}

$name = $_GET["name"];
$city = $_GET["city"];
$state = $_GET["state"];
$country = $_GET["country"];
$street = $_GET["street"];
$zip_code = $_GET["zip_code"];

// $name = "USC Law School Cafe";
// $city = "Los Angeles";
// $state = "CA";
// $country = "US";
// $street = "699 Exposition Blvd";
// $zip_code = "94301";

echo query_reviews($name, $street, $city, $state, $country, $zip_code);

?>