/* ════════════════════════════════════════
   MAP.JS — Leaflet Map & Markers
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

let lMap = null;
let mkO  = {};

function initMap(){
  const m = L.map('map', { zoomControl:false, attributionControl:false }).setView([15,20], 2);
  L.control.zoom({ position:'bottomright' }).addTo(m);

  /* OpenStreetMap — globally accessible including mainland China, no API key required */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(m);

  /* Apply dark CSS filter to match the dark UI theme */
  const applyDark = () => {
    const tp = document.querySelector('#map .leaflet-tile-pane');
    if(tp) tp.style.filter = 'invert(1) hue-rotate(195deg) brightness(0.82) saturate(0.65) contrast(0.92)';
  };
  m.on('load', applyDark);
  setTimeout(applyDark, 600);

  lMap = m;
  renderMarkers();

  /* Click handler for adding new resource */
  m.on('click', e => {
    if(!STATE.adding) return;
    STATE.addLL = e.latlng;
    STATE.adding = false;
    buildHeader();
    openAddForm();
  });

  setTimeout(() => m.invalidateSize(), 250);
}

function renderMarkers(){
  if(!lMap) return;
  Object.values(mkO).forEach(m => lMap.removeLayer(m));
  mkO = {};
  STATE.resources.forEach(r => {
    const mk = L.marker([r.lat, r.lng], { icon: mkIcon(r.cat, r.approved, expStatus(r.expDate)) }).addTo(lMap);
    mk.on('click', () => showDetail(r.id));
    mkO[r.id] = mk;
  });
}

function mkIcon(cat, approved, st){
  const base = (CATS[cat]||CATS.other).c;
  const col  = !approved ? '#6b7280' : st==='expired' ? '#ef4444' : st==='warn' ? '#f59e0b' : base;
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 8 12 20 12 20S24 20 24 12C24 5.37 18.63 0 12 0z" fill="${col}" opacity="${approved?0.95:0.45}"/>
      <circle cx="12" cy="12" r="4.5" fill="rgba(0,0,0,.32)"/>
    </svg>`,
    className:'', iconAnchor:[12,32], popupAnchor:[0,-32], iconSize:[24,32]
  });
}

function flyTo(id){
  const r = STATE.resources.find(x=>x.id===id);
  if(r && lMap) lMap.flyTo([r.lat, r.lng], 7, { duration:1.3 });
}
