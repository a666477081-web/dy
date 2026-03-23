/* ════════════════════════════════════════
   MAP.JS — 地图点击监听与标注渲染
════════════════════════════════════════ */

let lMap = null;
let mkO  = {};

function initMap(){
  const m = L.map('map', { zoomControl:false, attributionControl:false }).setView([15,20], 2);
  L.control.zoom({ position:'bottomright' }).addTo(m);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);

  // 深色滤镜
  const applyDark = () => {
    const tp = document.querySelector('#map .leaflet-tile-pane');
    if(tp) tp.style.filter = 'invert(1) hue-rotate(195deg) brightness(0.82) saturate(0.65) contrast(0.92)';
  };
  m.on('load', applyDark);
  setTimeout(applyDark, 600);

  lMap = m;

  // 【核心】：监听地图点击
  m.on('click', e => {
    console.log("地图点击坐标:", e.latlng, "当前标注状态:", STATE.adding);
    
    if(!STATE.adding) return; // 如果没开标注模式，点击不触发弹窗

    STATE.addLL = e.latlng;
    STATE.adding = false; // 点击一次后自动关闭标注模式
    
    if(typeof buildHeader === 'function') buildHeader();
    
    // 触发 resources.js 里的弹窗函数
    if(typeof openAddForm === 'function'){
      openAddForm();
    }
  });

  if(STATE.resources.length > 0) renderMarkers();
}

function renderMarkers(){
  if(!lMap) return;
  Object.values(mkO).forEach(m => lMap.removeLayer(m));
  mkO = {};
  STATE.resources.forEach(r => {
    const mk = L.marker([r.lat, r.lng], { icon: mkIcon(r.cat, r.approved) }).addTo(lMap);
    mk.on('click', () => showDetail(r.id));
    mkO[r.id] = mk;
  });
}

function mkIcon(cat, approved){
  const col = (CATS[cat]||CATS.other).c;
  return L.divIcon({
    html: `<svg width="24" height="32" viewBox="0 0 24 32">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 8 12 20 12 20S24 20 24 12C24 5.37 18.63 0 12 0z" fill="${col}"/>
    </svg>`,
    className:'', iconAnchor:[12,32], iconSize:[24,32]
  });
}

function expStatus(){ return 'valid'; } // 简化版状态判断
