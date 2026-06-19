let map;
function updateMarkers() {
  const zoom = map.getZoom();
  const popcornSize = zoom >= 18 ? 60 : 40;  // ← ズームに応じてサイズ決定

  markerObjects.forEach(({ marker, category }) => {
    if (zoom >= 16.5) {
      marker.setVisible(true);
    } else {
      marker.setVisible(false);
    }

    // ポップコーンのアイコンサイズを変更
    if (category === "popcorn") {
      marker.setIcon({
        url: "cut.png",
        scaledSize: new google.maps.Size(popcornSize, popcornSize),
        anchor: new google.maps.Point(popcornSize / 2, popcornSize)
      });
    }
  });
}

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
