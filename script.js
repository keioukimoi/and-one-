const markerObjects = MARKERS.map(point => {
  const markers = new google.maps.Marker({
    position: { lat: point.lat, lng: point.lng },
    map: map,
    title: point.title
  });
  return { markers, category: point.category };
});
