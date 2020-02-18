
$(document).ready(function () {
    
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");

    // This is my API key.
    var APIKey = "7514abfe02ab6db7877685958ec119d7";

    //const date = new Date(1582059600000).toDateString();
    //console.log(date);

    //var d = new Date();
    //console.log(typeof d);
    //var n = d.toLocaleDateString();
    //console.log(d.toLocaleDateString());

    // will be for clear button
    //$("#clear-link").on("click", function(event) {
    //    event.preventDefault();
    //    $("#result-card").empty();
    //});

    // save button calls
    $("#searchBtn").on("click", function(event) {
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
        }
        
    });

    function getCurrentWeather(city) {
    
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
        }).then(function(response) {
            console.log(response);
            //var now = moment().format("MMMM Do, YYYY");

            var latitude  = response.coord.lat;
            var longitude = response.coord.lon;
            var cityID    = response.id;

            var cityRow   = $("<div>").addClass("row");

            var colCityDate = response.name +' (' + moment().format("l") + ')';

            var colCity = $("<div>").addClass("col-4 citydate");
            colCity.text(colCityDate);
            
            var colIcon = $("<img>").addClass("col-1");
            colIcon.attr(
                "src",
                "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
            );

            cityRow.append(colCity, colIcon);

            $currentWeather.append(cityRow);

            var tempRow   = $("<div>").addClass("row");
            tempRow.text("Temperature: " + response.main.temp + " \u00B0F");
            $currentWeather.append(tempRow);

            var humidityRow = $("<div>").addClass("row");
            humidityRow.text("Humidity: " + response.main.humidity + "%");
            $currentWeather.append(humidityRow);

            var windSpeedRow = $("<div>").addClass("row");
            windSpeedRow.text("Wind Speed: " + response.wind.speed  + "MPH");
            $currentWeather.append(windSpeedRow);

            getUVIndex(cityID, latitude, longitude);

        });

        //   Forecast: 
        //var queryURL = 
        // "http://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" +
        // + APIKey;

        //   Icon: "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png"
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
        }).then(function(response) {
            console.log(response);
            
            var forecastRow   = $("<div>").addClass("row");
            forecastRow.text("5-Day Forecast:");

            // loop will start here

            var colForecastDay1 = $("<div>").addClass("col-2");
    
            var rowForecastDate = $("<div>").addClass("row");

            var js_date = new Date(Number(response.list[7].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate.text(js_date.toLocaleDateString());
            colForecastDay1.append(rowForecastDate);

            var rowForecastIcon = $("<img>").addClass("row");
            rowForecastIcon.attr(
                   "src",
                   "http://openweathermap.org/img/w/" + response.list[7].weather[0].icon + ".png"
             );
            colForecastDay1.append(rowForecastIcon);

            var rowForecastTemp   = $("<div>").addClass("row");
            rowForecastTemp.text("Temp: " + response.list[7].main.temp + " \u00B0F");
            colForecastDay1.append(rowForecastTemp);

            var rowForecastHumidity = $("<div>").addClass("row");
            rowForecastHumidity.text("Humidity: " + response.list[7].main.humidity + "%");
            colForecastDay1.append(rowForecastHumidity);

            //for (let i = 7; i < 40; i = i + 8) {
            //   var d = new Date(Number(response.list[i].dt) * 1000);
            //   console.log(d.toLocaleString(), response.list[i].main.temp, response.list[i].main.humidity,
            //   response.list[i].main.temp_min, response.list[i].main.temp_max);
            //}

            forecastRow.append(colForecastDay1);

            $currentWeather.append(forecastRow);

        });

    }

    //-------------------------------------------------------------------------------------
    // function to get the UV Index for the city in question using latitude and longitude
    // returned in response to request for current weather above (getCurrentWeather). 
    //-------------------------------------------------------------------------------------

    function getUVIndex(cityId, lat, lon) {
    
        // set up the AJAX query URL
    
        console.log("Get UV Index for lat (" + lat + ") and lon (" + lon + ")");
        //console.log(moment().format("l"));
        //return;
        
        var queryURL =     
            "http://api.openweathermap.org/data/2.5/uvi?appid=" +
            APIKey
            + 
            "&units=imperial&lat=" + lat + "&lon=" + lon;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            //var now = moment().format("MMMM Do, YYYY");
            console.log(response.value);

            var uvIndexRow = $("<div>").addClass("row");
            var uvIndexSpan = $("<span>").attr("id", "uv-intensity");
            uvIndexSpan.text(response.value);
            // uvIndexRow.text("UV Index: " + " <span>" + " " + response.value +"</span>");
            uvIndexRow.text("UV Index: ");
            uvIndexRow.append(uvIndexSpan);

            $currentWeather.append(uvIndexRow);

            getForecast(cityId);

        });

    }
});