/* ════════════════════════════════════════
    RESOURCES.JS — Supabase 云端同步版
    Resource Atlas | DYFTZ
════════════════════════════════════════ */

// 【新增】启动时从云端加载所有资源
async function loadResourcesFromCloud() {
  console.log("正在从 Supabase 同步资源数据...");
  const { data, error } = await sb
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("加载资源失败:", error.message);
    return;
  }

  // 将云端数据同步到本地状态机
  STATE.resources = data || [];
  
  // 刷新界面
  renderMarkers(); 
  renderList();
  buildHeader();
}

/* ── Sidebar List ── */
function filtRes(){
  const q = ($('sinp')&&$('sinp').value||'').toLowerCase();
  return STATE.resources.filter(r =>
    (!q || r.name.toLowerCase().includes(q) || (CATS[r.cat]&&CATS[r.cat].l.includes(q))) &&
    (STATE.filterCats.size===0 || STATE.filterCats.has(r.cat))
  );
}

function renderChips(){
  if(!$('chips-wrap')) return;
  $('chips-wrap').innerHTML = Object.entries(CATS).map(([k,v])=>{
    const on = STATE.filterCats.has(k);
    return `<button class="chip" style="${on?`background:${v.c};color:#111;border-color:${v.c};font-weight:700`:''}" onclick="toggleCat('${k}')">${v.l}</button>`;
  }).join('');
}

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
        ${!r.approved ? `<span class="badge badge-pend">待审</span>` : st==='expired' ? `<span class="badge badge-exp">过期</span>` : st==='warn' ? `<span class="badge badge-warn">到期</span>` : ''}
      </div>
      <div class="u-truncate" style="font-size:10px;color:var(--text-faint);padding-left:12px">${r.addr}</div>
    </div>`;
  }).join('') || `<div style="padding:24px;text-align:center;font-size:11px;color:var(--text-faint)">暂无匹配资源</div>`;
}

function toggleCat(k){ STATE.filterCats.has(k)?STATE.filterCats.delete(k):STATE.filterCats.add(k); renderChips(); renderList(); }

/* ── Detail Panel ── */
function showDetail(id){
  STATE.activeId = id; renderList();
  const r  = STATE.resources.find(x=>x.id===id); if(!r) return;
  const c  = CATS[r.cat]||CATS.other;
  const see = canSeeContact(r);
  const ow  = STATE.users ? STATE.users.find(u=>u.id===r.owner) : null;
  const st  = expStatus(r.expDate);

  const expBadge = r.approved && r.expDate
    ? `<span class="badge ${st==='expired'?'badge-exp':st==='warn'?'badge-warn':'badge-valid'}">${expLabel(r.expDate)}</span>` : '';

  const admBar = STATE.cu&&STATE.cu.role==='admin' ? `
    <div class="u-flex u-gap-sm" style="margin-bottom:13px;flex-wrap:wrap">
      <button onclick="doApprove(${r.id})" class="btn ${r.approved?'btn-amber':'btn-green'}" style="flex:1;padding:7px 10px">
        ${r.approved ? '撤销审核' : '✓ 审核通过'}
      </button>
      <button onclick="doDelete(${r.id})" class="btn btn-red" style="padding:7px 13px">删除资源</button>
    </div>` : '';

  const ctHtml = see
    ? `<div class="card-surface" style="margin-bottom:13px">
        <div class="dp-section-label">联系信息 · 授权可见</div>
        ${[['联系人',r.contact?.name],['邮箱',r.contact?.email],['电话',r.contact?.tel]].map(([k,v])=>
          `<div class="dp-contact-row"><span class="dp-contact-key">${k}</span><span class="dp-contact-val">${v||'—'}</span></div>`
        ).join('')}
      </div>`
    : `<div style="border:1.5px dashed rgba(255,255,255,.12);border-radius:var(--radius-md);padding:13px;margin-bottom:13px;text-align:center">
        <div style="font-size:12px;color:var(--text-faint)">🔒 联系方式仅 VIP / 资源上传者 / 管理员可见</div>
      </div>`;

  const fHtml = r.files&&r.files.length
    ? r.files.map(f=>`
        <div class="dp-file-row">
          <span class="dp-file-name ${see?'':'locked'}">📎 ${f.n}</span>
          <div class="u-flex u-items-center u-gap-sm">
            <span class="dp-file-size">${f.sz}MB</span>
            ${see
              ? `<button class="btn btn-blue" style="padding:2px 9px;font-size:9px" onclick="alert('附件功能正在对接云存储...')">下载</button>`
              : `<span style="font-size:9px;color:var(--text-faint)">🔒 VIP+</span>`}
          </div>
        </div>`).join('')
    : `<div style="font-size:11px;color:var(--text-faint)">暂无附件</div>`;

  $('dpc').innerHTML = `
    <div class="u-flex u-items-center u-justify-between" style="margin-bottom:13px">
      <span class="dp-cat-badge" style="background:${c.b};color:${c.c};border-color:${c.c}44">${c.l}</span>
      <button class="dp-close" onclick="closeDp()">×</button>
    </div>
    ${!r.approved ? `<div class="card-amber" style="padding:7px 11px;border-radius:var(--radius-sm);margin-bottom:11px;font-size:11px;color:var(--gold-light);font-weight:500">⏳ 待管理员审核，暂不对外展示</div>` : ''}
    <div class="u-flex u-justify-between u-items-start u-gap-sm" style="margin-bottom:5px">
      <h3 class="dp-title">${r.name}</h3>${expBadge}
    </div>
    <p class="dp-addr" style="margin-bottom:3px">📍 ${r.addr}</p>
    <p class="dp-notes" style="margin-bottom:14px">${r.notes}</p>
    ${ctHtml}
    <div style="margin-bottom:13px">
      <div class="dp-section-label">附件资料</div>
      ${fHtml}
    </div>
    <div class="u-flex u-gap-sm" style="margin-top:11px">
      <button onclick="flyTo(${r.id})" class="btn btn-amber" style="flex:1;padding:9px 10px;font-size:11px">🗺 地图定位</button>
      <button onclick="openAIMatch('${r.name.replace(/'/g,'')}')" class="btn btn-ai" style="flex:1;padding:9px 10px;font-size:11px">✦ AI 匹配</button>
    </div>`;
  $('dp').classList.add('open');
}

function closeDp(){ $('dp').classList.remove('open'); STATE.activeId=null; renderList(); }

/* ── Approve (同步至云端) ── */
async function confirmApprove(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  const t = $('exp-type').value;
  const expD = calcExp(today(),t);

  // 【核心同步】：在云端更新审核状态
  const { error } = await sb
    .from('resources')
    .update({ approved: true, approvedDate: today(), expType: t, expDate: expD })
    .eq('id', id);

  if(!error){
    r.approved=true; r.approvedDate=today(); r.expType=t; r.expDate=expD;
    closeMo(); renderMarkers(); showDetail(id); renderList();
  } else {
    alert("操作失败：" + error.message);
  }
}

/* ── Delete (同步至云端) ── */
async function confirmDelete(id){
  // 【核心同步】：在云端删除
  const { error } = await sb
    .from('resources')
    .delete()
    .eq('id', id);

  if(!error){
    STATE.resources=STATE.resources.filter(x=>x.id!==id);
    closeMo(); closeDp(); renderMarkers(); renderList();
  } else {
    alert("删除失败：" + error.message);
  }
}

/* ── Add Resource (同步至云端) ── */
async function submitRes(){
  const name=($('fn').value||'').trim(); if(!name){ alert('请填写资源名称'); return; }
  
  // 1. 构造数据对象
  const rData = {
    name, 
    cat: $('fc').value, 
    lat: STATE.addLL.lat, 
    lng: STATE.addLL.lng,
    addr: ($('fa').value||`${STATE.addLL.lat.toFixed(2)}, ${STATE.addLL.lng.toFixed(2)}`),
    contact: { name:$('fcn').value, email:$('fem').value, tel:$('ftel').value },
    notes: $('fno').value||'（暂无备注）', 
    files: [...STATE.pendFiles],
    owner: STATE.cu.id, 
    approved: false, 
    expType: CATS[$('fc').value]?.defExp||'6m'
  };

  // 2. 【核心同步】：插入到 Supabase 云端
  const { data, error } = await sb
    .from('resources')
    .insert([rData])
    .select();

  if(!error && data){
    STATE.resources.push(data[0]); // 将云端返回的带 ID 的数据存入本地
    closeMo(); renderMarkers(); renderList();
    if(lMap) lMap.flyTo([rData.lat, rData.lng], 6, { duration:1.2 });
    setTimeout(()=>showDetail(data[0].id), 1300);
  } else {
    alert("提交失败：" + (error?.message || "未知错误"));
  }
}

// 保持其他 UI 函数不变...
function startAdd(){ STATE.adding=!STATE.adding; buildHeader(); }
function openAddForm(){ /* ... 保持原有代码不变 ... */ }
function simUpload(){ /* ... 保持原有代码不变 ... */ }
function renderUplFiles(){ /* ... 保持原有代码不变 ... */ }
function rmFile(i){ STATE.pendFiles.splice(i,1); renderUplFiles(); }
function closeMo(){ $('mo').classList.remove('show'); }
