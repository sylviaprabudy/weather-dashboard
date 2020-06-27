$(document).ready(function() {

    $("#search-btn").on("click", function() {

        var searchValue = $("#search-value").val();
        $("#search-value").val("");
        searchWeather(searchValue);

    });

    $(".history").on("click", "li", function () {
		searchWeather($(this).text());
    });
    
    function createRow(text) {
		var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
		$(".history").append(li);
    }
    
    function searchWeather(searchValue) {
		$.ajax({
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=84b79da5e5d7c92085660485702f4ce8&units=imperial",
			dataType: "json",
			success: function (data) {
				// create history link for this search
				if (history.indexOf(searchValue) === -1) {
					history.push(searchValue);
					window.localStorage.setItem("history", JSON.stringify(history));

					createRow(searchValue);
				}

				// clear any old content
				$("#current-weather").empty();

				// create html content for current weather
				var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
				var card = $("<div>").addClass("card");
				var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
				var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
				var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
				var cardBody = $("<div>").addClass("card-body");
				var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

				// merge and add to page
				title.append(img);
				cardBody.append(title, temp, humid, wind);
				card.append(cardBody);
				$("#current-weather").append(card);

				// call follow-up api endpoints
				getForecast(searchValue);
				getUVIndex(data.coord.lat, data.coord.lon);
			}
		});
	}

    function getForecast(searchValue) {
		$.ajax({
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=84b79da5e5d7c92085660485702f4ce8&units=imperial",
			dataType: "json",
			success: function (data) {
				// overwrite any existing content with title and empty row
				$("#forecast").html("<h4 class=\"mt-3 ml-3 mr-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

				// loop over all forecasts (by 3-hour increments)
				for (var i = 0; i < data.list.length; i++) {
					// only look at forecasts around 3:00pm
					if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
						// create html elements for a bootstrap card
						var col = $("<div>").addClass("col-md-2");
						var card = $("<div>").addClass("card bg-primary text-white");
						var body = $("<div>").addClass("card-body p-2");

						var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

						var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

						var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");

						var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

						// merge together and put on page
						col.append(card.append(body.append(title, img, p1, p2)));
						$("#forecast .row").append(col);
					}
				}
			}
		});
	}

    function getUVIndex(lat, lon) {
		$.ajax({
			type: "GET",
			url: "http://api.openweathermap.org/data/2.5/uvi?appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial" + lat + "&lon=" + lon,
			dataType: "json",
			success: function (data) {
				var uv = $("<p>").text("UV Index: ");
				var btn = $("<span>").addClass("btn btn-sm").text(data.value);

				// change color depending on uv value
				if (data.value < 3) {
					btn.addClass("btn-success");
				}
				else if (data.value < 7) {
					btn.addClass("btn-warning");
				}
				else {
					btn.addClass("btn-danger");
				}

				$("#current-weather .card-body").append(uv.append(btn));
			}
		});
    }
    
    // get current history, if any
	var history = JSON.parse(window.localStorage.getItem("history")) || [];

	if (history.length > 0) {
		searchWeather(history[history.length - 1]);
	}

	for (var i = 0; i < history.length; i++) {
		createRow(history[i]);
	}

})