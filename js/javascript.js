// Capture selector for HTML area to hold current weather data  
var $currentWeather = $("#current-weather");

// This is my API key.
var APIKey = "7514abfe02ab6db7877685958ec119d7";



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

        var cityRow   = $("<row>").addClass("row");

        var colCityDate = response.name +' (' + moment().format("l") + ')';

        var colCity = $("<col>").addClass("col-3 city");
        colCity.text(colCityDate);
        
        var colIcon = $("<img>").addClass("col-1");
        colIcon.attr(
            "src",
            "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
        );

        cityRow.append(colCity, colIcon);

        $currentWeather.append(cityRow);

        var tempRow   = $("<row>").addClass("row");
        tempRow.text("Temperature: " + response.main.temp + " \u00B0F");
        $currentWeather.append(tempRow);

        var humidityRow = $("<row>").addClass("row");
        humidityRow.text("Humidity: " + response.main.humidity + "%");
        $currentWeather.append(humidityRow);

        var windSpeedRow = $("<row>").addClass("row");
        windSpeedRow.text("Wind Speed: " + response.wind.speed  + "MPH");
        $currentWeather.append(windSpeedRow);

        getUVIndex(latitude, longitude);

    });

    //   Forecast: 
    //var queryURL = 
    // "http://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" +
    // + APIKey;

    //   Icon: "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png"
}


function getUVIndex(lat, lon) {
 
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

    });
    
}