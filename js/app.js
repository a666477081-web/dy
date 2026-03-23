/* ════════════════════════════════════════
   APP.JS — Application Shell · Header · Sidebar · Init
   Resource Atlas | DYFTZ
════════════════════════════════════════ */
// 当用户登录成功后，调用这个函数加载云端资源
function showApp() {
  $('lv').style.display='none'; 
  $('av').style.display='flex';
  
  // 【新增这一行】
  loadResourcesFromCloud(); 
}
function showApp(){
  $('lv').style.display = 'none';
  $('av').style.display = 'block';
  buildHeader();
  buildSidebar();
  if(!lMap){ setTimeout(()=>{ initMap(); }, 100); }
  else { setTimeout(()=>{ if(lMap) lMap.invalidateSize(); }, 120); }
}

/* ── Header ── */
function buildHeader(){
  const cu      = STATE.cu;
  const pend    = STATE.users.filter(u=>!u.approved).length;
  const expN    = STATE.resources.filter(r=>r.approved&&(expStatus(r.expDate)==='expired'||expStatus(r.expDate)==='warn')).length;
  const newLogs = STATE.actLog.filter(l=>!l.seenByAdmin).length;
  const isAdmin = cu.role === 'admin';
  const rem     = aiRem(cu.id, cu.role);
  const remStr  = cu.role!=='admin'
    ? `<span style="font-size:9px;color:${rem>5?'rgba(52,211,153,.85)':'rgba(239,68,68,.85)'}">(余${rem})</span>`
    : '';

  $('hdr').innerHTML = `
    <div class="hdr-brand">◈ RESOURCE ATLAS <span class="ai-tag">AI</span></div>
    <div class="hdr-spacer"></div>

    ${STATE.adding ? `<span style="font-size:10px;color:var(--gold-light);font-weight:600;flex-shrink:0">▶ 点击地图任意位置标注资源</span>` : ''}

    <button class="btn btn-ai" onclick="openAIMatch()" style="padding:5px 11px;font-size:10px;flex-shrink:0">
      ✦ AI匹配 ${remStr}
    </button>

    <button class="btn ${STATE.adding?'btn-amber':'btn-ghost'}" onclick="startAdd()" style="padding:5px 11px;font-size:10px;flex-shrink:0">
      ${STATE.adding ? '× 取消标注' : '+ 标注资源'}
    </button>

    ${isAdmin ? `
      <button class="btn btn-ghost" onclick="openAdmin('stats')" style="padding:5px 10px;font-size:10px;flex-shrink:0">📊 统计</button>

      <button class="btn btn-ghost" onclick="openAdmin('expiry')" style="position:relative;padding:5px 10px;font-size:10px;flex-shrink:0">
        有效期${expN>0 ? badge(expN) : ''}
      </button>

      <button class="btn btn-ghost" onclick="openAdmin('users')" style="position:relative;padding:5px 10px;font-size:10px;flex-shrink:0">
        用户管理${pend>0 ? badge(pend) : ''}
      </button>

      <button class="btn btn-ghost" onclick="openAdmin('logs')" style="position:relative;padding:5px 10px;font-size:10px;flex-shrink:0">
        活动日志${newLogs>0 ? badge(newLogs,'var(--purple)') : ''}
      </button>` : ''}

    <div class="hdr-user">
      <div class="user-avatar" style="background:rgba(${hr(rc(cu.role))},.2);border-color:${rc(cu.role)};color:${rc(cu.role)}">${cu.name[0]}</div>
      <div>
        <div class="user-name">${cu.name}</div>
        <div class="user-role" style="color:${rc(cu.role)}">${rl(cu.role)}</div>
      </div>
      <button class="btn btn-ghost" onclick="doLogout()" style="padding:4px 10px;font-size:10px">退出</button>
    </div>`;
}

/* ── Sidebar ── */
function buildSidebar(){
  $('sb').innerHTML = `
    <div class="sb-search">
      <input class="fi" id="sinp" type="text" placeholder="搜索资源名称或类型..." oninput="renderList()" style="font-size:11px;padding:7px 10px">
    </div>
    <div class="sb-chips" id="chips-wrap"></div>
    <div class="sb-meta">
      <span class="sb-meta__count" id="cnt"></span>
      <span class="sb-meta__hint">点击查看详情</span>
    </div>
    <div class="sb-list" id="rlist"></div>
    <div class="sb-legend">
      <div class="sb-legend__grid">
        ${Object.entries(CATS).map(([k,v])=>`
          <div class="sb-legend__item">
            <span class="sb-legend__dot" style="background:${v.c}"></span>
            <span class="sb-legend__lbl">${v.l}</span>
          </div>`).join('')}
      </div>
    </div>`;
  renderChips();
  renderList();
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  renderLogin();
});
