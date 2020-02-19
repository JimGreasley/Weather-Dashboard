# Weather-Dashboard


## Algorithm

The current WeatherCities history, in JSON format, is retrieved from local storage.
If no data is returned then an empty weather_cities array is created.

Initially the page display is empty except for any city history.

If a city name is input and the search button clicked the program makes three AJAX calls to the weather API:
  - the first for the current weather conditions
  - the second to get the UV Index using the city's latitude and longitude returned by the 1st call
  - the third to get 5-day forecast data 

After the weather data has been displayed for a city, it will be saved in the history array (if it doesn't already exist in the array) and the updated history array is stored, in JSON format, in local storage.



## Link
https://jimgreasley.github.io/Weather-Dashboard/
