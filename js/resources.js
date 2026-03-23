/* ════════════════════════════════════════
   RESOURCES.JS — 云端同步 + UI 弹窗完整版
════════════════════════════════════════ */

// 1. 从云端加载资源
async function loadResourcesFromCloud() {
  const { data, error } = await sb
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("加载资源失败:", error.message);
    return;
  }
  STATE.resources = data || [];
  renderMarkers(); 
  renderList();
  if(typeof buildHeader === 'function') buildHeader();
}

// 2. 侧边栏列表渲染
function renderList(){
  if(!$('rlist')) return;
  const vis = filtRes();
  if($('cnt')) $('cnt').textContent = `共 ${vis.length} 条资源`;
  $('rlist').innerHTML = vis.map(r => {
    const c  = CATS[r.cat]||CATS.other;
    const st = expStatus(r.expDate);
    const dot = !r.approved ? '#6b7280' : st==='expired' ? '#ef4444' : st==='warn' ? '#f59e0b' : c.c;
    return `<div class="ri${r.id===STATE.activeId?' sel':''}" onclick="showDetail(${r.id})">
      <div class="u-flex u-items-center u-gap-sm" style="margin-bottom:2px">
        <span style="width:7px;height:7px;border-radius:50%;background:${dot};flex-shrink:0;opacity:${r.approved?1:.45}"></span>
        <span class="u-truncate" style="font-size:11px;color:rgba(255,255,255,${r.approved?'.82':'.38'});font-weight:500;flex:1">${r.name}</span>
      </div>
    </div>`;
  }).join('') || `<div style="padding:24px;text-align:center;color:var(--text-faint)">暂无匹配资源</div>`;
}

function filtRes(){
  const q = ($('sinp')&&$('sinp').value||'').toLowerCase();
  return STATE.resources.filter(r => (!q || r.name.toLowerCase().includes(q)));
}

// 3. 提交新资源到 Supabase
async function submitRes(){
  const name=($('fn').value||'').trim(); 
  if(!name){ alert('请填写资源名称'); return; }
  
  const btn = document.querySelector('.btn-primary');
  btn.disabled = true; btn.textContent = '正在上传云端...';

  const rData = {
    name, 
    cat: $('fc').value, 
    lat: STATE.addLL.lat, 
    lng: STATE.addLL.lng,
    addr: ($('fa').value || '未知地址'),
    contact: { name:$('fcn').value, email:$('fem').value, tel:$('ftel').value },
    notes: $('fno').value || '', 
    files: STATE.pendFiles || [],
    owner: STATE.cu ? STATE.cu.id : 'anonymous', 
    approved: false
  };

  const { data, error } = await sb.from('resources').insert([rData]).select();

  if(!error && data){
    STATE.resources.push(data[0]);
    closeMo(); 
    renderMarkers(); 
    renderList();
    alert('提交成功！请等待管理员审核。');
  } else {
    alert("提交失败：" + (error?.message || "网络错误"));
    btn.disabled = false; btn.textContent = '提交申请';
  }
}

// 4. 打开添加表单 (这是您现在点击没反应的关键！)
function openAddForm(){
  STATE.pendFiles = [];
  $('mbox').innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">标注新资源</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="card-amber" style="padding:7px 11px;margin-bottom:12px;font-size:11px;color:var(--gold-light)">
      📍 坐标：${STATE.addLL.lat.toFixed(4)}, ${STATE.addLL.lng.toFixed(4)}
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">资源名称 *</label><input class="fi" id="fn" placeholder="输入名称"></div>
      <div class="grid-2">
        <div><label class="lbl">资源类型 *</label>
          <select class="fi" id="fc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}</select>
        </div>
        <div><label class="lbl">具体地址</label><input class="fi" id="fa" placeholder="城市/区域"></div>
      </div>
      <div><label class="lbl">描述/备注</label><textarea class="fi" id="fno" rows="3"></textarea></div>
      <div class="grid-2">
        <div><label class="lbl">联系人</label><input class="fi" id="fcn"></div>
        <div><label class="lbl">联系电话</label><input class="fi" id="ftel"></div>
      </div>
      <div class="u-flex u-gap-md" style="margin-top:10px">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-primary" style="flex:2" onclick="submitRes()">提交申请</button>
      </div>
    </div>`;
  $('mo').classList.add('show');
}

// 5. 辅助函数
function startAdd(){ 
  STATE.adding = !STATE.adding; 
  if(STATE.adding) alert('请在地图上点击位置进行标注');
  buildHeader(); 
}
function closeMo(){ $('mo').classList.remove('show'); }
function closeDp(){ $('dp').classList.remove('open'); }
