
$(document).ready(function () {

    // Global variables
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");
    var $searchCity = $("#search-city");
    var $cityHistory = $("#city-history");


    // testing - delete Weather Cities history data from local storage
    //localStorage.removeItem("WeatherCities");

    var data = localStorage.getItem("WeatherCities");

    if (!data) {
        // create new 'empty' Weather Cities array
        var weather_cities = [];
    } else {
        var weather_cities = JSON.parse(data);
    }

    // add each city in weather_cities array to history list group
    weather_cities.forEach(loadCity);

    // use last city in weather_cities array to display weather on initial load 
    if (weather_cities.length > 0) {
        var lastCity = weather_cities[weather_cities.length - 1];
        var lastCityId = lastCity.id;
        var lastCityName = lastCity.name;
        //console.log(saveCityId, saveCityName);
        getCurrentWeather(lastCityName, lastCityId);
    }


    // set Event to select specific city when that city, in the history list, is clicked
    $(".list-group-item").click(selectCity);

    // set Event for click of search button
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
                // remove (clear out) the Weather Cities array from local storage
                localStorage.removeItem("WeatherCities");
                // reload the main page
                window.location.href = "index.html";
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
        // ---------------------------------------------------------------
        // Search weather_cities array for the current search city name.
        // If not found then add it to the array and save weather_cities
        // array in local storage.
        //---------------------------------------------------------------
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
            // set Event to select specific city when that city, in the history list, is clicked
            $(".list-group-item").click(selectCity);
        }
    }

    //--------------------------------------------------------------------
    // Constructor function for City objects in Weather Cities array
    //--------------------------------------------------------------------

    function City(cityName, cityID) {
        this.name = cityName;
        this.id = cityID;
    }

    //-----------------------------------------------------------------------------------------
    //  function to create a group list of city names from previous search history 
    //-----------------------------------------------------------------------------------------

    function loadCity(cityObj) {

        console.log(cityObj);
        var newListItem = $("<button>").addClass("list-group-item list-group-item-action");
        newListItem.attr("type", "button");
        newListItem.attr("data-cityId", cityObj.id);
        newListItem.text(cityObj.name);

        // Append the city from history list to page (Container element)
        $cityHistory.append(newListItem);
    }


    //-----------------------------------------------------------------------------------------
    //  function to select city from history list when its list entry is clicked
    //-----------------------------------------------------------------------------------------

    function selectCity(e) {
        event.preventDefault();

        // get weather for city corresponding to history entry that was clicked 
        var saveCityId = $(this).attr("data-cityId");
        var saveCityName = $(this).text();
        console.log(saveCityId, saveCityName);

        getCurrentWeather(saveCityName, saveCityId);
    }


    //-------------------------------------------------------------------------------------
    // Function to get the current weather conditions either by city name or city ID if 
    // selected from city history list.
    //-------------------------------------------------------------------------------------

    function getCurrentWeather(cityName, cityId) {

        // clear current weather area before displaying any new data
        $currentWeather.empty();

        // set up the AJAX query URL using city ID (if one) or city name

        if (cityId === null) {
            console.log("Search for city: ", cityName);
            var queryURL = "/api/weather/name/" + cityName;
        }
        else {
            console.log("Search for city ID: ", cityId);
            var queryURL = "/api/weather/id/" + cityId;
        }

        // AJAX call

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);

            // clear out the search city buffer
            $searchCity.val('');

            if (response.cod === 200) {
                displayCurrentWeather(response, cityName)
            } else {
                // Display exception message when city name searched for is not found (404)
                var cityNotFoundRow = $("<div>").addClass("row h4");
                cityNotFoundRow.text('City name "' + cityName + '" not found, please re-enter');
                $currentWeather.append(cityNotFoundRow);
            }
        
        })
            .catch(function (err) {
                console.log("AJAX error: ", err);
        });
    }


    //-------------------------------------------------------------------------------------
    // Display current weather data for valid city name or ID. 
    //-------------------------------------------------------------------------------------

    function displayCurrentWeather(response, cityName) {

        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var cityID = response.id;
        // replace cityName with name returned in response,
        // this should help to maintain consistency regarding format of saved city names 
        cityName = response.name;

        //----------------------------------------------------------------------------------------------------
        // Using GMT offset of browser locale and GMT offset of city whose weather will be displayed
        //   to calculate the current local date-time of target city:
        // 1. utilize API timezone offset from GMT in seconds to calculate GMT offset in hours for target city
        // 2. get GMT offset (in minutes) for browsing locale, convert to hours
        // 3. capture current browser locale date-time from moment.js
        // 4. calculate the total time difference in hours between browser locale and target city:
        //    difference will be positive if target city is east of browser locale; negative if west
        // 6. use moment 'add' method to convert browser locale date-time to target city's local date-time
        //----------------------------------------------------------------------------------------------------

        // utilize API timezone offset (in seconds) from GMT to calculate GMT offset in hours for target city
        let tzOffsetHrs = response.timezone / 3600;
        if (tzOffsetHrs < 0) {
            var gmtInd = "GMT" + tzOffsetHrs;
        } else if (tzOffsetHrs > 0) {
            var gmtInd = "GMT+" + tzOffsetHrs;
        } else {
            var gmtInd = "GMT";
        }
        console.log("timezone offset (secs): ", response.timezone, " (hours): ", gmtInd);

        // get GMT offset (in minutes) for browsing locale, convert to hours
        var localeDate = new Date();
        var localeOffsetMinutes = localeDate.getTimezoneOffset();
        // offset in minutes is what needs to be added/subtracted to the browser locale time to get to GMT -
        // we want the opposite (and in hours): the hours to be added/subtracted to GMT to get browser locale time.
        var localeOffsetHrs = localeOffsetMinutes / 60 * - 1; 

        var totalTimeDiffHrs = tzOffsetHrs - localeOffsetHrs;
        console.log("local offset (hrs): ", localeOffsetHrs, " total offset (hrs): ", totalTimeDiffHrs);

        // capture current browser locale date-time from moment.js
        var momentLocalDateTime = moment();

        // add total time difference to browser local time to get target city local time 
        momentLocalDateTime.add(totalTimeDiffHrs, 'hours');

        console.log("target city local time: ", momentLocalDateTime.format());

        //-------------------------------------------------------------------------------------------
        // build city row using city name, current date and current weather icon from ajax response
        //-------------------------------------------------------------------------------------------

        var cityRow = $("<div>").addClass("row");
        //console.log(response.sys.country);
        if (response.sys.country === 'US') {
            var colCityDate = response.name + ' (' + momentLocalDateTime.format("ddd") + ', ' + momentLocalDateTime.format("l") +  ')';
        } else {
            var colCityDate = response.name + ', ' + response.sys.country + ' (' + momentLocalDateTime.format("ddd") + ', ' + momentLocalDateTime.format("l") + ')';
        }

        var colCity = $("<div>").addClass("col-6 citydate");
        colCity.text(colCityDate);

        var colIcon = $("<img>").addClass("col-1");
        colIcon.attr(
            "src",
            "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
        );
        cityRow.append(colCity, colIcon);

        // cityRow.append(colCity);

        $currentWeather.append(cityRow);

        //----------------------------------------------------
        // "Current Conditions" heading 
        //----------------------------------------------------
        var currentConditionRow = $("<div>").addClass("row");

        var currCondHeadingLit = $("<div>").addClass("col-6 h5");
        currCondHeadingLit.text("Conditions as of " + momentLocalDateTime.format("h:mm a") + ' (' + gmtInd + '):');
        //currCondHeadingLit.text("Conditions as of " + moment().format("HH:mm") + ' ' + gmtInd + ':');

        var colDescription = $("<p>").addClass("col-4");
        var weatherDesc = response.weather[0].description;
        var weatherDescription = weatherDesc[0].toUpperCase() + weatherDesc.substr(1);
        colDescription.text(weatherDescription);
        //colDescription.text(response.weather[0].main + ': ' + response.weather[0].description);
        
        //currentConditionRow.append(currCondHeadingLit, colIcon, colDescription);
        currentConditionRow.append(currCondHeadingLit, colDescription);
        //currentConditionRow.append(currCondHeadingLit);

        $currentWeather.append(currentConditionRow);


        //----------------------------------------------------------------------------
        // build temperature row using current temperature from ajax response
        //----------------------------------------------------------------------------
        var tempRow = $("<div>").addClass("row");

        var colTempLit = $("<div>").addClass("col-2");
        colTempLit.text("Temperature:");
        var colTempVal = $("<div>").addClass("col-2");
        colTempVal.text(response.main.temp.toFixed(0) + " \u00B0F");
        tempRow.append(colTempLit, colTempVal);

        $currentWeather.append(tempRow);

        //----------------------------------------------------------------------------
        // build humidity row using current humidity value from ajax response
        //----------------------------------------------------------------------------
        var humidityRow = $("<div>").addClass("row");

        var colHumLit = $("<div>").addClass("col-2");
        colHumLit.text("Humidity:");
        var colHumVal = $("<div>").addClass("col-2");
        colHumVal.text(response.main.humidity + " %");
        humidityRow.append(colHumLit, colHumVal);

        $currentWeather.append(humidityRow);

        //----------------------------------------------------------------------------
        // build wind speed row using current wind speed value from ajax response
        //----------------------------------------------------------------------------
        var windSpeedRow = $("<div>").addClass("row");

        var colWindLit = $("<div>").addClass("col-2");
        colWindLit.text("Wind Speed:");
        var colWindVal = $("<div>").addClass("col-2");
        colWindVal.text(response.wind.speed.toFixed(0) + " mph");
        windSpeedRow.append(colWindLit, colWindVal);

        $currentWeather.append(windSpeedRow);

        //-----------------------------------------------------------------------------------
        // need to use longitude & latitude (from ajax response above) to get UV Index value
        //-----------------------------------------------------------------------------------
        getUVIndex(cityID, latitude, longitude, momentLocalDateTime);

        //-----------------------------------------------------------------------------------
        // city name and cityID from response in city history array (of objects)
        //-----------------------------------------------------------------------------------
        saveSearchCity(cityName, cityID);

    }


    //-------------------------------------------------------------------------------------
    // function to get the UV Index for the city in question using latitude and longitude
    // returned in response to request for current weather above (displayCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getUVIndex(cityId, lat, lon, momentLocalDateTime) {

        // set up the AJAX query URL

        console.log("Get UV Index for lat (" + lat + ") and lon (" + lon + ")");
        //return;

        var queryURL = "/api/weather/coord/" + lat + "/" + lon;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //console.log(response);
            //var now = moment().format("MMMM Do, YYYY");

            // need UV Index as number for strength comparisons below
            var uvIndexNum = Number(response.value);
            console.log("UV Index number: ", uvIndexNum);

            var uvIndexRow = $("<div>").addClass("row");

            var uvIndexSpan = $("<span>").attr("id", "uv-intensity");
            //uvIndexSpan.text(response.value);

            uvIndexSpan.text(uvIndexNum.toFixed(1));

            // add class to UV Index to indicate whether value is low, medium, high or severe
            if (uvIndexNum < 3) {
                uvIndexSpan.addClass("favorable");
                //console.log("favorable");
            }
            else if (uvIndexNum < 6) {
                uvIndexSpan.addClass("moderate");
                //console.log("moderate");
            }
            else if (uvIndexNum < 8) {
                uvIndexSpan.addClass("high");
                //console.log("high");
            }
            else {
                uvIndexSpan.addClass("severe");
                //console.log("severe");
            }

            var colUvIndexLit = $("<div>").addClass("col-2");
            colUvIndexLit.text("UV Index:");

            var colUvIndexVal = $("<div>").addClass("col-1");
            colUvIndexVal.append(uvIndexSpan);

            uvIndexRow.append(colUvIndexLit, colUvIndexVal);

            $currentWeather.append(uvIndexRow);

            getForecast(cityId, momentLocalDateTime);

        });
    }


    //-------------------------------------------------------------------------------------
    // function to get the 5-day forecast for the city in question using the city ID 
    // returned in response to request for current weather above (getCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getForecast(cityID, momentLocalDateTime) {

        // array of forecast data (objects) for the next five days
        var fiveDayForecast = [];

        // set up the AJAX query URL

        console.log("Getting forecast for city ID: " + cityID);
        //console.log(moment().format("l"));

        var queryURL = "/api/weather/forecast/id/" + cityID;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            //console.log(response);

            //  for (let i = 0; i < response.cnt; i++) {
            //      let js_d = new Date(Number(response.list[i].dt) * 1000);
            //      console.log(js_d.toLocaleString(),
            //          response.list[i].main.temp,
            //          response.list[i].main.humidity,
            //          response.list[i].main.temp_min,
            //          response.list[i].main.temp_max);
            //  }

            //-------------------------------------------------------------------------------------------
            // Start searching forecast data with current date so that when forecast date changes
            // we know we have moved into forecast data for the next day.
            //-------------------------------------------------------------------------------------------
            // However, if we are inquiring about a city on the other side of the world from Phoenix,
            // the local time there may already be the next day.  So, cannot use the target city's local
            // date - always use the browser's local date as the starting search date.
            //var searchDate = momentLocalDateTime.format("l");
            //-------------------------------------------------------------------------------------------
            var searchDate = moment().format("l");
            console.log(searchDate);

            var forecastDateTime = "";
            var saveForecastDate = "";

            var compareDate  = "";
            var searchTime   = "";
            var forecastTime = "";

            var pos_comma   = 0;
            var pos_colon   = 0;

            var searchForTime = false;
            var idx = 0;

            // During summer use match time of 5 pm for Phoenix & Chandler. That is the hotest part of the day.
            if (response.city.name === "Chandler" || response.city.name === "Phoenix") {
                var matchTime = "5:00:00 PM";
            } else {
                var matchTime = "2:00:00 PM";
            }

            do {
                // convert forecast date-time into a js date and then to human readable format
                var js_d = new Date(Number(response.list[idx].dt) * 1000);
                forecastDateTime = js_d.toLocaleString();
                //console.log("forecast DateTime ", forecastDateTime);
                // isolate date portion (mm/dd/yyyy) from beginning of forecast 'date+time' string
                pos_comma   = forecastDateTime.indexOf(",");
                compareDate = forecastDateTime.slice(0, pos_comma);
                //console.log("compare date: ", compareDate, " search date: ", searchDate);
                if (compareDate !== searchDate) {
                    // The forecast data has changed to a new day, so replace the
                    // search date with the new forecast date and trigger search based on time
                    saveForecastDate = compareDate;
                    searchDate       = compareDate;
                    searchForTime    = true;
                } else {
                    if (searchForTime) {
                        // isolate the time portion from end of forecast 'date+time' string
                        searchTime = forecastDateTime.slice(pos_comma + 2);
                        if (searchTime === matchTime) {
                            //console.log("Type of 'js_d':", typeof js_d);
                            // isolate the hour digits from the forecast time
                            pos_colon = searchTime.indexOf(":");
                            // concatenate the hour and am/pm indicator to create forecast time to be displayed
                            forecastTime = searchTime.substring(0, pos_colon) + searchTime.substr(-2).toLowerCase();
                            var newForecast = new Forecast(
                                saveForecastDate,
                                forecastTime,
                                response.list[idx].weather[0].icon,
                                response.list[idx].main.temp,
                                response.list[idx].main.humidity
                            );
                            fiveDayForecast.push(newForecast);
                            // found the time slot we want so stop searching for time match
                            searchForTime = false;
                        }
                    }
                }
                idx++
            } while (idx < response.cnt);

            //-----------------------------------------------------------------------------------
            // Need to save last entry in response array as the fifth entry in 5-day forecast
            // if inquiring before 2 pm.
            //-----------------------------------------------------------------------------------
            if (fiveDayForecast.length < 5) {
                searchTime = forecastDateTime.slice(pos_comma + 2);
                // isolate the hour digits from the forecast time
                pos_colon = searchTime.indexOf(":");
                // concatenate the hour and am/pm indicator to create forecast time to be displayed
                forecastTime = searchTime.substring(0, pos_colon) + searchTime.substr(-2).toLowerCase();
                var newForecast = new Forecast(
                    compareDate,
                    forecastTime,
                    response.list[39].weather[0].icon,
                    response.list[39].main.temp,
                    response.list[39].main.humidity
                );
                fiveDayForecast.push(newForecast);
            }

            console.log(fiveDayForecast);

            // add blank line before forecast area
            var forecastRow = $("<br>");

            $currentWeather.append(forecastRow);

            // create forecast block title 
            var forecastRow = $("<div>").addClass("row");

            var colForecastTitleLit = $("<div>").addClass("col-3 h5");
            colForecastTitleLit.text("5-Day Forecast:");

            forecastRow.append(colForecastTitleLit);

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

    //------------------------------------------------------
    // Constructor for 5-day forecast objects
    //------------------------------------------------------
    function Forecast(fcDate, fcTime, fcIcon, fcTemp, fcHumidity) {
        this.forecastDate = fcDate;
        this.forecastTime = fcTime;
        this.forecastIcon = fcIcon;
        this.forecastTemp = fcTemp;
        this.forecastHumidity = fcHumidity;
    }

    //------------------------------------------------------
    // Function to create a forecast Day box consisting of
    //  - date, icon and temperature and humidity values.
    //------------------------------------------------------
    function createForecastDay(forecastDay, forecast) {

        var forecastDateTime = $("<p>");

        // concatenate forecast date and time data
        forecastDateTime.text(forecast.forecastDate + " - " + forecast.forecastTime);
        forecastDay.append(forecastDateTime);

        var forecastIcon = $("<img>");
        forecastIcon.attr(
            "src",
            "https://openweathermap.org/img/w/" + forecast.forecastIcon + ".png"
        );
        forecastDay.append(forecastIcon);

        var forecastTemp = $("<p>");
        forecastTemp.text("Temp: " + forecast.forecastTemp.toFixed(0) + " \u00B0F");
        forecastDay.append(forecastTemp);

        var forecastHumidity = $("<p>");
        forecastHumidity.text("Humidity: " + forecast.forecastHumidity + " %");
        forecastDay.append(forecastHumidity);
    }

});

        // initialize vars that will be used to alter browser locale time to create local time for target city
        // var timeDiffMins = 0;
        // var timeDiffHrsInt = 0;

        // if (timeDiffHrs < 0) {
        //     // target city is west of browsing locale
        //     var timeDiffIsNegative = true;
        //     console.log("negative time diff");
        // } else {
        //     // target city is east of browsing locale
        //     var timeDiffIsNegative = false;
        // }

        // if (Number.isInteger(timeDiffHrs)) {
        //     // time difference is an integer - no partial hours
        //     console.log("integer time diff, local time: ", momentLocalDateTime.format());
        //     timeDiffHrsInt = timeDiffHrs;
        // } else {
        // // if time difference has a decimal portion (should always be 0.5?) then isolate integer piece
        // // (whole hours) by eliminating the 0.5 portion and use 30 minutes instead.
        //     console.log("decimal time diff, local time: ", momentLocalDateTime.format());
        //     if (timeDiffIsNegative) {
        //         timeDiffMins = -30;
        //         timeDiffHrsInt = timeDiffHrs + 0.5;
        //     } else {
        //         timeDiffMins = 30;
        //         timeDiffHrsInt = timeDiffHrs - 0.5;
        //     }
        // }

        // if time difference is zero then do not need to alter target city local time (same as browser locale)
        // if (timeDiffHrs != 0) {
        //     momentLocalDateTime.add(timeDiffHrsInt, 'hours');
        //     momentLocalDateTime.add(timeDiffMins, 'minutes');
        // }
