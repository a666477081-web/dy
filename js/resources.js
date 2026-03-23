/* ════════════════════════════════════════
   RESOURCES.JS — 资源管理与审核逻辑
════════════════════════════════════════ */

// 1. 同步云端数据
async function loadResourcesFromCloud() {
  const { data, error } = await sb.from('resources').select('*').order('created_at', { ascending: false });
  if (!error) {
    STATE.resources = data || [];
    renderMarkers(); renderList(); buildHeader();
  }
}

// 2. 审核逻辑 (这是您反馈没反应的地方)
function doApprove(id) {
  const r = STATE.resources.find(x => x.id === id);
  if (!r) return;
  
  // 弹出审核设置窗口
  const mbox = $('mbox');
  mbox.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">资源审核：${r.name}</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="u-flex-col u-gap-md" style="padding:15px;">
      <p style="font-size:12px; color:rgba(255,255,255,0.6)">请设置该资源的展示有效期，审核通过后将对所有成员可见。</p>
      <div>
        <label class="lbl">设置有效期</label>
        <select class="fi" id="exp-type">
          <option value="6m">6个月 (短期资源)</option>
          <option value="1y" selected>12个月 (长期资源)</option>
        </select>
      </div>
      <div class="u-flex u-gap-md" style="margin-top:10px">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-green" style="flex:2" onclick="saveApproval(${id})">✓ 审核通过并发布</button>
      </div>
    </div>
  `;
  $('mo').classList.add('show');
}

// 3. 将审核结果存入云端
async function saveApproval(id) {
  const expType = $('exp-type').value;
  // 这里计算日期逻辑可以根据您的 utils.js 来
  const { error } = await sb.from('resources')
    .update({ approved: true, expType: expType, approvedDate: new Date().toISOString() })
    .eq('id', id);

  if (!error) {
    alert("资源审核成功！");
    closeMo(); loadResourcesFromCloud();
  } else {
    alert("操作失败：" + error.message);
  }
}

// --- 以下保持 UI 渲染逻辑 ---
function renderList() {
  const el = $('rlist'); if (!el) return;
  const vis = STATE.resources;
  if($('cnt')) $('cnt').textContent = `共 ${vis.length} 条资源`;
  el.innerHTML = vis.map(r => `
    <div class="ri ${r.id === STATE.activeId ? 'sel' : ''}" onclick="showDetail(${r.id})">
      <div class="u-flex u-items-center u-gap-sm">
        <span class="dot" style="background:${(CATS[r.cat]||CATS.other).c}"></span>
        <span class="u-truncate" style="flex:1">${r.name}</span>
        ${!r.approved ? `<span class="badge-pend" onclick="event.stopPropagation();doApprove(${r.id})">审核</span>` : ''}
      </div>
    </div>
  `).join('');
}

function startAdd() { STATE.adding = !STATE.adding; buildHeader(); }
function closeMo() { $('mo').classList.remove('show'); }
function closeDp() { $('dp').classList.remove('open'); }
// ... (保留之前的 openAddForm, submitRes 等函数)
