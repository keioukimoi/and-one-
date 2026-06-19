let map;
function initializeMarkers(mapInstance) {
  map = mapInstance;
  const icons = {
    popcorn: {
      url: "cut.png",
      scaledSize: new google.maps.Size(60, 60)
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
  });

  // ↓ ここを修正しました
  function updateMarkers() {
    const zoom = map.getZoom();
      // ズームに応じて段階的にサイズを変える
    let popcornSize = 30 + (zoom - 15) * 8;  // ズームに比例して大きくなる
    popcornSize = Math.max(40, Math.min(80, popcornSize));  // 40〜80の範囲に収める

    markerObjects.forEach(({ marker, category }) => {
      if (zoom >= 16.5) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }

      // ↓ ここを追加：ポップコーンだけサイズを動的に変更
      if (category === "popcorn") {
        marker.setIcon({
          url: "cut.png",
          scaledSize: new google.maps.Size(popcornSize, popcornSize),
          anchor: new google.maps.Point(popcornSize / 2, popcornSize)
        });
      }
    });
  }

  map.addListener("zoom_changed", updateMarkers);
  updateMarkers();
  return markerObjects;
}
