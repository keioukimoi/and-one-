let map;
function initializeMarkers(mapInstance) {
  map = mapInstance;
  const icons = {
    popcorn: {
      url: "cut.png",
      scaledSize: new google.maps.Size(60, 60)
    },
    food:    "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    toilet: {
      url: "toilet.png",
      scaledSize: new google.maps.Size(40, 40)
    },
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
    let iconSize = 30 + (zoom - 15) * 8;  // ズームに比例して大きくなる
    iconSize = Math.max(35, Math.min(80, iconSize));  // 35〜80の範囲に収める

    markerObjects.forEach(({ marker, category }) => {
      if (zoom >= 16.5) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }

      // ポップコーンのサイズを動的に変更
      if (category === "popcorn") {
        marker.setIcon({
          url: "cut.png",
          scaledSize: new google.maps.Size(iconSize, iconSize),
          anchor: new google.maps.Point(iconSize / 2, iconSize)
        });
      }

      // ↓ トイレのサイズを動的に変更（追加）
      if (category === "toilet") {
        marker.setIcon({
          url: "toilet.png",
          scaledSize: new google.maps.Size(iconSize, iconSize),
          anchor: new google.maps.Point(iconSize / 2, iconSize)
        });
      }
    });
  }
  map.addListener("zoom_changed", updateMarkers);
  updateMarkers();
  return markerObjects;
}
