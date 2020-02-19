
$(document).ready(function () {

    // Global variables
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");
    var $cityHistory = $("#city-history");

    // This is my API key.
    var APIKey = "7514abfe02ab6db7877685958ec119d7";

    // get Weather Cities history data from local storage

    var data = localStorage.getItem("WeatherCities");

    if (!data) {
        // create new 'empty' Work Day Schedule array
        var weather_cities = [];
        //var weather_cities = ["Phoenix", "Los Angeles", "Seattle"];
    } else {
        var weather_cities = JSON.parse(data);
    }

    // add each city in weather_cities array to history list group
    weather_cities.forEach(loadCity);


    // set Event to save text when corresponding save button is clicked
    $("#city-history").click(selectCity);


    // save button calls
    $("#searchBtn").on("click", function (event) {
        event.preventDefault();
        // validate search params
        if ($("#search-city").val() === "") {
            $(".invalid-feedback").removeClass("d-none");
            $(".invalid-feedback").addClass("d-block");
            event.stopPropagation();
        } else {
            var searchCity = $("#search-city")
                .val()
                .trim();
            //console.log("city: ", searchCity);
            getCurrentWeather(searchCity);
            saveSearchCity(searchCity);
        }

    });

    //-----------------------------------------------------------------------------------------
    //  function to save the current search city in the history array, if it doesn't already
    //   exist, and to save the updated history in local storage. 
    //-----------------------------------------------------------------------------------------

    function saveSearchCity(srchCity) {

        // search weather_cities array for the current search city
        // if not found then add it to the array
        // save weather_cities array in local storage

        var add_city_to_history = true;
        for (let i = 0; i < weather_cities.length; i++) {
            if (srchCity === weather_cities[i]) {
                add_city_to_history = false;
            }
        }

        if (add_city_to_history) {
            console.log("adding search city " + srchCity + " to history");
            weather_cities.push(srchCity);
            // Save updated work_day_schedule array in local storage
            localStorage.setItem("WeatherCities", JSON.stringify(weather_cities));
        }
    }

    //-----------------------------------------------------------------------------------------
    //  function to create a group list of city names from previous search history 
    //-----------------------------------------------------------------------------------------

    function loadCity(cityName) {

        var newListItem = $("<button>").addClass("list-group-item list-group-item-action");
        newListItem.attr("type", "button");
        //newListItem.attr("id", "city-list");
        newListItem.text(cityName);

        // Append the city from history list to page (Container element)
        $cityHistory.append(newListItem);
    }


    //-----------------------------------------------------------------------------------------
    //  function to select city from history list when its list entry is clicked
    //-----------------------------------------------------------------------------------------

    function selectCity(e) {
        event.preventDefault();

        //console.log($(this).siblings(".textarea").val());
        //console.log($(this).attr("data-index"));
        console.log($(this).text());

        // capture index (typeof 'string') into work-day-schedule array 
        //var idx = $(this).attr("index");
        //console.log(typeof idx);

        // save updated text in work_day_schedule array
        //work_day_schedule[parseInt(idx)] = $(this).siblings(".textarea").val();

        // Save updated work_day_schedule array in local storage
        //localStorage.setItem("WorkDaySchedule", JSON.stringify(work_day_schedule));

    }




    function getCurrentWeather(city) {

        // clear current weather area before displaying any new data
        $currentWeather.empty();

        // set up the AJAX query URL

        console.log("Search for city: ", city);
        //console.log(moment().format("l"));
        //return;

        var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            city +
            "&units=imperial&appid="
            + APIKey;

        // AJAX call

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            //return;

            var latitude = response.coord.lat;
            var longitude = response.coord.lon;
            var cityID = response.id;

            var cityRow = $("<div>").addClass("row");

            var colCityDate = response.name + ' (' + moment().format("l") + ')';

            var colCity = $("<div>").addClass("col-4 citydate");
            colCity.text(colCityDate);

            var colIcon = $("<img>").addClass("col-1");
            colIcon.attr(
                "src",
                "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
            );

            cityRow.append(colCity, colIcon);

            $currentWeather.append(cityRow);

            var tempRow = $("<div>").addClass("row");
            tempRow.text("Temperature: " + response.main.temp + " \u00B0F");
            $currentWeather.append(tempRow);

            var humidityRow = $("<div>").addClass("row");
            humidityRow.text("Humidity: " + response.main.humidity + "%");
            $currentWeather.append(humidityRow);

            var windSpeedRow = $("<div>").addClass("row");
            windSpeedRow.text("Wind Speed: " + response.wind.speed + "MPH");
            $currentWeather.append(windSpeedRow);

            getUVIndex(cityID, latitude, longitude);

        });
    }


    //-------------------------------------------------------------------------------------
    // function to get the UV Index for the city in question using latitude and longitude
    // returned in response to request for current weather above (getCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getUVIndex(cityId, lat, lon) {

        // set up the AJAX query URL

        console.log("Get UV Index for lat (" + lat + ") and lon (" + lon + ")");
        //return;

        var queryURL =
            "http://api.openweathermap.org/data/2.5/uvi?appid=" +
            APIKey
            +
            "&units=imperial&lat=" + lat + "&lon=" + lon;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            //var now = moment().format("MMMM Do, YYYY");
            console.log(response.value);

            var uvIndexRow = $("<div>").addClass("row");
            var uvIndexSpan = $("<span>").attr("id", "uv-intensity");

            var uvIndexNum = Number(response.value);
            console.log("UV Index number: ", uvIndexNum);

            // add class to UV Index to indicate whether value is low, medium, high or severe
            if (uvIndexNum < 3) {
                uvIndexSpan.addClass("favorable");
                console.log("favorable");
            }
            else if (uvIndexNum < 6) {
                uvIndexSpan.addClass("moderate");
                console.log("moderate");
            }
            else if (uvIndexNum < 8) {
                uvIndexSpan.addClass("high");
                console.log("high");
            }
            else {
                uvIndexSpan.addClass("severe");
                console.log("severe");
            }

            uvIndexSpan.text(" " + response.value);
            // uvIndexRow.text("UV Index: " + " <span>" + " " + response.value +"</span>");
            uvIndexRow.text("UV Index: ");
            uvIndexRow.append(uvIndexSpan);


            $currentWeather.append(uvIndexRow);

            getForecast(cityId);

        });
    }


    //-------------------------------------------------------------------------------------
    // function to get the 5-day forecast for the city in question using the city ID 
    // returned in response to request for current weather above (getCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getForecast(cityID) {

        // set up the AJAX query URL

        console.log("Geting forecast for city ID: " + cityID);
        //console.log(moment().format("l"));
        //return;

        var queryURL =
            "http://api.openweathermap.org/data/2.5/forecast?id=" + cityID +
            "&units=imperial&appid=" +
            APIKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);

            var forecastRow = $("<div>").addClass("row h4");
            forecastRow.text("5-Day Forecast:");

            //   var forecastRowTitle = $("<p>").addClass("h4");
            //   forecastRowTitle.text("5-Day Forecast:")
            //   forecastRow.append(forecastRowTitle);

            $currentWeather.append(forecastRow);

            //------------------------------------
            // loop will start here
            //------------------------------------

            // DAY 1

            var forecastDay1 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay1, 7, response);

            // DAY-2

            var forecastDay2 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay2, 15, response);

            // DAY-3

            var forecastDay3 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay3, 23, response);

            // DAY-4

            var forecastDay4 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay4, 31, response);

            // DAY-5

            var forecastDay5 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay5, 39, response);


            // for (let i = 0; i < 40; i++) {
            //     //for (let i = 7; i < 40; i = i + 8) {
            //     var d = new Date(Number(response.list[i].dt) * 1000);
            //     console.log(d.toLocaleString(), response.list[i].main.temp, response.list[i].main.humidity,
            //         response.list[i].main.temp_min, response.list[i].main.temp_max);
            // }

            $currentWeather.append(forecastDay1, forecastDay2, forecastDay3, forecastDay4, forecastDay5);

        });

    }

    function createForecastDay(forecastDay, idx, resp) {

        var forecastDate = $("<p>");

        var js_date = new Date(Number(resp.list[idx].dt) * 1000);
        //console.log(d.toLocaleDateString());
        forecastDate.text(js_date.toLocaleDateString());
        forecastDay.append(forecastDate);

        var forecastIcon = $("<img>");
        forecastIcon.attr(
            "src",
            "http://openweathermap.org/img/w/" + resp.list[idx].weather[0].icon + ".png"
        );
        forecastDay.append(forecastIcon);

        var forecastTemp = $("<p>");
        forecastTemp.text("Temp: " + resp.list[idx].main.temp + " \u00B0F");
        forecastDay.append(forecastTemp);

        var forecastHumidity = $("<p>");
        forecastHumidity.text("Humidity: " + resp.list[idx].main.humidity + "%");
        forecastDay.append(forecastHumidity);
    }


 
});


    //var d = new Date();
    //console.log(typeof d);
    //var n = d.toLocaleDateString();
    //console.log(d.toLocaleDateString());

    // will be for clear button
    //$("#clear-link").on("click", function(event) {
    //    event.preventDefault();
    //    $("#result-card").empty();
    //});

    //<div class="list-group" id="city-history">
    //<button type="button" class="list-group-item list-group-item-action">Phoenix</button>
    //const date = new Date(1582059600000).toDateString();
    //console.log(date);

            //   Forecast: 
        //var queryURL = 
        // "http://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" +
        // + APIKey;

        //   Icon: "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png"