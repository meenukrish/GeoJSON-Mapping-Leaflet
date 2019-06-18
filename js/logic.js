 // Define streetmap and darkmap layers
 var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 3,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// 
var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 3,
  id: "mapbox.light",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 3,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});


// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Satellite": satellite,
  "Grayscale": grayscale,
  "Outdoors": outdoors 

};


function chooseColor(magnitude) {
  var color = "";
  if (magnitude >= 5) {
    color = "#ff0000";
  }
  else if ((magnitude < 5) &&(magnitude >=4)){
    color = "#ff8000";
  }
  else if ((magnitude < 4) &&(magnitude >=3)){
    color = "#ffbf00";
  }
  else if ((magnitude < 3) &&(magnitude >=2)){
    color = "	#ffff00";
  }
  else if ((magnitude < 2) &&(magnitude >=1)){
    color = "#bfff00";
  }
  else {
    color = "#00ff00";
  };

  return color;
}


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature2(feature, layer) 
  {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3> <hr> <h3>Magnitude: " + feature.properties.mag + "</h3>");  
  }
 
  
  function AddCircles(feature, latlng )
  {
  // console.log(`latlng :${latlng} Feature : ${feature} magnitude : ${feature.properties.mag}`)

  return (L.circle(latlng, {
                  stroke: true,
                  fillOpacity: 0.8,
                  color: chooseColor(feature.properties.mag),
                  fillColor: chooseColor(feature.properties.mag),
                  radius: 40000* feature.properties.mag
                }))
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, 
  {
    pointToLayer: AddCircles,
    onEachFeature: onEachFeature2
  });

  setquakeoverlay(earthquakes);
  
}


function setquakeoverlay(earthquakes)  {

  // Create overlay object to hold our overlay layer
  var quakeoverlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the satellite and earthquakes layers to display on load
  myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite, earthquakes]
  });

 L.control.layers(baseMaps, quakeoverlayMaps, {
    collapsed: false
  }).addTo(myMap);



  
// ***********************************
  // ADDING LEGEND
  // ***********************************
  try{
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
      mags = [0, 1, 2, 3, 4 ,5]
    labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"]
    
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML += "<table><tr><td style='background:" + chooseColor(mags[i]) + ";'></td><td>"+ labels[i]+"</td><tr></table>";
    }
    return div;
    };

    legend.addTo(myMap); 
  }
catch(e) { console.log(`Error in adding legend: ${e}`) }



} 

  
function addfaultlines(faultlinedata)
{
  function AddPloygon(feature) {

          var latlngs = feature.geometry.coordinates; 
          return L.polygon(latlngs, {color: 'red'})}

        // Once we get a response, send the data.features object to the createFeatures function
         var faultlines = L.geoJSON(faultlinedata, 
          {  pointToLayer: AddPloygon })
  
  setfaultoverlay(faultlines); 
  
}


function setfaultoverlay(faultlines)
{
  var faultoverlayMaps = {
    "Fault Lines": faultlines
  };  

  L.control.layers(null, faultoverlayMaps, {
    collapsed: false
  }).addTo(myMap);


}

//  Store our API endpoint inside queryUrl
    var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

   // Perform a GET request to the query URL
   d3.json(queryUrl, function(data) {
      // Once we get a response, send the data.features object to the createFeatures function
     createFeatures(data.features);
    });    

    var platesjson = "../plates/PB2002_boundaries.json"
      
  d3.json(platesjson, function(data) {

      addfaultlines(data.features);

  });

   

