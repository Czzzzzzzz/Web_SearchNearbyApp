<?php

class Utils
{
		/*
	* function tools 
	*/
	public static function replaceSpaceWithPlus($str)
	{
		return str_replace(" ", "+", $str);
	}	

	public static function replaceSpaceWithUnderscore($str)
	{
		return str_replace(" ", "_", $str);
	}

	/*
	* google api request functions
	*/
	public static function requestGoogleAPI($url)
	{
		$responsetext = file_get_contents($url);			
		$json_responsetext = json_decode($responsetext, true);
		return $json_responsetext;
	}

	public function test()
	{
		return 1;
	}

	public static function test2()
	{
		return 2;
	}
}

$abc = 1;
?>