/* ════════════════════════════════════════
   ADMIN.JS — Admin Panel: Stats · Expiry · Users · Logs
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

function openAdmin(tab){
  const expiredR = STATE.resources.filter(r=>r.approved&&expStatus(r.expDate)==='expired');
  const warnR    = STATE.resources.filter(r=>r.approved&&expStatus(r.expDate)==='warn');
  const pend     = STATE.users.filter(u=>!u.approved);
  const newL     = STATE.actLog.filter(l=>!l.seenByAdmin).length;
  if(tab==='logs'){ STATE.actLog.forEach(l=>l.seenByAdmin=true); buildHeader(); }

  const tabs = [
    ['stats', '📊 统计导出'],
    ['expiry', `有效期${(expiredR.length+warnR.length)>0 ? ` ⚠${expiredR.length+warnR.length}` : '管理'}`],
    ['users',  `用户管理${pend.length ? ` (${pend.length})` : ''}`],
    ['logs',   `活动日志${newL ? ` (${newL})` : ''}`],
  ];

  $('mbox').innerHTML = `
    <div class="modal-header">
      <div style="display:flex;gap:2px;overflow-x:auto">${tabs.map(([t,l])=>`<button class="tab${t===tab?' on':''}" onclick="openAdmin('${t}')">${l}</button>`).join('')}</div>
      <button class="modal-close" onclick="closeMo()" style="flex-shrink:0;margin-left:9px">×</button>
    </div>
    ${tab==='stats'  ? buildStats()              : ''}
    ${tab==='expiry' ? buildExpiry(expiredR,warnR): ''}
    ${tab==='users'  ? buildUsers(pend)           : ''}
    ${tab==='logs'   ? buildLogs()               : ''}`;
  $('mo').classList.add('show');
}

/* ── Statistics ── */
function buildStats(){
  const tot  = STATE.resources.length;
  const appr = STATE.resources.filter(r=>r.approved).length;
  const pnd  = tot - appr;
  const exp  = STATE.resources.filter(r=>r.approved&&expStatus(r.expDate)==='expired').length;
  const byC  = Object.keys(CATS).map(k=>({k,l:CATS[k].l,c:CATS[k].c,n:STATE.resources.filter(r=>r.cat===k).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const maxN = byC[0]?.n||1;
  const totSz= STATE.resources.reduce((a,r)=>a+r.files.reduce((b,f)=>b+(f.sz||0),0),0).toFixed(1);
  return `
    <div class="grid-4" style="margin-bottom:15px">
      ${[['总资源',tot,'#f59e0b'],['已审核',appr,'#34d399'],['待审核',pnd,'#f59e0b'],['已过期',exp,'#ef4444']].map(([l,v,c])=>
        `<div class="stat-card"><div class="stat-card__num" style="color:${c}">${v}</div><div class="stat-card__lbl">${l}</div></div>`
      ).join('')}
    </div>
    <div class="grid-2" style="margin-bottom:15px">
      <div>
        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;font-weight:700">资源类型分布</div>
        ${byC.map(x=>`
          <div style="margin-bottom:7px">
            <div class="u-flex u-justify-between" style="font-size:11px;color:rgba(255,255,255,.55);margin-bottom:3px"><span>${x.l}</span><span style="font-weight:700">${x.n}</span></div>
            <div class="bar-track"><div class="bar-fill" style="background:${x.c};width:${Math.round(x.n/maxN*100)}%"></div></div>
          </div>`).join('')}
      </div>
      <div>
        <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;font-weight:700">关键指标</div>
        ${[['附件总大小',totSz+' MB','#60a5fa'],['AI查询次数',STATE.actLog.length+'次','#a78bfa'],['VIP用户',STATE.users.filter(u=>u.role==='vip'&&u.approved).length+'人','#f59e0b'],['待审用户',STATE.users.filter(u=>!u.approved).length+'人','#f472b6']].map(([k,v,c])=>
          `<div class="u-flex u-justify-between" style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px"><span style="color:var(--text-secondary)">${k}</span><span style="color:${c};font-weight:700">${v}</span></div>`
        ).join('')}
      </div>
    </div>
    <div class="u-flex u-gap-md">
      <button onclick="exportCSV()" class="btn btn-green" style="flex:1;padding:10px;font-size:11px">⬇ 导出资源 CSV（含联系方式）</button>
      <button onclick="exportLogCSV()" class="btn btn-ai" style="flex:1;padding:10px;font-size:11px">⬇ 导出 AI 活动日志</button>
    </div>`;
}

/* ── Expiry Management ── */
function buildExpiry(expiredR, warnR){
  const section = (title, arr, isExp) => `
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px;font-weight:700">${title} (${arr.length})</div>
    ${arr.length ? arr.map(r=>`
      <div class="${isExp?'card-red':'card-amber'}" style="border-radius:var(--radius-md);padding:10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="min-width:0">
          <div class="u-truncate" style="font-size:12px;font-weight:700;color:${isExp?'var(--red-light)':'var(--gold-light)'}">${r.name}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${CATS[r.cat]?.l||r.cat} · ${r.addr} · ${expLabel(r.expDate)}</div>
        </div>
        <div class="u-flex u-gap-sm" style="flex-shrink:0">
          <button onclick="openReReview(${r.id})" class="btn btn-green" style="font-size:9px;padding:4px 11px">延期</button>
          <button onclick="doDelete(${r.id})" class="btn btn-red" style="font-size:9px;padding:4px 11px">删除</button>
        </div>
      </div>`).join('')
    : `<div style="font-size:11px;color:var(--text-faint);padding:8px 0 14px">暂无相关资源</div>`}`;
  return section('已过期资源 — 需重新审核或删除', expiredR, true) +
         section('即将到期（30天内）— 建议提前处理', warnR, false);
}

/* ── User Management ── */
function buildUsers(pend){
  const appr = STATE.users.filter(u=>u.approved);
  return `
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px;font-weight:700">待审核注册申请 (${pend.length})</div>
    ${pend.length ? pend.map(u=>`
      <div class="card-red" style="border-radius:var(--radius-md);padding:11px;margin-bottom:9px">
        <div class="u-flex u-justify-between" style="margin-bottom:8px">
          <div>
            <div style="font-size:13px;font-weight:700;color:#fff">${u.name} <span style="font-size:10px;color:var(--text-muted);font-weight:400">@${u.un}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:2px">${u.email}${u.org?' · '+u.org:''}</div>
          </div>
          <span style="font-size:10px;color:var(--text-muted)">${u.reg}</span>
        </div>
        <div class="u-flex u-gap-sm">
          <button onclick="approveU('${u.id}','editor');openAdmin('users')" class="btn btn-green" style="flex:1;font-size:10px;padding:7px">✓ 批准为资源用户</button>
          <button onclick="approveU('${u.id}','vip');openAdmin('users')" class="btn btn-amber" style="flex:1;font-size:10px;padding:7px">⭐ 批准为 VIP</button>
          <button onclick="rejectU('${u.id}')" class="btn btn-red" style="padding:7px 13px;font-size:12px;font-weight:700">✕</button>
        </div>
      </div>`).join('')
    : `<div style="font-size:11px;color:var(--text-faint);padding:8px 0 14px">暂无待审核申请</div>`}
    <hr class="divider">
    <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px;font-weight:700">已批准用户 (${appr.length})</div>
    ${appr.map(u=>`
      <div class="u-flex u-items-center u-justify-between" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">
        <div class="u-flex u-items-center u-gap-sm">
          <div style="width:32px;height:32px;border-radius:50%;background:rgba(${hr(rc(u.role))},.2);border:1.5px solid ${rc(u.role)};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${rc(u.role)}">${u.name[0]}</div>
          <div>
            <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.85)">${u.name}</div>
            <div style="font-size:10px;color:var(--text-muted)">@${u.un} · AI今日 ${getUsed(u.id)} 次</div>
          </div>
        </div>
        <div class="u-flex u-items-center u-gap-sm">
          <span class="badge badge-role" style="background:rgba(${hr(rc(u.role))},.18);color:${rc(u.role)};border:1px solid ${rc(u.role)}44">${rl(u.role)}</span>
          ${u.id!==STATE.cu.id
            ? `<select onchange="changeRole('${u.id}',this.value);openAdmin('users')" style="background:#0e1628;border:1.5px solid rgba(255,255,255,.22);color:rgba(255,255,255,.75);font-size:10px;border-radius:5px;padding:3px 6px;cursor:pointer">
                ${['editor','vip','admin'].map(r=>`<option value="${r}"${u.role===r?' selected':''}>${rl(r)}</option>`).join('')}
              </select>`
            : `<span style="font-size:10px;color:var(--text-faint)">(当前登录)</span>`}
        </div>
      </div>`).join('')}`;
}

/* ── Activity Logs ── */
function buildLogs(){
  if(!STATE.actLog.length) return `<div style="padding:24px;text-align:center;font-size:12px;color:var(--text-faint)">暂无 AI 查询记录</div>`;
  return STATE.actLog.map(l=>`
    <div class="card-surface" style="margin-bottom:9px">
      <div class="u-flex u-justify-between u-items-start" style="margin-bottom:7px">
        <div class="u-flex u-items-center u-gap-sm">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(${hr(rc(l.userRole))},.2);border:1.5px solid ${rc(l.userRole)};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${rc(l.userRole)}">${l.userName[0]}</div>
          <div>
            <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.85)">${l.userName}</div>
            <div style="font-size:10px;color:${rc(l.userRole)}">${rl(l.userRole)}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--text-muted)">${l.time}</div>
          <div style="font-size:9px;color:rgba(52,211,153,.65);margin-top:2px">✉ 已通知管理员</div>
        </div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.6);background:rgba(255,255,255,.04);border-radius:var(--radius-sm);padding:7px 10px;margin-bottom:6px;line-height:1.65">"${l.query}"</div>
      ${l.error
        ? `<div style="font-size:10px;color:rgba(239,68,68,.65)">⚠ API 未配置（演示关键词匹配模式）</div>`
        : l.resultIds.length
          ? `<div style="font-size:11px;color:var(--purple-light)">✦ 匹配：${l.resultIds.map(id=>STATE.resources.find(x=>x.id===id)?.name).filter(Boolean).join(' · ')}</div>`
          : `<div style="font-size:11px;color:var(--text-faint)">无匹配结果</div>`}
    </div>`).join('');
}

/* ── User Management Actions ── */
function approveU(id, role){ const u=STATE.users.find(x=>x.id===id); if(u){ u.approved=true; u.role=role; } buildHeader(); }
function rejectU(id){ if(!confirm('确认拒绝并删除此注册申请？')) return; STATE.users=STATE.users.filter(x=>x.id!==id); buildHeader(); openAdmin('users'); }
function changeRole(id, role){ const u=STATE.users.find(x=>x.id===id); if(u) u.role=role; }

/* ── CSV Export ── */
function exportCSV(){
  const H=['ID','名称','类型','地址','纬度','经度','描述','联系人','邮箱','电话','附件数','大小MB','审核状态','有效期至','有效期类型','上传者'];
  const rows=STATE.resources.map(r=>{
    const ow=STATE.users.find(u=>u.id===r.owner);
    return [r.id,r.name,CATS[r.cat]?.l||r.cat,r.addr,r.lat.toFixed(4),r.lng.toFixed(4),r.notes.replace(/[,\n]/g,'；'),r.contact.name,r.contact.email,r.contact.tel,r.files.length,r.files.reduce((a,f)=>a+(f.sz||0),0).toFixed(1),r.approved?(expStatus(r.expDate)==='expired'?'已过期':'有效'):'待审核',r.expDate||'',r.expType==='1y'?'一年':'六个月',ow?.name||''];
  });
  dlCSV([H,...rows],'资源图谱_全量导出');
}
function exportLogCSV(){
  const H=['时间','用户名','角色','查询内容','匹配数量','匹配资源ID'];
  const rows=STATE.actLog.map(l=>[l.time,l.userName,rl(l.userRole),l.query.replace(/,/g,'；'),l.resultIds.length,l.resultIds.join('|')]);
  dlCSV([H,...rows],'AI活动日志');
}
