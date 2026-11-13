let map;

// ==================================================
// カテゴリごとの表示設定（ポップアップで使う）
// 絵文字・色・カテゴリ名をここでまとめて決めておく。
// ==================================================
const CATEGORY_INFO = {
  popcorn: { emoji: "🍿", label: "ポップコーン", color: "#e8a01d" },
  food:    { emoji: "🍗", label: "フード",       color: "#e8601d" },
  toilet:  { emoji: "🚻", label: "トイレ",       color: "#2d8fe8" }
};

function initializeMarkers(mapInstance) {
  map = mapInstance;

  // 背景のイラスト画像を地図に重ねる（機能そのまま）
  const overlay = new google.maps.GroundOverlay(
    "heikei.png",
    {
      north: 35.637544,
      south: 35.627657,
      east: 139.893391,
      west: 139.868139
    },
    { map: map }
  );

  // マーカーのアイコン設定（機能そのまま）
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

  // ==================================================
  // ポップアップは1つだけ使い回す
  // マーカーごとに作るのではなく、1つを共有して中身だけ入れ替える。
  // こうすると「1個開くと前のが自動で閉じる」ので画面がすっきりする。
  // ==================================================
  const infoWindow = new google.maps.InfoWindow();

  const markerObjects = markers.map(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name,
      icon: icons[point.category]
    });

    // マーカーをタップした時の動き
    marker.addListener("click", () => {
      // そのマーカーのカテゴリに合わせたポップアップの中身を作る
      infoWindow.setContent(makePopupHtml(point));
      infoWindow.open(map, marker);
    });

    return { marker, category: point.category };
  });

  // ==================================================
  // ズームに応じてポップコーンのサイズを変える（機能そのまま）
  // ==================================================
  function updateMarkers() {
    const zoom = map.getZoom();
    let popcornSize = 30 + (zoom - 15) * 8;                 // ズームに比例して大きくする
    popcornSize = Math.max(35, Math.min(80, popcornSize));  // 35〜80の範囲に収める

    markerObjects.forEach(({ marker, category }) => {
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


// ==================================================
// ポップアップの中身（HTML）を組み立てる関数
// 施設の情報を受け取って、おしゃれなカードのHTMLを返す。
// ==================================================
function makePopupHtml(point) {
  // カテゴリの情報（絵文字・色・ラベル）を取り出す。
  // 万が一カテゴリ不明でも落ちないように、予備の値を用意しておく。
  const info = CATEGORY_INFO[point.category] || { emoji: "📍", label: "施設", color: "#666" };

  // point.note があれば補足として表示する（なければ空）。
  // markers.jsの各施設に note を足せば、ここに説明が出る。
  const noteHtml = point.note
    ? `<div class="popup-note">${point.note}</div>`
    : "";

  // カード型のHTMLを文字列で組み立てて返す。
  // style属性で色を直接指定しているのは、カテゴリごとに色を変えるため。
  return `
    <div class="popup-card">
      <div class="popup-emoji" style="background:${info.color}1a; border-color:${info.color}40;">
        ${info.emoji}
      </div>
      <div class="popup-body">
        <div class="popup-label" style="color:${info.color};">${info.label}</div>
        <div class="popup-name">${point.name}</div>
        ${noteHtml}
      </div>
    </div>
  `;
}
