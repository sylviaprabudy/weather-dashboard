$(document).ready(function() {

    $("#search-button").on("click", function() {

        var searchValue = $("#search-value").val();
        $("#search-value").val("");
        searchWeather(searchValue);

    })
})