/* ════════════════════════════════════════
   RESOURCES.JS — 云端同步与弹窗逻辑
════════════════════════════════════════ */

// 1. 从云端加载资源
async function loadResourcesFromCloud() {
  console.log("正在同步云端资源...");
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

// 2. 开启标注模式
function startAdd() {
  STATE.adding = !STATE.adding;
  if (STATE.adding) {
    alert("标注模式已开启：请在地图上【直接点击】您想要标注的位置");
  }
  buildHeader(); 
}

// 3. 弹出标注表单 (点击地图后触发)
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
      <div><label class="lbl">资源名称 *</label><input class="fi" id="fn" placeholder="请输入名称"></div>
      <div class="grid-2">
        <div><label class="lbl">资源类型 *</label>
          <select class="fi" id="fc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}</select>
        </div>
        <div><label class="lbl">具体地址</label><input class="fi" id="fa" placeholder="城市/区域/街道"></div>
      </div>
      <div><label class="lbl">描述/备注</label><textarea class="fi" id="fno" rows="3" placeholder="资源价值说明..."></textarea></div>
      <div class="grid-2">
        <div><label class="lbl">联系人</label><input class="fi" id="fcn"></div>
        <div><label class="lbl">联系电话</label><input class="fi" id="ftel"></div>
      </div>
      <div class="u-flex u-gap-md" style="margin-top:10px">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-primary" style="flex:2" onclick="submitRes()">提交审核</button>
      </div>
    </div>`;
  $('mo').classList.add('show');
}

// 4. 提交数据到 Supabase
async function submitRes(){
  const name = ($('fn').value||'').trim();
  if(!name){ alert('请填写资源名称'); return; }
  
  const btn = document.querySelector('.btn-primary');
  btn.disabled = true; btn.textContent = '正在上传云端...';

  const rData = {
    name: name,
    cat: $('fc').value,
    lat: STATE.addLL.lat,
    lng: STATE.addLL.lng,
    addr: ($('fa').value || '未知'),
    notes: ($('fno').value || ''),
    contact: { name:$('fcn').value, tel:$('ftel').value, email:'' },
    owner: STATE.cu ? STATE.cu.id : 'anonymous',
    approved: false,
    files: []
  };

  const { data, error } = await sb.from('resources').insert([rData]).select();

  if(!error && data){
    STATE.resources.push(data[0]);
    closeMo();
    renderMarkers();
    renderList();
    alert('提交成功！请等待管理员审核。');
  } else {
    alert("提交失败：" + error.message);
    btn.disabled = false; btn.textContent = '提交审核';
  }
}

// 侧边栏列表渲染
function renderList(){
  if(!$('rlist')) return;
  const vis = STATE.resources;
  $('rlist').innerHTML = vis.map(r => {
    const c = CATS[r.cat]||CATS.other;
    return `<div class="ri" onclick="showDetail(${r.id})">
      <div class="u-flex u-items-center u-gap-sm">
        <span style="width:7px;height:7px;border-radius:50%;background:${c.c}"></span>
        <span class="u-truncate" style="font-size:11px;color:#fff">${r.name}</span>
      </div>
    </div>`;
  }).join('');
}

function closeMo(){ $('mo').classList.remove('show'); }
