(function () {
  "use strict";
  var center = [10.69947, 76.08935];
  var bounds = L.latLngBounds([10.6983, 76.0869], [10.7015, 76.0919]);
  var map = L.map("map", { maxBounds: bounds, maxBoundsViscosity: 0.8 }).setView(center, 19);
  var normal = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    minZoom: 17, maxZoom: 21, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  var satellite = L.tileLayer("https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}", {
    minZoom: 17, maxZoom: 21, subdomains: ["mt0", "mt1", "mt2", "mt3"]
  });
  satellite.addTo(map);
  L.control.layers({ Satellite: satellite, Map: normal }, null, { position: "bottomright" }).addTo(map);
  var status = document.getElementById("status");
  var layer = L.layerGroup().addTo(map);
  var blockLayer = L.layerGroup().addTo(map);

  function clean(value) {
    var element = document.createElement("div");
    element.textContent = value || "";
    return element.innerHTML;
  }

  var categoryIcons = { stage: "★", venue: "●", food: "♨", facility: "♜", medical: "✚", other: "◆" };
  var selectedCategory = "all";
  function venueIcon(venue) {
    var category = venue.category || "other";
    return L.divIcon({
      className: "venue-marker " + category + (venue.active === false ? " inactive" : ""),
      html: "<span>" + categoryIcons[category] + "</span>", iconSize: [40, 46], iconAnchor: [20, 42], popupAnchor: [0, -38]
    });
  }

  function render(venues) {
    layer.clearLayers();
    venues.filter(function (venue) { return selectedCategory === "all" || (venue.category || "other") === selectedCategory; }).forEach(function (venue) {
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
  document.getElementById("category-filter").addEventListener("change", function () { selectedCategory = this.value; if (window.currentVenues) render(window.currentVenues); });

  function renderBlocks(blocks) {
    blockLayer.clearLayers();
    blocks.forEach(function (block) {
      var shortName = clean(block.name).replace(/ Block$/i, "");
      var icon = L.divIcon({ className: "campus-block-marker", html: shortName, iconSize: null, iconAnchor: [17, 14] });
      L.marker([block.lat, block.lng], { icon: icon }).bindTooltip(clean(block.name), { direction: "top" }).addTo(blockLayer);
    });
  }

  function fallback() {
    return fetch("data/venues.json", { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw Error();
      return response.json();
    }).then(function (venues) { window.currentVenues = venues; render(venues); }).catch(function () { status.textContent = "Venues could not be loaded"; });
  }

  var config = window.ANSAR_FIREBASE_CONFIG || {};
  if (config.apiKey && config.apiKey !== "REPLACE_ME") {
    firebase.initializeApp(config);
    firebase.firestore().collection("venues").onSnapshot(function (snapshot) {
      var venues = [];
      snapshot.forEach(function (document) { venues.push(Object.assign({ id: document.id }, document.data())); });
      window.currentVenues = venues; render(venues);
    }, fallback);
    firebase.firestore().collection("campusBlocks").onSnapshot(function (snapshot) {
      var blocks = [];
      snapshot.forEach(function (document) { blocks.push(Object.assign({ id: document.id }, document.data())); });
      renderBlocks(blocks);
    });
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
