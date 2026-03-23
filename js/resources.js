/* ════════════════════════════════════════
   RESOURCES.JS — 资源逻辑与详情面板 (完整版)
════════════════════════════════════════ */

// 加载云端数据
async function loadResourcesFromCloud() {
  const { data, error } = await sb.from('resources').select('*').order('created_at', { ascending: false });
  if (error) return console.error(error);
  
  STATE.resources = data || [];
  renderMarkers(); // 刷新地图点
  renderList();    // 刷新侧边栏
  buildHeader();   // 刷新顶部统计
}

// 侧边栏列表渲染
function renderList() {
  const el = $('rlist');
  if (!el) return;
  const vis = filtRes();
  if ($('cnt')) $('cnt').textContent = `共 ${vis.length} 条资源`;
  
  el.innerHTML = vis.map(r => {
    const c = CATS[r.cat] || CATS.other;
    return `
      <div class="ri ${r.id === STATE.activeId ? 'sel' : ''}" onclick="showDetail(${r.id})">
        <div class="u-flex u-items-center u-gap-sm">
          <span class="dot" style="background:${c.c}"></span>
          <span class="u-truncate" style="flex:1">${r.name}</span>
          ${!r.approved ? '<span class="badge badge-pend">待审</span>' : ''}
        </div>
        <div class="ri-addr">${r.addr || ''}</div>
      </div>`;
  }).join('') || '<div class="empty-hint">暂无匹配资源</div>';
}

// 详情面板渲染 (这是点击地图点后弹出的右侧面板)
function showDetail(id) {
  STATE.activeId = id;
  renderList();
  const r = STATE.resources.find(x => x.id === id);
  if (!r) return;
  const c = CATS[r.cat] || CATS.other;

  $('dpc').innerHTML = `
    <div class="dp-header">
      <span class="dp-cat" style="background:${c.b};color:${c.c}">${c.l}</span>
      <button class="dp-close" onclick="closeDp()">×</button>
    </div>
    <h3 class="dp-title">${r.name}</h3>
    <p class="dp-addr">📍 ${r.addr}</p>
    <div class="dp-section">
      <div class="dp-label">资源描述</div>
      <div class="dp-notes">${r.notes || '暂无详细描述'}</div>
    </div>
    <div class="dp-section">
      <div class="dp-label">联系信息</div>
      <div class="dp-contact">姓名：${r.contact?.name || '—'}<br>电话：${r.contact?.tel || '—'}</div>
    </div>
    <div class="u-flex u-gap-sm" style="margin-top:20px">
      <button onclick="flyTo(${r.id})" class="btn btn-amber" style="flex:1">地图定位</button>
    </div>
  `;
  $('dp').classList.add('open');
}

// 分类芯片过滤
function renderChips() {
  const el = $('chips-wrap');
  if (!el) return;
  el.innerHTML = Object.entries(CATS).map(([k, v]) => {
    const on = STATE.filterCats.has(k);
    return `<button class="chip" style="${on ? `background:${v.c};color:#111` : ''}" onclick="toggleCat('${k}')">${v.l}</button>`;
  }).join('');
}

// 基础功能函数
function toggleCat(k) { 
  STATE.filterCats.has(k) ? STATE.filterCats.delete(k) : STATE.filterCats.add(k); 
  renderChips(); renderList(); 
}
function filtRes() {
  const q = ($('sinp') && $('sinp').value || '').toLowerCase();
  return STATE.resources.filter(r => (!q || r.name.toLowerCase().includes(q)) && (STATE.filterCats.size === 0 || STATE.filterCats.has(r.cat)));
}
function startAdd() { STATE.adding = !STATE.adding; if(STATE.adding) alert("标注模式已开启：请点击地图位置"); buildHeader(); }
function closeDp() { $('dp').classList.remove('open'); STATE.activeId = null; renderList(); }
function closeMo() { $('mo').classList.remove('show'); }

// 提交新资源表单逻辑 (保持不变)
function openAddForm() {
  STATE.pendFiles = [];
  $('mbox').innerHTML = `
    <div class="modal-header"><h3 class="modal-title">标注新资源</h3><button class="modal-close" onclick="closeMo()">×</button></div>
    <div class="u-flex-col u-gap-md" style="margin-top:10px">
      <div><label class="lbl">资源名称 *</label><input class="fi" id="fn" placeholder="输入名称"></div>
      <div class="grid-2">
        <div><label class="lbl">类型 *</label><select class="fi" id="fc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}</select></div>
        <div><label class="lbl">地址</label><input class="fi" id="fa" placeholder="城市/区域"></div>
      </div>
      <div><label class="lbl">备注</label><textarea class="fi" id="fno" rows="3"></textarea></div>
      <div class="u-flex u-gap-md"><button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button><button class="btn btn-primary" style="flex:2" onclick="submitRes()">确认提交</button></div>
    </div>`;
  $('mo').classList.add('show');
}

async function submitRes() {
  const name = ($('fn').value||'').trim(); if(!name) return alert('必填');
  const rData = { name, cat:$('fc').value, lat:STATE.addLL.lat, lng:STATE.addLL.lng, addr:$('fa').value, notes:$('fno').value, owner:STATE.cu.id, approved:false };
  const { data, error } = await sb.from('resources').insert([rData]).select();
  if(!error) { loadResourcesFromCloud(); closeMo(); alert('提交成功，待审核'); }
}
