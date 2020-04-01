require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/api/weather/name/:name", function (req, res) {
    const queryURL =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        req.params.name +
        "&units=imperial&appid="
        + process.env.WEATHER_API_KEY;

    axios.get(queryURL).then(function ({ data }) {
        res.json(data);
    });
});

app.get("/api/weather/id/:id", function (req, res) {
    const queryURL =
        "https://api.openweathermap.org/data/2.5/weather?id=" +
        req.params.id +
        "&units=imperial&appid="
        + process.env.WEATHER_API_KEY;

    axios.get(queryURL).then(function ({ data }) {
        res.json(data);
    });
});

app.get("/api/weather/forecast/id/:id", function (req, res) {
    const queryURL =
        "https://api.openweathermap.org/data/2.5/forecast?id=" + req.params.id +
        "&units=imperial&appid=" +
        process.env.WEATHER_API_KEY;

    axios.get(queryURL).then(function ({ data }) {
        res.json(data);
    });
});

app.get("/api/weather/coord/:lat/:lon", function (req, res) {
    const queryURL =
        "https://api.openweathermap.org/data/2.5/uvi?appid=" +
        process.env.WEATHER_API_KEY
        +
        "&units=imperial&lat=" + req.params.lat + "&lon=" + req.params.lon;
    axios.get(queryURL).then(function ({ data }) {
        res.json(data);
    });
});

app.get("*", function(req, res){
    res.redirect("/");
})

app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`));
