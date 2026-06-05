let map;

function initializeMarkers(mapInstance) {
  map = mapInstance;
  
  const markerObjects = markers.map(point => {
    const marker = new google.maps.Marker({  // ← 変数名を markers → marker に変更
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name  // ← point.title → point.name に修正
    });
    return { marker, category: point.category };
  });
  
  return markerObjects;
}
