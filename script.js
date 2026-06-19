let map;
function initializeMarkers(mapInstance) {
  map = mapInstance;

  const icons = {
    popcorn: {
  url: "cut.png",
  scaledSize: new google.maps.Size(40, 40)
},
    food:    "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    toilet:  "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

  const markerObjects = markers.map(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name,
      icon: icons[point.category]
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-size:14px; font-weight:bold;">
          ${point.name}
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return { marker, category: point.category };
  }); // ← markerObjects.map終わり

  function updateMarkers() { // ← ここが外に出る
    const zoom = map.getZoom();
    markerObjects.forEach(({ marker, category }) => {
      if (zoom >= 16.5) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }
    });
  }

  map.addListener("zoom_changed", updateMarkers);
  updateMarkers();
  return markerObjects;
}
