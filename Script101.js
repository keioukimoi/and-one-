let map;

// ==================================================
// カテゴリごとの表示設定（ポップアップで使う）
// 絵文字・色・カテゴリ名をここでまとめて決めておく
// ==================================================
const CATEGORY_INFO = {
  popcorn: { emoji: "🍿", label: "ポップコーン", color: "#e8a01d" },
  food:    { emoji: "🍗", label: "フード",       color: "#e8601d" },
  toilet:  { emoji: "🚻", label: "トイレ",       color: "#2d8fe8" }
};

// ==================================================
// markers.js のデータからアイコンを地図に置く
// 作ったマーカーの一覧を返す（あとで重なり判定などに使える）
// ==================================================
function initializeMarkers(mapInstance) {
  map = mapInstance;

  // カテゴリごとのアイコン
  const icons = {
    popcorn: {
      url: "cut.png",
      scaledSize: new google.maps.Size(60, 60)
    },
    food: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    toilet: {
      url: "toilet.png",
      scaledSize: new google.maps.Size(40, 40)
    }
  };

  // ポップアップは1つだけ作って使い回す
  // 中身だけ入れ替えるので、1つ開くと前のが自動で閉じる
  const infoWindow = new google.maps.InfoWindow();

  const markerObjects = [];

  let i = 0;                                  // 変数：今見ているデータの番号
  while (i < markers.length) {                // 条件：全部のデータを見るまで
    const point = markers[i];

    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.name,
      icon: icons[point.category]
    });

    // タップしたら、その施設のカードを出す
    marker.addListener("click", function () {
      infoWindow.setContent(makePopupHtml(point));
      infoWindow.open(map, marker);
    });

    markerObjects.push({ marker: marker, category: point.category });
    i = i + 1;                                // 変化量：次のデータへ
  }

  // ズームに合わせてポップコーンのアイコンの大きさを変える
  // （引いたときに小さすぎて見えなくならないように）
  function updateMarkers() {
    const zoom = map.getZoom();

    let popcornSize = 30 + (zoom - 15) * 8;                   // ズームに比例して大きくなる
    popcornSize = Math.max(35, Math.min(80, popcornSize));    // 35〜80 の範囲に収める

    let k = 0;                                // 変数：今見ているマーカーの番号
    while (k < markerObjects.length) {        // 条件：全部のマーカーを見るまで
      const obj = markerObjects[k];

      if (obj.category === "popcorn") {
        obj.marker.setIcon({
          url: "cut.png",
          scaledSize: new google.maps.Size(popcornSize, popcornSize),
          anchor: new google.maps.Point(popcornSize / 2, popcornSize)   // 画像の下のまんなかを地点に合わせる
        });
      }
      k = k + 1;                              // 変化量：次のマーカーへ
    }
  }

  map.addListener("zoom_changed", updateMarkers);
  updateMarkers();
  return markerObjects;
}

// ==================================================
// ポップアップの中身（カード型のHTML）を組み立てる
// markers.js の施設に note を足すと、補足説明として表示される
// ==================================================
function makePopupHtml(point) {
  // カテゴリが分からないときのための予備の値
  const info = CATEGORY_INFO[point.category] || { emoji: "📍", label: "施設", color: "#666" };

  let noteHtml = "";
  if (point.note) {
    noteHtml = `<div class="popup-note">${point.note}</div>`;
  }

  // 色はカテゴリごとに変えたいので、style で直接指定している
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
