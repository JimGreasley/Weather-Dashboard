
$(document).ready(function () {

    // Global variables
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");
    var $searchCity = $("#search-city");
    var $cityHistory = $("#city-history");

    // This is my API key.
    var APIKey = "7514abfe02ab6db7877685958ec119d7";

    // get Weather Cities history data from local storage
    //localStorage.removeItem("WeatherCities");

    var data = localStorage.getItem("WeatherCities");

    if (!data) {
        // create new 'empty' Weather Cities array
        var weather_cities = [];
        //var weather_cities = ["Phoenix", "Los Angeles", "Seattle"];
    } else {
        var weather_cities = JSON.parse(data);
    }

    // add each city in weather_cities array to history list group
       weather_cities.forEach(loadCity);


    // set Event to select specific city when that city, in the history list, is clicked
    //$cityHistory.click(selectCity);
    $(".list-group-item").click(selectCity);

    // save button calls
    $("#searchBtn").on("click", function (event) {
        event.preventDefault();
        // validate search params
        if ($searchCity.val() === "") {
            $(".invalid-feedback").removeClass("d-none");
            $(".invalid-feedback").addClass("d-block");
            event.stopPropagation();
        } else {
            // should also convert it to lowercase and then capitalize the first character
            var searchCity = $searchCity
                .val()
                .trim();
            if (searchCity === "clear") {
                // clear out (empty) the Weather Cities array and save in local storage
                //var weather_cities = [];
                localStorage.removeItem("WeatherCities");
                //localStorage.setItem("WeatherCities", JSON.stringify(weather_cities));
            } else {
                //console.log("city: ", searchCity);
                getCurrentWeather(searchCity, null);
            }

        }

    });

    //-----------------------------------------------------------------------------------------
    //  function to save the current search city in the history array, if it doesn't already
    //   exist, and to save the updated history in local storage. 
    //-----------------------------------------------------------------------------------------

    function saveSearchCity(cityName, cityID) {

        // search weather_cities array for the current search city name
        // if not found then add it to the array
        // save weather_cities array in local storage
        console.log("Save Srch City");
        var cityIndex = -1;
        weather_cities.forEach(checkForCity);

        function checkForCity(cityEntry, index) {
            if (cityEntry.name === cityName) {
                // current city already exists in weather_cities array
                cityIndex = index;
            }
        }
        console.log("cityIndex: ", cityIndex);

        // City not already in weather_cities history array so add it 
        if (cityIndex === -1) {
            // create a new city object
            var newCity = new City(cityName, cityID);
            console.log("New city obj: ", newCity);
            // Add new city to weather cities array
            console.log("adding search city " + cityName + " to history");
            weather_cities.push(newCity);
            // Save updated weather_cities array in local storage
            localStorage.setItem("WeatherCities", JSON.stringify(weather_cities));
            // clear out city history and reload to include city just added
            $cityHistory.empty();
            // add each city in weather_cities array to history list group
            weather_cities.forEach(loadCity);

        }
    }

    // Constructor function for City objects in Weather Cities array

    function City(cityName, cityID) {
        this.name = cityName;
        this.id   = cityID;
}

    //-----------------------------------------------------------------------------------------
    //  function to create a group list of city names from previous search history 
    //-----------------------------------------------------------------------------------------

    function loadCity(cityObj) {

        console.log(cityObj);
        var newListItem = $("<button>").addClass("list-group-item list-group-item-action");
        newListItem.attr("type", "button");
        newListItem.attr("data-cityId", cityObj.id);
        //newListItem.attr("id", "city-list");
        newListItem.text(cityObj.name);

        // Append the city from history list to page (Container element)
        $cityHistory.append(newListItem);
    }


    //-----------------------------------------------------------------------------------------
    //  function to select city from history list when its list entry is clicked
    //-----------------------------------------------------------------------------------------

    function selectCity(e) {
        event.preventDefault();

        // capture index (typeof 'string') into work-day-schedule array 
        var saveCityId  = $(this).attr("data-cityId");
        var saveCityName = $(this).text();
        console.log(saveCityId, saveCityName);

        getCurrentWeather(saveCityName, saveCityId);

    }




    function getCurrentWeather(cityName, cityId) {

        // clear current weather area before displaying any new data
        $currentWeather.empty();

        // set up the AJAX query URL

        if (cityId === null) {
            console.log("Search for city: ", cityName);
            var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            cityName +
            "&units=imperial&appid="
            + APIKey;
        } 
        else {
            console.log("Search for city ID: ", cityId);
            var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?id=" +
            cityId +
            "&units=imperial&appid="
            + APIKey;
        }

        // AJAX call

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            
            // clear out the search city buffer
            // $searchCity.val() = " ";

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

            // expand this to save city name and cityID in array of objects
            saveSearchCity(cityName, cityID);

        })
        .catch(function(err){
            console.log("AJAX error: ", err);
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
            //console.log(response);

            //  for (let i = 0; i < response.cnt; i++) {
            //      var js_d = new Date(Number(response.list[i].dt) * 1000);
            //      console.log(js_d.toLocaleString(),
            //          response.list[i].main.temp,
            //          response.list[i].main.humidity,
            //          response.list[i].main.temp_min,
            //          response.list[i].main.temp_max);
            //  }

            // Start searching forecast data with current date so that when forecast date changes
            // we know we have moved into forecast data for the next day.
            var searchDate = moment().format("l");
            console.log(searchDate);

            //var forecastDateTime = "";
            //var compareDate = "";
            //var saveForecastDate = "";
            //var pos_comma = 0;
            //var searchTime = "";
            var searchForTime = false;
            var idx = 0;

            do  {
                // convert forecast date-time into a js date and then to human readable format
                var js_d = new Date(Number(response.list[idx].dt) * 1000);
                var forecastDateTime = js_d.toLocaleString();
                //console.log("forecast DateTime ", forecastDateTime);
                // isolate date portion (mm/dd/yyyy) from begining of date string
                var pos_comma = forecastDateTime.indexOf(",");
                var compareDate = forecastDateTime.slice(0, pos_comma);
                //console.log("compare date: ", compareDate, " search date: ", searchDate);
                if (compareDate !== searchDate) {
                    // the forecast data has changed to a new day, so replace the
                    // search date with the new forecast date and trigger search based on time
                    var saveForecastDate = compareDate;
                    searchDate = compareDate;
                    searchForTime = true;
                } else {
                    if (searchForTime) {
                        // isolate the time portion of the
                        var searchTime = forecastDateTime.slice(pos_comma + 2);
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