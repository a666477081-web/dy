/* ════════════════════════════════════════
   RESOURCES.JS — 云端同步与 UI 逻辑 (全量修复版)
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

/**
 * 1. 加载云端数据
 */
async function loadResourcesFromCloud() {
  console.log("正在尝试从 Supabase 同步数据...");
  try {
    const { data, error } = await sb
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    STATE.resources = data || [];
    console.log("同步成功，资源数量:", STATE.resources.length);

    // 成功后，刷新所有界面组件
    if (typeof renderMarkers === 'function') renderMarkers();
    renderList();
    renderChips();
    if (typeof buildHeader === 'function') buildHeader();
  } catch (err) {
    console.error("云端同步失败:", err.message);
    if ($('cnt')) $('cnt').textContent = "同步失败，请刷新重试";
  }
}

/**
 * 2. 渲染左侧资源列表
 */
function renderList() {
  const el = $('rlist');
  if (!el) return; // 安全检查：如果找不到容器，直接停止执行，不报错

  const resources = filtRes(); // 获取筛选后的列表
  
  if ($('cnt')) $('cnt').textContent = `共 ${resources.length} 条资源`;

  if (resources.length === 0) {
    el.innerHTML = '<div style="padding:20px; color:rgba(255,255,255,0.4); text-align:center; font-size:11px;">暂无匹配资源</div>';
    return;
  }

  el.innerHTML = resources.map(r => {
    const c = CATS[r.cat] || CATS.other;
    const isSel = r.id === STATE.activeId ? 'sel' : '';
    return `
      <div class="ri ${isSel}" onclick="showDetail(${r.id})" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:7px; height:7px; border-radius:50%; background:${c.c}"></span>
          <span style="color:#fff; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.name || '未命名资源'}</span>
        </div>
        <div style="color:rgba(255,255,255,0.4); font-size:10px; padding-left:15px; margin-top:3px;">${r.addr || '无地址信息'}</div>
      </div>`;
  }).join('');
}

/**
 * 3. 渲染分类筛选按钮 (Chips)
 */
function renderChips() {
  const el = $('chips-wrap');
  if (!el) return;

  el.innerHTML = Object.entries(CATS).map(([k, v]) => {
    const isOn = STATE.filterCats.has(k);
    return `
      <button class="chip" 
        onclick="toggleCat('${k}')" 
        style="padding:4px 10px; border-radius:12px; border:1px solid ${v.c}; font-size:10px; cursor:pointer; 
        background:${isOn ? v.c : 'transparent'}; 
        color:${isOn ? '#111' : v.c}; margin-bottom:5px;">
        ${v.l}
      </button>`;
  }).join('');
}

/**
 * 4. 详情面板 (右侧弹出的面板)
 */
function showDetail(id) {
  STATE.activeId = id;
  renderList(); // 刷新选中状态
  
  const r = STATE.resources.find(x => x.id === id);
  if (!r) return;
  const c = CATS[r.cat] || CATS.other;

  const dp = $('dp');
  const dpc = $('dpc');
  if (!dp || !dpc) return;

  dpc.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; justify-content:between; align-items:center; margin-bottom:15px;">
        <span style="background:${v.c}22; color:${v.c}; padding:2px 8px; border-radius:4px; font-size:11px;">${c.l}</span>
        <button onclick="closeDp()" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">×</button>
      </div>
      <h3 style="color:#fff; margin-bottom:5px;">${r.name}</h3>
      <p style="color:rgba(255,255,255,0.6); font-size:12px;">📍 ${r.addr || '暂无地址'}</p>
      <hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
      <div style="color:rgba(255,255,255,0.8); font-size:13px; line-height:1.6;">${r.notes || '暂无描述信息'}</div>
      <div style="margin-top:20px; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
        <div style="font-size:11px; color:rgba(255,255,255,0.4); margin-bottom:5px;">联系信息</div>
        <div style="color:#fff; font-size:12px;">姓名：${r.contact?.name || '—'}</div>
        <div style="color:#fff; font-size:12px;">电话：${r.contact?.tel || '—'}</div>
      </div>
      <button onclick="flyTo(${r.id})" class="btn btn-amber" style="width:100%; margin-top:20px; padding:10px;">地图定位</button>
    </div>
  `;
  dp.classList.add('open');
}

/**
 * 5. 提交资源到 Supabase
 */
async function submitRes() {
  const name = ($('fn').value || '').trim();
  if (!name) return alert('请填写资源名称');

  const btn = document.querySelector('.btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '正在保存...'; }

  const rData = {
    name: name,
    cat: $('fc').value,
    lat: STATE.addLL.lat,
    lng: STATE.addLL.lng,
    addr: ($('fa').value || ''),
    notes: ($('fno').value || ''),
    contact: { name: $('fcn').value, tel: $('ftel').value },
    owner: STATE.cu ? STATE.cu.id : null,
    approved: false
  };

  try {
    const { data, error } = await sb.from('resources').insert([rData]).select();
    if (error) throw error;
    
    alert('提交成功！请等待管理员审核。');
    closeMo();
    loadResourcesFromCloud(); // 重新拉取最新数据
  } catch (err) {
    alert("提交失败: " + err.message);
    if (btn) { btn.disabled = false; btn.textContent = '确认提交'; }
  }
}

/**
 * 6. 辅助功能 (过滤、切换、开关)
 */
function filtRes() {
  if (!STATE.resources) return [];
  const q = ($('sinp') && $('sinp').value || '').toLowerCase();
  return STATE.resources.filter(r => 
    (!q || (r.name && r.name.toLowerCase().includes(q))) && 
    (STATE.filterCats.size === 0 || STATE.filterCats.has(r.cat))
  );
}

function toggleCat(k) {
  STATE.filterCats.has(k) ? STATE.filterCats.delete(k) : STATE.filterCats.add(k);
  renderChips();
  renderList();
}

function startAdd() {
  STATE.adding = !STATE.adding;
  if (STATE.adding) alert("标注模式已开启：请在地图上点击位置进行标注");
  if (typeof buildHeader === 'function') buildHeader();
}

function closeDp() { 
  const dp = $('dp');
  if (dp) dp.classList.remove('open'); 
  STATE.activeId = null; 
  renderList(); 
}

function closeMo() { 
  const mo = $('mo');
  if (mo) mo.classList.remove('show'); 
}

// 打开添加表单
function openAddForm() {
  const mbox = $('mbox');
  if (!mbox) return;
  mbox.innerHTML = `
    <div style="padding:20px;">
      <h3 style="color:#fff; margin-bottom:15px;">标注新资源</h3>
      <div style="background:rgba(245,158,11,0.1); color:#f59e0b; padding:8px; border-radius:4px; font-size:11px; margin-bottom:15px;">
        📍 坐标：${STATE.addLL.lat.toFixed(4)}, ${STATE.addLL.lng.toFixed(4)}
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">资源名称 *</label><input class="fi" id="fn" style="width:100%"></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">分类</label>
            <select class="fi" id="fc" style="width:100%">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}</select>
          </div>
          <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">地址</label><input class="fi" id="fa" style="width:100%"></div>
        </div>
        <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">备注</label><textarea class="fi" id="fno" rows="3" style="width:100%"></textarea></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">联系人</label><input class="fi" id="fcn" style="width:100%"></div>
          <div><label style="color:gray; font-size:11px; display:block; margin-bottom:4px;">联系电话</label><input class="fi" id="ftel" style="width:100%"></div>
        </div>
      </div>
      <div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-primary" style="flex:2" onclick="submitRes()">确认提交</button>
      </div>
    </div>
  `;
  if ($('mo')) $('mo').classList.add('show');
}
