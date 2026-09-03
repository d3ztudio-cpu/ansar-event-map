(function () {
  "use strict";
  var center = [10.69947, 76.08935];
  var bounds = L.latLngBounds([10.6983, 76.0869], [10.7015, 76.0919]);
  var map = L.map("map", { maxBounds: bounds, maxBoundsViscosity: 0.8 }).setView(center, 19);
  var normal = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 17, maxZoom: 21, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  var satellite = L.tileLayer("https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}", {
    minZoom: 17, maxZoom: 21, subdomains: ["mt0", "mt1", "mt2", "mt3"]
  });
  L.control.layers({ Map: normal, Satellite: satellite }, null, { position: "bottomright" }).addTo(map);
  var status = document.getElementById("status");
  var layer = L.layerGroup().addTo(map);

  function clean(value) {
    var element = document.createElement("div");
    element.textContent = value || "";
    return element.innerHTML;
  }

  function venueIcon(venue) {
    return L.divIcon({
      className: "venue-marker " + (venue.category || "other") + (venue.active === false ? " inactive" : ""),
      html: "<span></span>", iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -13]
    });
  }

  function render(venues) {
    layer.clearLayers();
    venues.forEach(function (venue) {
      var title = venue.name || venue.stageNumber || "Venue";
      var details = [venue.stageNumber, venue.block, venue.floor].filter(Boolean).map(clean).join(" · ");
      var marker = L.marker([venue.lat, venue.lng], { icon: venueIcon(venue) })
        .bindPopup('<strong class="popup-title">' + clean(title) + '</strong><div class="popup-meta">' + details + '</div>' +
          (venue.description ? '<div class="popup-description">' + clean(venue.description) + '</div>' : ""))
        .addTo(layer);
      if (venue.active !== false) marker.bindTooltip(clean(title), { className: "venue-label", direction: "top", offset: [0, -14] });
    });
    var activeCount = venues.filter(function (venue) { return venue.active !== false; }).length;
    status.textContent = venues.length ? activeCount + " active venue" + (activeCount === 1 ? "" : "s") : "No venues published";
    setTimeout(function () { status.textContent = ""; }, 2500);
  }

  function fallback() {
    return fetch("data/venues.json", { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw Error();
      return response.json();
    }).then(render).catch(function () { status.textContent = "Venues could not be loaded"; });
  }

  var config = window.ANSAR_FIREBASE_CONFIG || {};
  if (config.apiKey && config.apiKey !== "REPLACE_ME") {
    firebase.initializeApp(config);
    firebase.firestore().collection("venues").onSnapshot(function (snapshot) {
      var venues = [];
      snapshot.forEach(function (document) { venues.push(Object.assign({ id: document.id }, document.data())); });
      render(venues);
    }, fallback);
  } else fallback();

  var locationMarker, accuracyCircle;
  document.getElementById("locate-button").addEventListener("click", function () {
    if (!navigator.geolocation) { status.textContent = "Location is not supported"; return; }
    status.textContent = "Finding your location...";
    navigator.geolocation.getCurrentPosition(function (position) {
      var location = [position.coords.latitude, position.coords.longitude];
      if (locationMarker) map.removeLayer(locationMarker);
      if (accuracyCircle) map.removeLayer(accuracyCircle);
      locationMarker = L.circleMarker(location, { radius: 8, color: "#fff", weight: 3, fillColor: "#377caf", fillOpacity: 1 }).addTo(map);
      accuracyCircle = L.circle(location, { radius: position.coords.accuracy, color: "#377caf", weight: 1, fillOpacity: 0.08 }).addTo(map);
      map.setView(location, 20); status.textContent = "";
    }, function () { status.textContent = "Location permission was not available"; }, { enableHighAccuracy: true, timeout: 10000 });
  });
})();
