(function()  {

  var API_WORLDTIME_KEY = "8beafc440e5d1d569c4d13e6a1b18";
  var API_WORLDTIME_URL= "http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";
  var API_WEATHER_KEY = "5d4782f7b5ac490062a970888c1dee86";
  var API_WEATHER_URL= "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
  var IMG_WEATHER = "http://openweathermap.org/img/w/";

  var today = new Date();
  var timeNow = today.toLocaleTimeString();

  var $loader = $(".loader");
  var $body = $("body");

  var nombreNuevaCiudad = $("[data-input='cityAdd']");
  var buttonAdd = $("[data-button='add']");

  var buttonLoad = $("[data-saved-cities]");

  var cities = [];

  var cityWeather = {};
  cityWeather.zone;
  cityWeather.icon;
  cityWeather.temp;
  cityWeather.temp_max;
  cityWeather.temp_min;
  cityWeather.main;

  $( buttonAdd ).on("click", addNewCity);
  $( nombreNuevaCiudad ).on("keypress", function(event){
      if(event.which == 13){
      addNewCity(event);
    }
  });

  $ ( buttonLoad ).on("click",loadSavedCities);

  if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(getCoords, errorFound);
  } else {
    alert("Por favor, actualiza tu navegador");
  }

  function errorFound(error){
    alert("un error ocurrio, [codigo:  " + error.code + " ].");
    //0: Error Desconocido
    //1: Permiso debegado
    //2: Posición no dispponible
    //3: Time Out
  }

  function getCoords(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    console.log("Tu posición es: " + lat + ", " + lon);
    $.getJSON(API_WEATHER_URL + "lat=" + lat + "&lon=" + lon,getCurrentWeather);
  }

  function getCurrentWeather(data){
    cityWeather.zone = data.name;
    cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
    cityWeather.temp = data.main.temp - 273.15;
    cityWeather.temp_max = data.main.temp_max - 273.15;
    cityWeather.temp_min = data.main.temp_min - 273.15;
    cityWeather.main = data.weather[0].main;

    renderTemplate(cityWeather);
  }

  function activateTemplate(id){
    var t = document.querySelector(id);
    return document.importNode(t.content,true);
  }

  function renderTemplate(cityWeather, localtime){

    var clone = activateTemplate("#template--city");
    var timeToShow;

    if (localtime){
      timeToShow = localtime.split(" ")[1];
    } else {
      timeToShow = timeNow;
    }

    clone.querySelector("[data-time]").innerHTML = timeToShow;
    clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
    clone.querySelector("[data-icon]").src = cityWeather.icon;
    clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
    clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
    clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);

    $( $loader ).hide();
    $( $body ).append(clone);
  }

  function addNewCity(event) {
    event.preventDefault();
    $.getJSON(API_WEATHER_URL + "q=" + $(nombreNuevaCiudad).val(),getWeatherNewCity);
  }

  function getWeatherNewCity(data) {

    $.getJSON(API_WORLDTIME_URL + $(nombreNuevaCiudad).val(), function(response){

      $(nombreNuevaCiudad).val("");

      cityWeather = {};
      cityWeather.zone = data.name;
      cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
      cityWeather.temp = data.main.temp - 273.15;
      cityWeather.temp_max = data.main.temp_max - 273.15;
      cityWeather.temp_min = data.main.temp_min - 273.15;
      cityWeather.main = data.weather[0].main;

      renderTemplate(cityWeather,response.data.time_zone[0].localtime);

      cities.push(cityWeather);
      localStorage.setItem("cities", JSON.stringify(cities));

    });
  }

function loadSavedCities(event){
  event.preventDefault();

    function renderCities(cities){
      cities.forEach(function(city){
        renderTemplate(city);
      });
    }

    var cities = JSON.parse(localStorage.getItem("cities"));
    renderCities(cities);
  }
})();
