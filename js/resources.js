/* ════════════════════════════════════════
   RESOURCES.JS — Resource List · Detail · Add · Approve · Delete
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

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
  const ow  = STATE.users.find(u=>u.id===r.owner);
  const st  = expStatus(r.expDate);

  const expBadge = r.approved && r.expDate
    ? `<span class="badge ${st==='expired'?'badge-exp':st==='warn'?'badge-warn':'badge-valid'}">${expLabel(r.expDate)}</span>` : '';

  const admBar = STATE.cu&&STATE.cu.role==='admin' ? `
    <div class="u-flex u-gap-sm" style="margin-bottom:13px;flex-wrap:wrap">
      <button onclick="doApprove(${r.id})" class="btn ${r.approved?'btn-amber':'btn-green'}" style="flex:1;padding:7px 10px">
        ${r.approved ? '撤销审核' : '✓ 审核通过'}
      </button>
      <button onclick="doDelete(${r.id})" class="btn btn-red" style="padding:7px 13px">删除资源</button>
      ${r.approved&&st==='expired' ? `<button onclick="openReReview(${r.id})" class="btn btn-blue" style="padding:7px 13px">重新审核</button>` : ''}
    </div>` : '';

  const ctHtml = see
    ? `<div class="card-surface" style="margin-bottom:13px">
        <div class="dp-section-label">联系信息 · 授权可见</div>
        ${[['联系人',r.contact.name],['邮箱',r.contact.email],['电话',r.contact.tel]].map(([k,v])=>
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
              ? `<button class="btn btn-blue" style="padding:2px 9px;font-size:9px" onclick="alert('正式部署后从云存储下载')">下载</button>`
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
    ${r.approved&&st==='expired' ? `<div class="card-red" style="padding:7px 11px;border-radius:var(--radius-sm);margin-bottom:11px;font-size:11px;color:var(--red-light);font-weight:500">⚠ 此资源已超过有效期，请管理员处理</div>` : ''}
    ${admBar}
    <div class="u-flex u-justify-between u-items-start u-gap-sm" style="margin-bottom:5px">
      <h3 class="dp-title">${r.name}</h3>${expBadge}
    </div>
    <p class="dp-addr" style="margin-bottom:3px">📍 ${r.addr}</p>
    ${r.expDate ? `<p class="dp-expiry" style="margin-bottom:12px">有效期至 ${r.expDate} · ${r.expType==='1y'?'年度审核':'半年审核'}</p>` : '<div style="margin-bottom:12px"></div>'}
    <p class="dp-notes" style="margin-bottom:14px">${r.notes}</p>
    ${ctHtml}
    <div style="margin-bottom:13px">
      <div class="dp-section-label">附件资料（文件名所有人可见 · 下载需 VIP 权限）</div>
      ${fHtml}
    </div>
    ${ow ? `<div class="dp-owner-note">上传者：${ow.name}</div>` : ''}
    <div class="u-flex u-gap-sm" style="margin-top:11px">
      <button onclick="flyTo(${r.id})" class="btn btn-amber" style="flex:1;padding:9px 10px;font-size:11px">🗺 地图定位</button>
      <button onclick="openAIMatch('${r.name.replace(/'/g,'')}')" class="btn btn-ai" style="flex:1;padding:9px 10px;font-size:11px">✦ AI 匹配</button>
    </div>`;
  $('dp').classList.add('open');
}

function closeDp(){ $('dp').classList.remove('open'); STATE.activeId=null; renderList(); }

/* ── Approve ── */
function doApprove(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  if(r.approved){ r.approved=false; r.approvedDate=null; r.expDate=null; renderMarkers(); showDetail(id); renderList(); return; }
  openApproveModal(id);
}
function openApproveModal(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  const def = CATS[r.cat]?.defExp||'6m';
  $('mbox').innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">审核通过 · 设置有效期</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="card-surface" style="margin-bottom:14px;font-size:12px;color:rgba(255,255,255,.7)">
      资源：<strong style="color:#fff">${r.name}</strong><br>
      <span style="font-size:10px;color:var(--text-muted)">类型：${CATS[r.cat]?.l||r.cat} · 默认：${def==='1y'?'一年':'六个月'}</span>
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">有效期设置</label>
        <select class="fi" id="exp-type">
          <option value="6m"${def==='6m'?' selected':''}>六个月（人脉、媒体、供应链类）</option>
          <option value="1y"${def==='1y'?' selected':''}>一年（公共事务、商贸、空间资产类）</option>
        </select>
      </div>
      <div class="card-amber" id="exp-preview" style="font-size:11px;color:var(--gold-light);padding:9px 11px;border-radius:var(--radius-sm)"></div>
      <div class="u-flex u-gap-md" style="margin-top:4px">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-green" style="flex:2;font-size:12px;padding:10px" onclick="confirmApprove(${id})">✓ 确认审核通过</button>
      </div>
    </div>`;
  $('mo').classList.add('show');
  const upd = () => { const t=$('exp-type').value, d=calcExp(today(),t); $('exp-preview').textContent=`有效期至 ${d}（到期前 30 天系统将提醒重新审核）`; };
  $('exp-type').addEventListener('change', upd); upd();
}
function confirmApprove(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  const t = $('exp-type').value;
  r.approved=true; r.approvedDate=today(); r.expType=t; r.expDate=calcExp(today(),t);
  closeMo(); renderMarkers(); showDetail(id); renderList(); buildHeader();
}
function openReReview(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  $('mbox').innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">重新审核 · 延期</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="card-red" style="border-radius:var(--radius-md);padding:12px;margin-bottom:14px;font-size:12px;color:rgba(255,255,255,.72);line-height:1.65">
      <strong style="color:var(--red-light)">「${r.name}」</strong><br>${expLabel(r.expDate)}，请确认信息是否仍有效后延期。
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">重新设置有效期</label>
        <select class="fi" id="re-type"><option value="6m">再延六个月</option><option value="1y">再延一年</option></select>
      </div>
      <div class="u-flex u-gap-md">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">暂不处理</button>
        <button class="btn btn-green" style="flex:2;font-size:12px;padding:10px" onclick="confirmReview(${id})">✓ 信息有效，确认延期</button>
      </div>
    </div>`;
  $('mo').classList.add('show');
}
function confirmReview(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  r.expType=$('re-type').value; r.expDate=calcExp(today(),r.expType); r.approved=true;
  closeMo(); renderMarkers(); showDetail(id); renderList(); buildHeader();
}

/* ── Delete ── */
function doDelete(id){
  const r = STATE.resources.find(x=>x.id===id); if(!r) return;
  $('mbox').innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title" style="color:var(--red-light)">确认删除资源</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="card-red" style="border-radius:var(--radius-md);padding:14px;margin-bottom:16px;line-height:1.7">
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px">「${r.name}」</div>
      <div style="font-size:11px;color:rgba(255,255,255,.55)">地址：${r.addr} · 附件 ${r.files.length} 个</div>
      <div style="font-size:11px;color:var(--red-light);margin-top:7px;font-weight:600">此操作不可撤销，资源及所有附件将永久删除。</div>
    </div>
    <div class="u-flex u-gap-md">
      <button class="btn btn-ghost" style="flex:1;padding:10px;font-size:12px" onclick="closeMo()">取消，保留资源</button>
      <button class="btn btn-red" style="flex:1;padding:10px;font-size:12px" onclick="confirmDelete(${id})">确认永久删除</button>
    </div>`;
  $('mo').classList.add('show');
}
function confirmDelete(id){ STATE.resources=STATE.resources.filter(x=>x.id!==id); closeMo(); closeDp(); renderMarkers(); renderList(); buildHeader(); }

/* ── Add Resource ── */
function startAdd(){ STATE.adding=!STATE.adding; buildHeader(); }

function openAddForm(){
  STATE.pendFiles = [];
  $('mbox').innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">标注新资源</h3>
      <button class="modal-close" onclick="closeMo()">×</button>
    </div>
    <div class="card-amber" style="padding:7px 11px;border-radius:var(--radius-sm);margin-bottom:12px;font-size:11px;color:var(--gold-light);font-weight:500">
      📍 坐标：${STATE.addLL.lat.toFixed(4)}, ${STATE.addLL.lng.toFixed(4)}
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">资源名称 *</label><input class="fi" id="fn" placeholder="资源名称"></div>
      <div class="grid-2">
        <div><label class="lbl">资源类型 *</label>
          <select class="fi" id="fc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('')}</select>
        </div>
        <div><label class="lbl">具体地址</label><input class="fi" id="fa" placeholder="城市/区域"></div>
      </div>
      <div><label class="lbl">资源描述</label><textarea class="fi" id="fno" rows="3" placeholder="描述资源内容、价值及适用场景..."></textarea></div>
      <div style="border-top:1px solid var(--border);padding-top:11px">
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:9px;font-weight:500">🔒 以下联系信息加密存储，仅管理员 / VIP / 本人可查看</div>
        <div class="grid-2">
          <div><label class="lbl">联系人</label><input class="fi" id="fcn" placeholder="姓名"></div>
          <div><label class="lbl">联系电话</label><input class="fi" id="ftel" placeholder="+86 ..."></div>
        </div>
        <div style="margin-top:9px"><label class="lbl">联系邮箱</label><input class="fi" id="fem" type="email" placeholder="email@example.com"></div>
      </div>
      <div>
        <label class="lbl">上传附件（单文件 ≤ ${CONFIG.FILE_MAX_MB}MB，最多 ${CONFIG.FILES_PER_RES} 个）</label>
        <div class="upload-area" onclick="simUpload()">
          <div class="upload-area__text">点击上传文件（PDF / 图片 / Word / Excel）</div>
          <div class="upload-area__hint">正式部署后连接 Supabase Storage / Cloudflare R2</div>
        </div>
        <div id="upl-files" style="margin-top:6px"></div>
      </div>
      <div class="u-flex u-gap-md" style="padding-top:4px">
        <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">取消</button>
        <button class="btn btn-primary" style="flex:2;width:auto" onclick="submitRes()">提交（待管理员审核）</button>
      </div>
    </div>`;
  $('mo').classList.add('show');
}

function simUpload(){
  if(STATE.pendFiles.length>=CONFIG.FILES_PER_RES){ alert(`最多上传 ${CONFIG.FILES_PER_RES} 个文件`); return; }
  const names=['合同协议.pdf','营业执照.pdf','产品资质.docx','市场报告.pdf','授权书.pdf'];
  const n=names[Math.floor(Math.random()*names.length)], sz=+(Math.random()*8+0.5).toFixed(1);
  if(sz>CONFIG.FILE_MAX_MB){ alert(`文件 ${sz}MB 超过 ${CONFIG.FILE_MAX_MB}MB 限制`); return; }
  STATE.pendFiles.push({n,sz}); renderUplFiles();
}
function renderUplFiles(){
  const el=$('upl-files'); if(!el) return;
  el.innerHTML=STATE.pendFiles.map((f,i)=>
    `<div class="upload-file-item">
      <span class="upload-file-name">📎 ${f.n}</span>
      <span class="upload-file-meta">${f.sz}MB <span class="upload-file-remove" onclick="rmFile(${i})">×</span></span>
    </div>`).join('');
}
function rmFile(i){ STATE.pendFiles.splice(i,1); renderUplFiles(); }
function submitRes(){
  const name=($('fn').value||'').trim(); if(!name){ alert('请填写资源名称'); return; }
  const r={
    id:STATE.nextId++, name, cat:$('fc').value, lat:STATE.addLL.lat, lng:STATE.addLL.lng,
    addr:($('fa').value||`${STATE.addLL.lat.toFixed(2)}, ${STATE.addLL.lng.toFixed(2)}`),
    contact:{ name:$('fcn').value, email:$('fem').value, tel:$('ftel').value },
    notes:$('fno').value||'（暂无备注）', files:[...STATE.pendFiles],
    owner:STATE.cu.id, approved:false, approvedDate:null,
    expType:CATS[$('fc').value]?.defExp||'6m', expDate:null
  };
  STATE.pendFiles=[]; STATE.resources.push(r); closeMo(); renderMarkers(); renderList();
  if(lMap) lMap.flyTo([r.lat, r.lng], 6, { duration:1.2 });
  setTimeout(()=>showDetail(r.id), 1300);
}

function closeMo(){ $('mo').classList.remove('show'); }
