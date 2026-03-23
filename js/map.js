/* ════════════════════════════════════════
   MAP.JS — Leaflet Map & Markers (云端同步版)
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

let lMap = null;
let mkO  = {}; // 用于存储地图上的标注对象，方便清除和重绘

/**
 * 初始化地图
 */
function initMap(){
  // 创建地图实例，默认中心点
  const m = L.map('map', { zoomControl:false, attributionControl:false }).setView([15,20], 2);
  L.control.zoom({ position:'bottomright' }).addTo(m);

  /* 加载 OpenStreetMap 瓦片 */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(m);

  /* 深色主题滤镜 */
  const applyDark = () => {
    const tp = document.querySelector('#map .leaflet-tile-pane');
    if(tp) tp.style.filter = 'invert(1) hue-rotate(195deg) brightness(0.82) saturate(0.65) contrast(0.92)';
  };
  m.on('load', applyDark);
  setTimeout(applyDark, 600);

  lMap = m;

  // 【优化】：如果此时云端数据已经加载好了，直接渲染标注
  if(STATE.resources && STATE.resources.length > 0){
    renderMarkers();
  }

  /* 点击地图：处理新增资源模式 */
  m.on('click', e => {
    if(!STATE.adding) return;
    STATE.addLL = e.latlng;
    STATE.adding = false;
    
    // 调用 UI 刷新函数
    if(typeof buildHeader === 'function') buildHeader();
    if(typeof openAddForm === 'function') openAddForm();
  });

  setTimeout(() => m.invalidateSize(), 250);
}

/**
 * 核心渲染函数：根据 STATE.resources 绘制所有地图标注
 */
function renderMarkers(){
  if(!lMap) return;

  // 1. 先清除地图上现有的所有旧标注，防止重复叠加
  Object.values(mkO).forEach(m => lMap.removeLayer(m));
  mkO = {};

  // 2. 如果当前没有资源数据，直接返回
  if(!STATE.resources || STATE.resources.length === 0) return;

  // 3. 循环资源数组，逐个创建标注
  STATE.resources.forEach(r => {
    // 安全检查：确保经纬度存在
    if(!r.lat || !r.lng) return;

    // 创建标注并添加到地图
    const mk = L.marker([r.lat, r.lng], { 
      icon: mkIcon(r.cat, r.approved, expStatus(r.expDate)) 
    }).addTo(lMap);

    // 绑定点击事件：点击小图标弹出详情面板
    mk.on('click', () => {
      if(typeof showDetail === 'function') showDetail(r.id);
    });

    // 将标注对象存入缓存，ID 为数据库中的真实 ID
    mkO[r.id] = mk;
  });
}

/**
 * 生成自定义图标 (SVG 格式)
 */
function mkIcon(cat, approved, st){
  const base = (CATS[cat]||CATS.other).c;
  // 状态颜色：待审灰色，过期红色，预警橙色，正常则使用分类色
  const col  = !approved ? '#6b7280' : st==='expired' ? '#ef4444' : st==='warn' ? '#f59e0b' : base;
  
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 8 12 20 12 20S24 20 24 12C24 5.37 18.63 0 12 0z" fill="${col}" opacity="${approved?0.95:0.45}"/>
      <circle cx="12" cy="12" r="4.5" fill="rgba(0,0,0,.32)"/>
    </svg>`,
    className:'', iconAnchor:[12,32], popupAnchor:[0,-32], iconSize:[24,32]
  });
}

/**
 * 地图飞行：平滑移动到指定资源位置
 */
function flyTo(id){
  const r = STATE.resources.find(x=>x.id===id);
  if(r && lMap){
    // 缩放级别设为 8，飞行时间 1.3 秒
    lMap.flyTo([r.lat, r.lng], 8, { duration:1.3 });
  }
}
