let map;

function initializeMarkers(mapInstance) {
  map = mapInstance;

  // カテゴリ別のアイコン設定
  const icons = {
    popcorn: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    food:    "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    toilet:  "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

  const markerObjects = markers.map(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name,
      icon: icons[point.category]  // ← カテゴリに応じたアイコンを設定
    });

    // タップで名前表示
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
  });

  function updateMarkers() {
    const zoom = map.getZoom();
    markerObjects.forEach(({ marker, category }) => {
      if (zoom >= 17) {
        marker.setVisible(true);
      } else if (zoom >= 15.5) {
        marker.setVisible(category === "toilet");
      } else {
        marker.setVisible(false);
      }
    });
  }

  map.addListener("zoom_changed", updateMarkers);

  updateMarkers(); // ← 最初に1回実行する

  return markerObjects;
}
