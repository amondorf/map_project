// CAFE MODEL
var cafes = [{
        name: "Kaffee Stark",
        id: "4b0d4d0af964a520e44523e3",
        coordinates: {
            lat: 53.553325,
            lng: 9.961566
        }
    },
    {
        name: "Cafe Leonar",
        id: "4b066fe9f964a520d3eb22e3",
        coordinates: {
            lat: 53.569785,
            lng: 9.984058
        }
    },
    {
        name: "Petit Cafe",
        id: "4b5c7213f964a520393029e3",
        coordinates: {
            lat: 53.584554,
            lng: 9.983470
        }
    },
    {
        name: "Cafe Uhrlaub",
        id: "4af6ee10f964a520300422e3",
        coordinates: {
            lat: 53.557816,
            lng: 10.011598
        }
    },
    {
        name: "Milch",
        id: "54b7903c498ee1394cddca79",
        coordinates: {
            lat: 53.545985,
            lng: 9.974678
        }
    }
];

var map;
var CLIENT_ID = "FHPCB4Z0FSTBC0AAKD2SUONSXYLHXVD3ASFWB0JERNDRQG0J";
var CLIENT_SECRET = "D0DOYUWEXXTQO3ORNJTJDABIGUAMQN0S1CQGVA450KI2DNST";

// as seen in https://www.w3schools.com/jsref/event_onerror.asp
function mapError() {
    alert("The map could not be loaded, please try again later!")
};

// CAFE VIEW
function initMap() {
    var hamburg = {
            lat: 53.560818,
            lng: 9.985832
        },
        map = new google.maps.Map(document.getElementById("map"), {
            //center map
            center: hamburg,
            zoom: 12
        });
    var infoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < cafes.length; i++) {
        var name = cafes[i].name;
        var position = cafes[i].coordinates;
        var id = cafes[i].id;
        var marker = new google.maps.Marker({
            name: name,
            map: map,
            position: position,
            id: id,
            // drop markers: https://developers.google.com/maps/documentation/javascript/examples/marker-animations
            animation: google.maps.Animation.DROP,
        });

        cafes[i].marker = marker;
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);
        });
    }
    ko.applyBindings(new viewModel());
};


function populateInfoWindow(marker, infowindow) {
    var fsqURL = 'https://api.foursquare.com/v2/venues/' + marker.id + '?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=20160118' + '&query=' + marker.name;
    console.log(fsqURL);

    if (infowindow.marker != marker) {
        $.ajax({
            url: fsqURL,
            dataType: "json",
            async: true,
            success: function(data) {
                name = data.response.venue.name || 'Name not available';
                rating = data.response.venue.rating || 'Rating not available';
                url = data.response.venue.url || 'Website not available';
                console.log(data);
                infowindow.setContent("<div><h4>" + name + "</h4></div>" + "Foursquare Rating: " + rating + "<div>" + "Website: " + "<a href='" + url + "'>" + url + "</a>" + "</div>");
                infowindow.marker = marker;
                infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                // stop bounce as seen in http://stackoverflow.com/questions/7339200/bounce-a-pin-in-google-maps-once
                setTimeout(function() {
                    marker.setAnimation(null);
                }, 750);
            },
            error: function() {
                alert("Foursquare is sleeping, please try again later!")
            }
        })
    }
};

var cafeItem = function(data) {
    this.marker = data.marker;
    this.name = data.name;
}

// CAFE OCTOPUS
function viewModel() {
    var self = this;
    self.cafeList = ko.observableArray([]);
    // create list as seen in the cat clicker example
    cafes.forEach(function(cafeList) {
        self.cafeList.push(new cafeItem(cafeList));
    })

    self.clickedList = function(clickedCafe) {
        var index = clickedCafe.id;
        var marker = clickedCafe.marker;
        google.maps.event.trigger(marker, 'click');
    }

    // search list function
    self.searchCafes = ko.observable('');
    self.searchList = function(value) {
        self.cafeList.removeAll();
        for (var i in cafes) {
            if (cafes[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.cafeList.push(cafes[i]);
            }
        }
    }

    // search markers function
    self.searchMarkers = function(value) {
        for (i = 0; i < cafes.length; i++) {
            if (cafes[i].marker.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                cafes[i].marker.setVisible(true);
                console.log(cafes[i].marker.name);
            } else(cafes[i].marker.setMap(null))
        }
    };

    self.searchCafes.subscribe(self.searchList);
    self.searchCafes.subscribe(self.searchMarkers);
};

// mobile view
$(document).ready(function() {
    $("#mobile-navigation").click(function() {
        console.log("test");
        $("ul").toggleClass("mobile-sidebar");
        $("form").toggleClass("mobile-sidebar-input");
    });
});
