
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
            //should clear search-city  and re-display city list 
            //not this now! window.location.href = "index.html";
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
                "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
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
            "https://api.openweathermap.org/data/2.5/uvi?appid=" +
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

        // array of forecast data (objects) for the next five days
        var fiveDayForecast = [];

        // set up the AJAX query URL

        console.log("Geting forecast for city ID: " + cityID);
        //console.log(moment().format("l"));

        var queryURL =
            "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID +
            "&units=imperial&appid=" +
            APIKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);

             for (let i = 0; i < response.cnt; i++) {
                 var js_d = new Date(Number(response.list[i].dt) * 1000);
                 console.log(js_d.toLocaleString(),
                     response.list[i].main.temp,
                     response.list[i].main.humidity,
                     response.list[i].main.temp_min,
                     response.list[i].main.temp_max);
             }

            // Start searching forecast data with current date so that when forecast date changes
            // we know we have moved into forecast data for the next day.
            var searchDate = moment().format("l");

            //var forecastDateTime = "";
            //var compareDate = "";
            //var saveForecastDate = "";
            //var pos_comma = 0;
            //var searchTime = "";
            var searchForTime = false;
            var idx = 0;

            do  {
                var js_d = new Date(Number(response.list[idx].dt) * 1000);
                var forecastDateTime = js_d.toLocaleString();
                var pos_comma = forecastDateTime.indexOf(",");
                var compareDate = forecastDateTime.slice(0, pos_comma);
                //console.log("compare date: ", compareDate, " search date: ", searchDate);
                if (compareDate !== searchDate) {
                    var saveForecastDate = compareDate;
                    searchDate = compareDate;
                    searchForTime = true;
                } else {
                    if (searchForTime) {
                        var searchTime = forecastDateTime.slice(11);
                        if (searchTime === "2:00:00 PM") {
                            var newForecast = new Forecast(
                                saveForecastDate,
                                response.list[idx].weather[0].icon,
                                response.list[idx].main.temp,
                                response.list[idx].main.humidity
                            );
                            fiveDayForecast.push(newForecast); 
                        }
                    }
                }
                idx++
            } while (idx < response.cnt);

            // need to save last entry in response array as the fifth entry in 5-day forecast
            // if inquiring before 2 pm.
            if (fiveDayForecast.length < 5) {
                var newForecast = new Forecast(
                    compareDate,
                    response.list[39].weather[0].icon,
                    response.list[39].main.temp,
                    response.list[39].main.humidity
                );
                fiveDayForecast.push(newForecast); 
            }

            console.log(fiveDayForecast);
        
            var forecastRow = $("<div>").addClass("row h4");
            forecastRow.text("5-Day Forecast:");

            $currentWeather.append(forecastRow);

            // DAY 1

            var forecastDay1 = $("<div>").addClass("forecast-box");

            //createForecastDay(forecastDay1, 7, response);  15, 23, 31, 39

            createForecastDay(forecastDay1, fiveDayForecast[0]);

            // DAY-2

            var forecastDay2 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay2, fiveDayForecast[1]);

            // DAY-3

            var forecastDay3 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay3, fiveDayForecast[2]);

            // DAY-4

            var forecastDay4 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay4, fiveDayForecast[3]);

            // DAY-5

            var forecastDay5 = $("<div>").addClass("forecast-box");

            createForecastDay(forecastDay5, fiveDayForecast[4]);

            $currentWeather.append(forecastDay1, forecastDay2, forecastDay3, forecastDay4, forecastDay5);

        });
    }


    // Constructor for 5-day forecast objects
    function Forecast(fcDate, fcIcon, fcTemp, fcHumidity) {
        this.forecastDate     = fcDate;
        this.forecastIcon     = fcIcon;
        this.forecastTemp     = fcTemp;
        this.forecastHumidity = fcHumidity;
    }


    function createForecastDay(forecastDay, forecast) {

        var forecastDate = $("<p>");

        forecastDate.text(forecast.forecastDate);
        forecastDay.append(forecastDate);

        var forecastIcon = $("<img>");
        forecastIcon.attr(
            "src",
            "https://openweathermap.org/img/w/" + forecast.forecastIcon + ".png"
        );
        forecastDay.append(forecastIcon);

        var forecastTemp = $("<p>");
        forecastTemp.text("Temp: " + forecast.forecastTemp + " \u00B0F");
        forecastDay.append(forecastTemp);

        var forecastHumidity = $("<p>");
        forecastHumidity.text("Humidity: " + forecast.forecastHumidity + "%");
        forecastDay.append(forecastHumidity);
    }

    // var js_date = new Date(Number(resp.list[idx].dt) * 1000);
    // //console.log(d.toLocaleDateString());
    // forecastDate.text(js_date.toLocaleDateString());
    // forecastDay.append(forecastDate);

    // var forecastIcon = $("<img>");
    // forecastIcon.attr(
    //     "src",
    //     "https://openweathermap.org/img/w/" + resp.list[idx].weather[0].icon + ".png"
    // );
    // forecastDay.append(forecastIcon);

    // var forecastTemp = $("<p>");
    // forecastTemp.text("Temp: " + resp.list[idx].main.temp + " \u00B0F");
    // forecastDay.append(forecastTemp);

    // var forecastHumidity = $("<p>");
    // forecastHumidity.text("Humidity: " + resp.list[idx].main.humidity + "%");
    // forecastDay.append(forecastHumidity);
 
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