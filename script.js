```javascript
let map;

function initializeMarkers(mapInstance) {
  map = mapInstance;

  const icons = {
    popcorn: {
      url: "cut.png",
      scaledSize: new google.maps.Size(60, 60)
    },
    food: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    toilet: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };

  // ★ const → let に変更
  let markerObjects = markers.map(point => {

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

    return {
      marker,
      category: point.category
    };
  });


  // ========================================
  // ズームによるマーカー表示・サイズ変更
  // ========================================

  function updateMarkers() {

    const zoom = map.getZoom();

    let popcornSize = 30 + (zoom - 15) * 8;

    popcornSize = Math.max(
      35,
      Math.min(80, popcornSize)
    );

    markerObjects.forEach(({ marker, category }) => {

      if (zoom >= 16.5) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }

      // ポップコーンのサイズ変更
      if (category === "popcorn") {

        marker.setIcon({
          url: "cut.png",

          scaledSize: new google.maps.Size(
            popcornSize,
            popcornSize
          ),

          anchor: new google.maps.Point(
            popcornSize / 2,
            popcornSize
          )
        });

      }

    });

  }


  map.addListener(
    "zoom_changed",
    updateMarkers
  );

  updateMarkers();


  // ========================================
  // 🍿 ポップコーンフィルター
  // ========================================

  const popcornBtn =
    document.getElementById("popcornBtn");

  const popcornMenu =
    document.getElementById("popcornMenu");


  // ポップコーンボタンを押したとき
  popcornBtn.addEventListener("click", () => {

    // メニューの表示・非表示を切り替える
    if (popcornMenu.style.display === "block") {

      popcornMenu.style.display = "none";

    } else {

      popcornMenu.style.display = "block";

      // メニューを一度空にする
      popcornMenu.innerHTML = "";


      // ポップコーンだけを取り出す
      const popcornList = markers.filter(
        point => point.category === "popcorn"
      );


      // 味ごとのボタンを作る
      popcornList.forEach(point => {

        const button =
          document.createElement("button");

        button.textContent = point.name;


        // 味を選択したとき
        button.addEventListener("click", () => {

          markerObjects.forEach(obj => {

            // 選択した味だけ表示
            if (
              obj.marker.getTitle() === point.name
            ) {

              obj.marker.setVisible(true);

            } else {

              obj.marker.setVisible(false);

            }

          });

        });


        popcornMenu.appendChild(button);

      });

    }

  });


  return markerObjects;
}
```
