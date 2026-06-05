const markerObjects = MARKERS.map(point => {
  const marker = new google.maps.Marker({
    position: { lat: point.lat, lng: point.lng },
    map: map,
    title: point.title
  });
  return { marker, category: point.category };
});
