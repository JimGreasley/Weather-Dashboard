
$(document).ready(function () {

    // Global variables
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");
    var $searchCity = $("#search-city");
    var $cityHistory = $("#city-history");

    //-------------------------------------------------------------
    // get array of Weather Cities history data from local storage
    //-------------------------------------------------------------

    var data = localStorage.getItem("WeatherCities");

    if (!data) {
        // create new 'empty' Weather Cities array
        var weather_cities = [];
    } else {
        var weather_cities = JSON.parse(data);
    }

    //-------------------------------------------------------
    // get City Id of last City displayed from local storage
    //-------------------------------------------------------

    var data = localStorage.getItem("WeatherCityIdLast");

    if (!data) {
        // create new last weather city ID - initialize to zero
        var lastWeatherCityId = 0;
    } else {
        var lastWeatherCityId = JSON.parse(data);
    }
    console.log("Last weather city ID: ", lastWeatherCityId);


    // add each city in weather_cities array to history list group
    weather_cities.forEach(loadCity);

    if (lastWeatherCityId > 0) {
        getCurrentWeather(null, lastWeatherCityId);
    } else 
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
                localStorage.removeItem("WeatherCityIdLast");
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

        // save cityID of weather city just displayed
        localStorage.setItem("WeatherCityIdLast", JSON.stringify(cityID));

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
                displayCurrentWeather(response)
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
    // Convert wind direction in degrees to cardinal value. 
    //-------------------------------------------------------------------------------------

    function getWindCardinalDirection (windDegrees) {

        if ( (windDegrees >= 349 & windDegrees <= 360) | (windDegrees >= 0 & windDegrees <= 11) ) {
            return "N"
        } else
        if (windDegrees >= 12 & windDegrees <= 33) {
            return "NNE"
        } else
        if (windDegrees >= 34 & windDegrees <= 56) {
            return "NE"
        } else
        if (windDegrees >= 57 & windDegrees <= 78) {
            return "ENE"
        } else
        if (windDegrees >= 79 & windDegrees <= 101) {
            return "E"
        } else
        if (windDegrees >= 102 & windDegrees <= 123) {
            return "ESE"
        } else
        if (windDegrees >= 124 & windDegrees <= 146) {
            return "SE"
        } else
        if (windDegrees >= 147 & windDegrees <= 168) {
            return "SSE"
        } else
        if (windDegrees >= 169 & windDegrees <= 191) {
            return "S"
        } else
        if (windDegrees >= 192 & windDegrees <= 213) {
            return "SSW"
        } else
        if (windDegrees >= 214 & windDegrees <= 236) {
            return "SW"
        } else
        if (windDegrees >= 237 & windDegrees <= 258) {
            return "WSW"
        } else
        if (windDegrees >= 259 & windDegrees <= 281) {
            return "W"
        } else
        if (windDegrees >= 282 & windDegrees <= 303) {
            return "WNW"
        } else
        if (windDegrees >= 304 & windDegrees <= 326) {
            return "NW"
        } else
        if (windDegrees >= 327 & windDegrees <= 348) {
            return "NNW"
        } else {
            return "???"
        };
    }


    //-------------------------------------------------------------------------------------
    // Display current weather data for valid city name or ID. 
    //-------------------------------------------------------------------------------------

    function displayCurrentWeather(response) {

        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var cityID = response.id;
        // replace cityName with name returned in response,
        // this should help to maintain consistency regarding format of saved city names 
        cityName = response.name;

        //----------------------------------------------------------------------------------------------------
        // Calculate the current local date-time of target city whose weather will be displayed:
        // 1. utilize API timezone offset from GMT in seconds to calculate GMT offset in hours for target city
        // 2. capture current UTC/GMT date-time from moment.js
        // 3. use moment 'add' method to convert UTC date-time to target city's current local date-time
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

        // capture current UTC/GMT date-time from moment.js
        var momentLocalDateTime = moment.utc();

        // add GMT offset in hours to UTC/GMT time to get target city current local date-time 
        momentLocalDateTime.add(tzOffsetHrs, 'hours');

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

        var colLatitudeLit = $("<div>").addClass("col-1 align-bot");
        colLatitudeLit.text("Latitude:");
        var colLatitudeVal = $("<div>").addClass("col-2 align-bot");
        colLatitudeVal.text(latitude);

        var colLongitudeLit = $("<div>").addClass("col-3 align-bot");
        colLongitudeLit.text("Longitude:  " + longitude);
        //var colLongitudeVal = $("<div>").addClass("col-1");
        //colLongitudeVal.text(lon);

        cityRow.append(colCity, colLatitudeLit, colLatitudeVal, colLongitudeLit);

        $currentWeather.append(cityRow);

        //----------------------------------------------------------------------------
        // build sunrise & sunset row 
        //----------------------------------------------------------------------------
        var sunriseRow = $("<div>").addClass("row");

        var colIndentLit = $("<div>").addClass("col-6");

        // capture local sunrise for today in UTC using moment.js 
        momentSunrise = moment.unix(response.sys.sunrise).utc();
        // add time zone offset to UTC sunrise to get target city local sunrise time
        momentSunrise.add(tzOffsetHrs, 'hours');
        let sunriseStr = momentSunrise.format("h:mm:ss a");
        console.log("Sunrise/utc: ", momentSunrise.format(), " ", sunriseStr);

        var colSunriseLit = $("<p>").addClass("col-1");
        colSunriseLit.text("Sunrise:");
        var colSunriseTime = $("<p>").addClass("col-2");
        colSunriseTime.text(sunriseStr);

        // capture local sunset for today in UTC using moment.js 
        momentSunset = moment.unix(response.sys.sunset).utc();
        //console.log("Sunset/utc: ", momentSunset.format());
        // add time zone offset to UTC sunset to get target city local sunset time
        momentSunset.add(tzOffsetHrs, 'hours');
        let sunsetStr = momentSunset.format("h:mm:ss a");
        console.log("Sunset/utc: ", momentSunset.format(), " ", sunsetStr);
        
        var colSunsetLit = $("<p>").addClass("col-1");
        colSunsetLit.text("Sunset:");
        var colSunsetTime = $("<p>").addClass("col-2");
        colSunsetTime.text(sunsetStr);

        sunriseRow.append(colIndentLit, colSunriseLit, colSunriseTime, colSunsetLit, colSunsetTime);

        $currentWeather.append(sunriseRow);

        //---------------------------------------------------------------
        // Create "Current Conditions" heading followed by weather icon 
        //---------------------------------------------------------------

        // add blank line before current conditions area
        //var forecastRow = $("<br>");
        //$currentWeather.append(forecastRow);

        var currentConditionRow = $("<div>").addClass("row");

        var currCondHeadingLit = $("<div>").addClass("col-6 h5");
        currCondHeadingLit.text("Conditions as of " + momentLocalDateTime.format("h:mm a") + ' (' + gmtInd + '):');

        var colIcon = $("<img>").addClass("col-1");
        colIcon.attr(
            "src",
            "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
        );

        currentConditionRow.append(currCondHeadingLit, colIcon);

        $currentWeather.append(currentConditionRow);


        //----------------------------------------------------------------------------
        // build temperature row using current temperature & weather icon description
        //----------------------------------------------------------------------------
        var tempRow = $("<div>").addClass("row");

        var colTempLit = $("<div>").addClass("col-2");
        colTempLit.text("Temperature:");
        var colTempVal = $("<div>").addClass("col-4");
        colTempVal.text(response.main.temp.toFixed(0) + " \u00B0F");
        
        var colDescription = $("<div>").addClass("col-4");
        var weatherDesc = response.weather[0].description;
        var weatherDescription = weatherDesc[0].toUpperCase() + weatherDesc.substr(1);
        colDescription.text(weatherDescription);
        //colDescription.text(response.weather[0].main + ': ' + response.weather[0].description);
        
        tempRow.append(colTempLit, colTempVal, colDescription);

        $currentWeather.append(tempRow);

        //----------------------------------------------------------------------------
        // build humidity row using current humidity value and sunrise time
        //----------------------------------------------------------------------------
        var humidityRow = $("<div>").addClass("row");

        var colHumLit = $("<div>").addClass("col-2");
        colHumLit.text("Humidity:");
        var colHumVal = $("<div>").addClass("col-4");
        colHumVal.text(response.main.humidity + " %");

        humidityRow.append(colHumLit, colHumVal);

        $currentWeather.append(humidityRow);

        //-------------------------------------------------------------------------------
        // build wind row using current wind speed & direction (degrees) and sunset time
        //-------------------------------------------------------------------------------
        var windSpeedRow = $("<div>").addClass("row");

        var colWindLit = $("<div>").addClass("col-2");
        colWindLit.text("Wind:");
        var colWindVal = $("<div>").addClass("col-4");
        colWindVal.text(response.wind.speed.toFixed(0) + " mph " + getWindCardinalDirection(response.wind.deg) + " (" + response.wind.deg + "\u00B0)");

        windSpeedRow.append(colWindLit, colWindVal);

        $currentWeather.append(windSpeedRow);

        //-----------------------------------------------------------------------------------
        // need to use longitude & latitude (from ajax response above) to get UV Index value
        //-----------------------------------------------------------------------------------
        getUVIndex(cityID, latitude, longitude, tzOffsetHrs);

        //-----------------------------------------------------------------------------------
        // city name and cityID from response in city history array (of objects)
        //-----------------------------------------------------------------------------------
        saveSearchCity(cityName, cityID);

    }


    //-------------------------------------------------------------------------------------
    // function to get the UV Index for the city in question using latitude and longitude
    // returned in response to request for current weather above (displayCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getUVIndex(cityId, lat, lon, tzOffsetHrs) {

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

            var colUvIndexVal = $("<div>").addClass("col-4");
            colUvIndexVal.append(uvIndexSpan);

            uvIndexRow.append(colUvIndexLit, colUvIndexVal);

            $currentWeather.append(uvIndexRow);

            getForecast(cityId, tzOffsetHrs);

        });
    }


    //-------------------------------------------------------------------------------------
    // function to get the 5-day forecast for the city in question using the city ID 
    // returned in response to request for current weather above (getCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getForecast(cityID, tzOffsetHrs) {

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
            console.log(response);

            //  for (let i = 0; i < response.cnt; i++) {
            //      //let js_d = new Date(Number(response.list[i].dt) * 1000);
            //      let momentLocalDateTime = moment.unix(response.list[i].dt).utc();
            //      // add total time difference to browser local time to get target city local time 
            //      momentLocalDateTime.add(tzOffsetHrs, 'hours');
            //      //console.log(js_d.toLocaleString(),
            //      //console.log(js_d.toUTCString(),
            //      console.log(momentLocalDateTime.format("l"),
            //          momentLocalDateTime.format("h:mm a"),
            //          response.list[i].main.temp,
            //          response.list[i].main.humidity,
            //          response.list[i].main.temp_min,
            //          response.list[i].main.temp_max);
            //  }

            //-------------------------------------------------------------------------------------------
            // Start searching forecast data with current date so that when forecast date changes
            // we know we have moved into forecast data for the next day.
            //-------------------------------------------------------------------------------------------

            var searchDate = moment().format("l");
            console.log(searchDate);
            
            var compareDate  = "";
            var saveForecastDate = "";
            var saveForecastTime = "";
            var saveForecastIcon = "";
            var saveForecastHumidity = 0;
            var saveForecastHighTemp = 0;
            var saveForecastWind = {};

            var momentLocalDateTime;

            var processedFirstForecastDay = false;
            var forecastTemp = 0;
            var forecastTime;

            var idx = 0;

            do {
                // initialize local date-time in UTC from forecast using moment.js 
                momentLocalDateTime = moment.unix(response.list[idx].dt).utc();

                // add time zone offset to UTC forecast date-time to get target city local date-time 
                momentLocalDateTime.add(tzOffsetHrs, 'hours');
                compareDate = momentLocalDateTime.format("l");
                let timeStr = momentLocalDateTime.format("h:mma");
                forecastTime = timeStr.slice(0, timeStr.length - 1);
                //forecastTime = momentLocalDateTime.format("H:mm");

                if (compareDate !== searchDate) {
                    // The forecast data has changed to a new day, so ...
                    //  load saved forecast data from the previous day (if any yet) into the forecast array
                    //  and save the first hour's forecast data for the next day.
                    if (processedFirstForecastDay) {
                        // create new forecast object with previous days forecast data
                        var newForecast = new Forecast(
                            saveForecastDate,
                            saveForecastTime,
                            saveForecastIcon,
                            saveForecastHighTemp,
                            saveForecastHumidity,
                            saveForecastWind
                            );
                        // push/load new forecast object into 5-day array
                        fiveDayForecast.push(newForecast);
                    } else {
                        processedFirstForecastDay    = true;
                    }
                    saveForecastDate     = compareDate;
                    searchDate           = compareDate;
                    saveForecastHighTemp = response.list[idx].main.temp;
                    saveForecastTime     = forecastTime;
                    saveForecastIcon     = response.list[idx].weather[0].icon;
                    saveForecastHumidity = response.list[idx].main.humidity
                    saveForecastWind     = response.list[idx].wind
                } else {
                    forecastTemp = response.list[idx].main.temp;
                    if (forecastTemp > saveForecastHighTemp) {
                        saveForecastTime     = forecastTime;
                        saveForecastIcon     = response.list[idx].weather[0].icon;
                        saveForecastHighTemp = forecastTemp;
                        saveForecastHumidity = response.list[idx].main.humidity;
                        saveForecastWind     = response.list[idx].wind;
                    }
                }
                idx++
            } while (idx < response.cnt);

            //-----------------------------------------------------------------------------------
            // Need to save last entry in response array as the fifth entry in 5-day forecast
            // if inquiring before 2 pm.
            //-----------------------------------------------------------------------------------
            if (fiveDayForecast.length < 5) {
                var newForecast = new Forecast(
                    compareDate,
                    forecastTime,
                    response.list[39].weather[0].icon,
                    response.list[39].main.temp,
                    response.list[39].main.humidity,
                    response.list[39].wind
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
    function Forecast(fcDate, fcTime, fcIcon, fcTemp, fcHumidity, fcWind) {
        this.forecastDate = fcDate;
        this.forecastTime = fcTime;
        this.forecastIcon = fcIcon;
        this.forecastTemp = fcTemp;
        this.forecastHumidity = fcHumidity;
        this.forecastWind = fcWind;
    }

    //------------------------------------------------------
    // Function to create a forecast Day box consisting of
    //  - date, icon and temperature and humidity values.
    //------------------------------------------------------
    function createForecastDay(forecastDay, forecast) {

        var forecastDateTime = $("<div>");

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
        forecastTemp.text("Hi Temp: " + forecast.forecastTemp.toFixed(0) + " \u00B0F");
        forecastDay.append(forecastTemp);

        var forecastHumidity = $("<p>");
        forecastHumidity.text("Humidity: " + forecast.forecastHumidity + " %");
        forecastDay.append(forecastHumidity);
        
        var forecastWind = $("<p>");
        forecastWind.text("Wind: " + forecast.forecastWind.speed.toFixed(0) + " mph " +
         getWindCardinalDirection(forecast.forecastWind.deg));
        // + forecast.forecastWind.deg + "\u00B0");
        forecastDay.append(forecastWind);
    }

});
