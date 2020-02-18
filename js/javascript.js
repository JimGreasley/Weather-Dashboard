
$(document).ready(function () {
    
    // Global variables
    // Capture selector for HTML area to hold current weather data  
    var $currentWeather = $("#current-weather");
    var $cityHistory    = $("#city-history");

    // This is my API key.
    var APIKey = "7514abfe02ab6db7877685958ec119d7";

    // get Weather Cities history data from local storage

    var data        = localStorage.getItem("WeatherCities");

    if (!data) {
        // create new 'empty' Work Day Schedule array
        // var weather_cities = [];
        var weather_cities = ["Phoenix", "Los Angeles", "Seattle"];
    } else {
        var weather_cities = JSON.parse(data);
    }

    // add each city in weather_cities array to history list group
    weather_cities.forEach(loadCity);
  

   // set Event to save text when corresponding save button is clicked
   $("#city-list").click(selectCity);

   
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


  
    function loadCity (cityName) {


    var newListItem = $("<button>").addClass("list-group-item list-group-item-action");
    newListItem.attr("type", "button");
    newListItem.attr("id", "city-list");
    newListItem.text(cityName);

    // Append the new timeslot row to the page (Container element)
    $cityHistory.append(newListItem);
}

 
    //-----------------------------------------------------------------------------------------
    //  function to select city from history list when its list entry is clicked
    //-----------------------------------------------------------------------------------------

    function selectCity(e) {
        event.preventDefault();  

        //console.log($(this).siblings(".textarea").val());
        //console.log($(this).attr("index"));
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
            var rowForecastDate1 = $("<p>").addClass("row");

            var js_date = new Date(Number(response.list[7].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate1.text(js_date.toLocaleDateString());
            colForecastDay1.append(rowForecastDate1);

            var colForecastDay2 = $("<div>").addClass("col-2");
            var rowForecastDate2 = $("<p>").addClass("row");

            var js_date = new Date(Number(response.list[15].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate2.text(js_date.toLocaleDateString());
            colForecastDay2.append(rowForecastDate2);


            var colForecastDay3 = $("<div>").addClass("col-2");
            var rowForecastDate3 = $("<p>").addClass("row");

            var js_date = new Date(Number(response.list[23].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate3.text(js_date.toLocaleDateString());
            colForecastDay3.append(rowForecastDate3);


            var colForecastDay4 = $("<div>").addClass("col-2");
            var rowForecastDate4 = $("<p>").addClass("row");

            var js_date = new Date(Number(response.list[31].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate4.text(js_date.toLocaleDateString());
            colForecastDay4.append(rowForecastDate4);

            var colForecastDay5 = $("<div>").addClass("col-2");
            var rowForecastDate5 = $("<p>").addClass("row");

            var js_date = new Date(Number(response.list[39].dt) * 1000);
            //console.log(d.toLocaleDateString());
            rowForecastDate5.text(js_date.toLocaleDateString());
            colForecastDay5.append(rowForecastDate5);


            // var rowForecastIcon = $("<img>").addClass("row");
            // rowForecastIcon.attr(
            //        "src",
            //        "http://openweathermap.org/img/w/" + response.list[7].weather[0].icon + ".png"
            //  );
            // colForecastDay1.append(rowForecastIcon);

            // var rowForecastTemp   = $("<div>").addClass("row");
            // rowForecastTemp.text("Temp: " + response.list[7].main.temp + " \u00B0F");
            // colForecastDay1.append(rowForecastTemp);

            // var rowForecastHumidity = $("<div>").addClass("row");
            // rowForecastHumidity.text("Humidity: " + response.list[7].main.humidity + "%");
            // colForecastDay1.append(rowForecastHumidity);

            //for (let i = 7; i < 40; i = i + 8) {
            //   var d = new Date(Number(response.list[i].dt) * 1000);
            //   console.log(d.toLocaleString(), response.list[i].main.temp, response.list[i].main.humidity,
            //   response.list[i].main.temp_min, response.list[i].main.temp_max);
            //}

            forecastRow.append(colForecastDay1, colForecastDay2, colForecastDay3, colForecastDay4, colForecastDay5);

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
            uvIndexSpan.text(" " + response.value);
            // uvIndexRow.text("UV Index: " + " <span>" + " " + response.value +"</span>");
            uvIndexRow.text("UV Index: ");
            uvIndexRow.append(uvIndexSpan);

            $currentWeather.append(uvIndexRow);

            getForecast(cityId);

        });

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