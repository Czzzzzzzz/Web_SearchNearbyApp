var API_KEY = "AIzaSyB74gLDIEbKV_rMkt1l7Lah1JicNVDFxX8";

var UNIT = 1609.34;

function cloneJsonObj(input)
{
	if (input) 
	{
		return JSON.parse(JSON.stringify(input));
	}
	else
	{
		return input;
	}

}

function mutiplySymbol(num, symbol)
{
  var str = "";
  for(var i = 0; i < num; i++)
  {
    str += symbol;
  }
  return str;
}

//determine wehether the search button should be disabled depending on the status of 
//keyword input, radio, and location input
function isSearchDisabled(id_input_keyword, id_rd_from_location, id_input_location, id_search_button)
{

	if ($("#" + id_rd_from_location).prop("checked")) 
	{
		if ($.trim($("#" + id_input_location).val()) != "" && $("#" + id_input_keyword) != "") 
		{
			$("#" + id_search_button).prop("disabled", false);
		}
		else
		{
			$("#" + id_search_button).prop("disabled", true);			
		}
	}
	else
	{
		if ($.trim($("#" + id_input_keyword).val()) != "") 
		{
			$("#" + id_search_button).prop("disabled", false);
		}
		else
		{
			$("#" + id_search_button).prop("disabled", true);			
		}
	}

}

function clickPhoto(img)
{
	var url = img.src;
	window.open(url, "_blank");
}

function click_profile_photo()
{
	return function(url){
		window.open(url, "_blank")
	};
}

function rd_changed()
{
	if (document.getElementById("here").checked) 
	{
		document.getElementById("input_location").disabled = true;
		$("#invalid_location").css("display", "none");
	}
	else
	{
		document.getElementById("input_location").disabled = false;
	}

	isSearchDisabled("keyword", "location", "input_location", "bt_search");
	
}

function input_valid(id_invalid_msg)
{
	return function(){

		isSearchDisabled("keyword", "location", "input_location", "bt_search");

		var value = $(this).val();
		if ($.trim(value) == "") 
		{
			$("#" + id_invalid_msg).css("display","block");			
		}
		else
		{
			$.trim($.trim(value))
			$("#" + id_invalid_msg).css("display","none");	
		}
	}
}

//wrap the ajax function
function ajax_request(method, url, params, callback)
{
	xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = callback;
	xhttp.open(method, url, true);
	xhttp.send(params);
}		

function extractAddressFromJson(jsonObj)
{
	return jsonObj.lat + "," + jsonObj.lon;
}

// query the current location from ip website.
function queryLocation_callback()
{
	if (this.readyState == 4 &&  this.status != 200) 
	{
	alert("the IP address cannot be found!");
	}
	else (this.readyState == 4 && this.status == 200) 
	{
		var jsonObj = JSON.parse(this.responseText);    				
		document.getElementById("geo_here").innerHTML = extractAddressFromJson(jsonObj);      				
		// document.getElementById("bt_search").disabled = false;
	}
}

function queryLocation(url)
{
	ajax_request("POST", url, null, queryLocation_callback);
}


//remove specified item from an array
function removeItem(array, item)
{
  var index = array.indexOf(item);
  if (index !== -1) array.splice(index, 1);
}

/*clear button*/
function clear(_scope)
{
	return function()
	{

		document.getElementById("keyword").value = "";
		document.getElementById("radius").value = "";
		document.getElementById("input_location").value = "";
		document.getElementById("input_location").disabled = true;
		document.getElementById("category").value = "default";
		document.getElementById("here").checked = true;

		switchToResultsPage(_scope);

		_scope.table_display_flag = true;
	}
}

function interpreteWeekdayInfo(weekday_text)
{
	var jsonObj = [];
	var today_index = (new Date()).getDay() - 1;

	for(var i = today_index; i < weekday_text.length; i++)
	{
		var temp = {};
		var text = weekday_text[i];
		var day = text.substr(0, text.indexOf(" ") - 1);
		var time = text.substr(text.indexOf(" ") + 1);
    	
    	temp.day = day;
    	temp.time = time;

    	jsonObj.push(temp);
	}

	for(var i = 0; i < today_index; i++)
	{
		var temp = {};
		var text = weekday_text[i];
		var day = text.substr(0, text.indexOf(" ") - 1);
		var time = text.substr(text.indexOf(" ") + 1);
    	
    	temp.day = day;
    	temp.time = time;

    	jsonObj.push(temp);
	}	

	return jsonObj;
}

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var placeService;
var map;
var marker;

function getDetails(_scope, place_id, geometry, item)
{
	//convert jquery object to javascript object
	var map_node = $("#map_display")[0];

    map = new google.maps.Map(map_node, {
		zoom: 12,
  		center: geometry,
  		mapTypeControl: false		          		
	});

    marker = new google.maps.Marker({
      position: geometry,
      map: map
    });

   
    placeService = new google.maps.places.PlacesService(map);

    var request = {placeId : place_id};

    placeService.getDetails(request, function(place, status){
    	if (status == google.maps.places.PlacesServiceStatus.OK) 
  		{
    		// createMarker(place);
    		// deal with profile tab
    		var jsonObj = {};
    		jsonObj.vicinity = place.formatted_address;
    		jsonObj.phone_number = place.international_phone_number;
    		jsonObj.price_level = mutiplySymbol(place.price_level, "$");
    		jsonObj.rating = place.rating;
    		jsonObj.google_page = place.url;
    		jsonObj.website = place.website;
    		jsonObj.name = place.name;
			jsonObj.opening_hours = place.opening_hours;
			jsonObj.geometry = place.geometry.location;
			jsonObj.place_id = place.place_id;

    		if (localStorage.getItem(place.place_id)) 
    		{
    			jsonObj.isFavorite = 1;
    		}
    		else
    		{
    			jsonObj.isFavorite = 0;	
    		}

    		if (place.opening_hours) 
    		{
				jsonObj.weekday_info = interpreteWeekdayInfo(place.opening_hours.weekday_text);
	    		jsonObj.current_day_time = jsonObj.weekday_info[(new Date()).getDay() - 1].time;
    		}
    		

    		_scope.detail_result = jsonObj;

    		//detail_item is used for favorite button.
    		_scope.detail_item = item;

    		//initialize input box in map tab.
			_scope.directionData.input_to = jsonObj.vicinity;

			//initialize photos
			_scope.photo_urls = new Array();
			if (place.photos)
			{
				for(var i = 0; i < place.photos.length; i++)
				{
					_scope.photo_urls[i] = place.photos[i].getUrl({'maxWidth': 400, 'maxHeight': 400});
				}
			}

			//initialize reviews
			if (!place.reviews) 
			{
				_scope.google_reviews = [];
			}
			else
			{
				_scope.google_reviews = place.reviews;	
			}


			for(var i = 0; i < _scope.google_reviews.length; i++)
			{
				var now = new Date(_scope.google_reviews[i].time * 1000);
				var formattted_time = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
				_scope.google_reviews[i].time = formattted_time;
			}

			//restore the detail view to default status.
			_scope.reviewsSource = "Google Reviews";
			_scope.google_review_flag = false;
			_scope.yelp_review_flag = true;

			//reset button status
			$("#bt_switchToDetail").prop("disabled", false);


			//retain the default order of reviews
    		_scope.google_default_reviews = cloneJsonObj(_scope.google_reviews);

    		_scope.$apply();
  		}
    });

	directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel($('#right-panel')[0]);
}	

function getDirection(_scope)
{
	return function(){
		var selectedMode = _scope.directionData.travel_mode.toUpperCase();

		var ori;
		if (_scope.directionData.input_from == "Your Location") 
		{
			ori = _scope.search_result_geometry;
		}
		else
		{
			ori = _scope.directionData.input_from;
		}

		//the origin and destination could be geometry or string type.
		var request = {
			origin: ori,
			destination: _scope.directionData.input_to,
			travelMode: google.maps.TravelMode[selectedMode],
			provideRouteAlternatives : true
		};

		directionsService.route(request, function(response, status) {
			if (status == 'OK') {
				directionsDisplay.setDirections(response);
				marker.setMap(null);

			}else {
            	window.alert('Directions request failed due to ' + status);
          	}
		});
	};
}

function switchPanorama(_scope)
{
	return function(location){
		var panorama = map.getStreetView();
		panorama.setPosition(location);

		var toggle = panorama.getVisible();
        if (toggle == false) {
          panorama.setVisible(true);
          $("#img_panorama").attr("src", "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png");

        } else {
          panorama.setVisible(false);
          $("#img_panorama").attr("src", "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
        }

	};
}

function addFavorite(_scope)
{
	return function($event, item){
		
		//convert html node obtained from $event to jquery object.
		var currentNode = $($event.currentTarget);

		// alert(currentNode.children("img").attr("src", "..."));
		// alert(currentNode.children("img").attr("src"));

		var favorite_ids;
		if(localStorage.getItem('favorite_ids'))
		{
			favorite_ids = JSON.parse(localStorage.getItem('favorite_ids'));
		}
		else
		{
			favorite_ids = [];
		}

		if (localStorage.getItem(item.place_id)) 
		{
			localStorage.removeItem(item.place_id);
			removeItem(favorite_ids, item.place_id);

			currentNode.children("img").attr("src", "./imgs/not_favorite.png");
			// alert(currentNode.children("img")[0].attr("src"));
		}
		else
		{
			localStorage.setItem(item.place_id, JSON.stringify(item));
			favorite_ids.push(item.place_id);		
			
			currentNode.children("img").attr("src", "./imgs/favorite.png");
		}

		_scope.search_result = addFavouriteFlag(_scope.search_result);

		localStorage.setItem("favorite_ids", JSON.stringify(favorite_ids));

		var jsonObj = [];
		for(var i = 0; i < favorite_ids.length; i++)
		{
			jsonObj.push(JSON.parse(localStorage.getItem(favorite_ids[i])));
		}

		_scope.favorite_result = jsonObj;		
	}

}

function switchToFavorPage(_scope)
{
	return function(){
		
		if(localStorage.getItem('favorite_ids'))
		{
			favorite_ids = JSON.parse(localStorage.getItem('favorite_ids'));
		}
		else
		{
			favorite_ids = [];
		}

		var jsonObj = [];
		for(var i = 0; i < favorite_ids.length; i++)
		{
			jsonObj.push(JSON.parse(localStorage.getItem(favorite_ids[i])));
		}

		_scope.favorite_result = jsonObj;

		$("#btn_results").removeClass("btn-primary").addClass("btn-light");
		$("#btn_favorite").removeClass("btn-light").addClass("btn-primary");

		_scope.table_display_flag = true;
		_scope.favorite_display_flag = false;
		_scope.tabs_display_flag = true;

	}
}

function switchToResultsPage(_scope)
{
	return function(){
		_scope.table_display_flag = false;
		_scope.favorite_display_flag = true;
		_scope.tabs_display_flag = true;

		$("#btn_results").removeClass("btn-light").addClass("btn-primary");
		$("#btn_favorite").removeClass("btn-primary").addClass("btn-light");
	}
}

function addFavouriteFlag(data)
{
	for(var i = 0; i < data.length; i++)
	{
		if(localStorage.getItem(data[i].place_id))
		{
			data[i].isFavorite = 1;
		}
		else
		{
			data[i].isFavorite = 0;	
		}
			
	}

	return data;
}

function search(_scope, _http)
{
	return function(){

			_scope.progess_bar = true;


			$("#bt_switchToDetail").prop("disabled", true);			

			var parameters = "?keyword=" + _scope.formData.keyword + "&category=" + _scope.formData.category 
					+ "&radius=" + _scope.formData.radius * UNIT;

			if (document.getElementById("here").checked) 
			{
				parameters += "&location=" + document.getElementById("geo_here").innerHTML
								+"&flag=here";
				_scope.directionData.input_from = "Your Location";
			}
			else
			{
				parameters += "&location=" + document.getElementById("input_location").value
								+"&flag=location";
				_scope.directionData.input_from = $("#input_location").val();
			}

			var url = './phps/search.php' + parameters;
		

		    _http.get(url)
					    .then(function success(response) {
							_scope.page_num = 1;

							//judge whether the search result is added to favourite list
							var results = addFavouriteFlag(response.data.results);
					        
					        // _scope.search_result = response.data.results;
					        _scope.search_result = results;
					        _scope.search_result_status = response.data.status;
					        _scope.search_result_geometry = response.data.geometry;

					        //if no page token, the value would be null
					        _scope.search_result_pageToken = response.data.next_page_token;


					        _scope.table_display_flag = false;
							_scope.tabs_display_flag = true;

							_scope.progess_bar = false;

					    }, function error(response) {
					        //Second function handles error
					        alert(error);
					    });
			};
}

function switchReviews(_scope, _http)
{
	return function(){
		if (_scope.reviewsSource == "Google Reviews") 
		{
			_scope.google_review_flag = false;
			_scope.yelp_review_flag = true;
		}
		else
		{
			//if the yelp data has been retrived.			
			if ($("#is_yelp_flag").val() == "1") 
			{
				_scope.google_review_flag = true;
				_scope.yelp_review_flag = false;								
			}
			else
			{
				var formatted_address = _scope.detail_result.vicinity;
				var seperate_address = formatted_address.split(",");

				var len = seperate_address.length;
				var seperate_address_2 = seperate_address[len - 2].split("\ ");

				var city = $.trim(seperate_address[len - 3]);
				var state = $.trim(seperate_address_2[1]);
				var country = $.trim(seperate_address[len - 1]);			
				var street = "";

				if (seperate_address.length == 4) 
				{
					street = $.trim(seperate_address[len - 4]);
				}

				var name = _scope.detail_result.name;

				var parameters = "?city=" + city + "&state=" + state + "&country=" + country + "&name=" + name + "&street=" + street;
				var url = "./phps/search_yelp.php" + parameters;

				_http.get(url)
				    .then(function success(response) {			    	

				   		// _scope.yelp_reviews = response.data.reviews;

				   		if (response.data.reviews) 
				   		{
							_scope.yelp_reviews = response.data.reviews;				   			
				   		}
				   		else
				   		{
				   			_scope.yelp_reviews = [];				   				
				   		}

				   		//retain the default order of reviews
				   		_scope.yelp_default_reviews = cloneJsonObj(response.data.reviews);

				   		_scope.google_review_flag = true;
				   		_scope.yelp_review_flag = false;

				    }, function error(response) {
				        //Second function handles error
				        alert(response.status);
				  	});

			  	$("#is_yelp_flag").val(1);
			}

		}
	}
}

function switchOrder(_scope)
{
	return function(){
		if (_scope.orderMethod == "1") //"default order"
		{
			_scope.yelp_reviews = cloneJsonObj(_scope.yelp_default_reviews);
			_scope.google_reviews = cloneJsonObj(_scope.google_default_reviews);
		}
		else if(_scope.orderMethod == "2") //"highest rating"
		{

			if (_scope.yelp_reviews) 
			{
				var yep_ordered_reviews = _scope.yelp_reviews.sort(function (a, b){
				return b.rating - a.rating;
				})

				_scope.yelp_reviews = yep_ordered_reviews;
			}

			var google_ordered_reviews = _scope.google_reviews.sort(function (a, b){
				return b.rating - a.rating;
			})

			_scope.google_reviews = google_ordered_reviews;
		}
		else if(_scope.orderMethod == "3") //"least rating"
		{

			if (_scope.yelp_reviews)
			{
				var yep_ordered_reviews = _scope.yelp_reviews.sort(function (a, b){
					return a.rating - b.rating;
				})

				_scope.yelp_reviews = yep_ordered_reviews;
			}

			var google_ordered_reviews = _scope.google_reviews.sort(function (a, b){
				return a.rating - b.rating;
			})

			_scope.google_reviews = google_ordered_reviews;
		}
		else if(_scope.orderMethod == "4") // most recent 
		{
			if (_scope.yelp_reviews)
			{
				var yep_ordered_reviews = _scope.yelp_reviews.sort(function (a, b){
					
					var d1 = Date.parse(a.time_created);
        			var d2 = Date.parse(b.time_created);
        			
        			return d1 < d2;
				})

				_scope.yelp_reviews = yep_ordered_reviews;
						
			}

			var google_ordered_reviews = _scope.google_reviews.sort(function (a,b){
					var d1 = Date.parse(a.time);
        			var d2 = Date.parse(b.time);
        			
        			return d1 < d2;
			});

			_scope.google_reviews = google_ordered_reviews;
		}
		else if(_scope.orderMethod == "5")
		{
			if (_scope.yelp_reviews)
			{
				var yep_ordered_reviews = _scope.yelp_reviews.sort(function (a, b){
					
					var d1 = Date.parse(a.time_created);
        			var d2 = Date.parse(b.time_created);
        			
        			return d1 > d2;
				})

				_scope.yelp_reviews = yep_ordered_reviews;

			}

			var google_ordered_reviews = _scope.google_reviews.sort(function (a,b){
					var d1 = Date.parse(a.time);
        			var d2 = Date.parse(b.time);
        			
        			return d1 > d2;
			});

			_scope.google_reviews = google_ordered_reviews;
		}
	}
}

function nextPage(_scope, _http)
{
	return function(next_page_token){

		var parameters = "?next_page_token=" + next_page_token;

		var url = './phps/nextPage.php' + parameters;

	    _http.get(url)
				    .then(function success(response) {

				    	//put current page to the local storage
				    	localStorage.setItem("previousPage", JSON.stringify(_scope.search_result));
				    	localStorage.setItem("previousPageToken", JSON.stringify(next_page_token));

				    	_scope.page_num = _scope.page_num + 1;
				        _scope.search_result = response.data.results;

					    //if no page token, the value would be null
					    _scope.search_result_pageToken = response.data.next_page_token;	


				    }, function error(response) {
				        //Second function handles error
				        alert("error");
					});		
	}
}

function previousPage(_scope)
{
	return function(){

		_scope.search_result = JSON.parse(localStorage.getItem("previousPage"));
		_scope.search_result_pageToken = localStorage.getItem("previousPageToken");			
		
		_scope.page_num = _scope.page_num - 1;
	}
}

function twitter(_scope)
{
	return function()
	{
		var url = "https://twitter.com/intent/tweet?text=" + "Check out " + _scope.detail_result.name + " located at " + _scope.detail_result.vicinity 
					+ ". Website: " + _scope.detail_result.website + " #TravelAndEntertainmentSearch";
		
		url = url.replace("#", "%23");

		window.open(url, "_blank",'width=800, height=600');
	}
}

function switchToDetailPage(_scope)
{
	return function(){

		_scope.table_display_flag = true;
		_scope.tabs_display_flag = false;
	};
}

function switchToList(_scope)
{
	return function(place_id){

		_scope.table_display_flag = false;
		_scope.tabs_display_flag = true;

		var arr = $("#tbody_results").children("tr");
		for(var i = 0; i < arr.length; i++)
		{
			$(arr[i]).css("background-color", "white");			
		}

		$("#" + place_id).css("background-color", "rgb(245, 219, 152)");
	};	
}

function searchController()
{
	return function($scope, $http)
	{
		$scope.table_display_flag = true;
		$scope.favorite_display_flag = true;
		$scope.tabs_display_flag = true;

		$scope.google_review_flag = false;
		$scope.yelp_review_flag = true;

		$scope.formData = {};
		$scope.directionData = {};

		//initialize the default value of compenents
		$scope.reviewsSource = "Google Reviews";
		$scope.directionData.travel_mode = "Driving";
		$scope.orderMethod = "1";

		$scope.progess_bar = false;

		$scope.search = search($scope, $http);

		$scope.searchDetails = function(place_id, geometry, item){
			$scope.table_display_flag = true;
			$scope.tabs_display_flag = false;
			$scope.favorite_display_flag = true;

			//clear yelp reviews. Re-retreive yelp reviews.
			$("#is_yelp_flag").val(0);

			getDetails($scope, place_id, geometry, item);
			
			// //initialize values of some coponents
			// $scope.directionData.travel_mode = "Driving";
		};

		$scope.getDirection = getDirection($scope);

		$scope.addFavorite = addFavorite($scope);

		$scope.switchToFavorPage = switchToFavorPage($scope);

		$scope.switchToResultsPage = switchToResultsPage($scope);

		$scope.switchReviews = switchReviews($scope, $http);

		$scope.switchOrder = switchOrder($scope);

		$scope.nextPage = nextPage($scope, $http);

		$scope.previousPage = previousPage($scope);

		$scope.twitter = twitter($scope);

		$scope.switchToDetailPage = switchToDetailPage($scope);

		$scope.switchToList = switchToList($scope);

		$scope.switchPanorama = switchPanorama($scope);

		$scope.click_profile_photo = click_profile_photo();

		$scope.clear = clear($scope);
	};
}

function initializeAngular()
{
	var searchApp = angular.module('searchApp', ['ngAnimate']);

	searchApp.controller("searchController", searchController());
}

/*the function is executed after the page is completely loaded*/
function ready()
{
	//get the current geolocation
	queryLocation("http://ip-api.com/json");
	
	//initialize the components
	rd_here = document.getElementById("here");
	rd_location = document.getElementById("location");
	bt_search = document.getElementById("bt_search"); 

	rd_here.addEventListener('click', rd_changed);
	rd_location.addEventListener('click', rd_changed);



	document.getElementById("input_location").disabled = true;
	document.getElementById("bt_search").disabled = true;

	// $('#keyword').change(input_valid("invalid_keyword"));
	$('#keyword').on('input', input_valid("invalid_keyword"));
	$('#input_location').change(input_valid("invalid_location"));

	var direction_autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('input_from')),
            {types: ['geocode']});

	direction_autocomplete.addListener('place_changed', function(){});

	var location_autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('input_location')),
            {types: ['geocode']});

	location_autocomplete.addListener('place_changed', function(){

	});	


	// document.getElementById("bt_search").disabled = false;
}

window.onload = ready;

initializeAngular();