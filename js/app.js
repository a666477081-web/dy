/* ════════════════════════════════════════
   APP.JS — 完整功能恢复版 (对应截图 UI)
════════════════════════════════════════ */

function $(id) { return document.getElementById(id); }

function showApp() {
  $('lv').style.display = 'none';
  $('av').style.display = 'flex';

  buildHeader();
  buildSidebar();

  if (typeof loadResourcesFromCloud === 'function') loadResourcesFromCloud();

  if (!window.lMap) {
    setTimeout(() => { initMap(); }, 200);
  } else {
    setTimeout(() => { window.lMap.invalidateSize(); }, 250);
  }
}

function buildHeader() {
  const hdr = $('hdr');
  if (!hdr || !STATE.cu) return;

  const isAdmin = STATE.cu.role === 'admin';
  const pendUsers = STATE.users ? STATE.users.filter(u => !u.approved).length : 0;
  const pendRes = STATE.resources.filter(r => !r.approved).length;

  hdr.innerHTML = `
    <div class="hdr-brand">◈ RESOURCE ATLAS <span class="ai-tag">AI</span></div>
    <div style="flex:1"></div>
    
    <div class="u-flex u-items-center u-gap-sm">
      <button class="btn btn-ai" onclick="openAIMatch()" style="font-size:11px">✦ AI 匹配</button>
      <button class="btn ${STATE.adding ? 'btn-amber' : 'btn-primary'}" onclick="startAdd()" style="font-size:11px">
        ${STATE.adding ? '取消标注' : '标注资源'}
      </button>

      ${isAdmin ? `
        <div class="admin-group u-flex u-gap-xs" style="margin-left:8px; border-left:1px solid rgba(255,255,255,0.1); padding-left:8px;">
          <button class="btn btn-ghost" onclick="openStats()" style="font-size:10px">资源统计</button>
          <button class="btn btn-ghost" onclick="openExpiry()" style="font-size:10px">有效期</button>
          <button class="btn btn-ghost" onclick="openAdminUsers()" style="font-size:10px; position:relative;">
            用户管理 ${pendUsers > 0 ? `<span class="badge-dot"></span>` : ''}
          </button>
          <button class="btn btn-ghost" onclick="openLogs()" style="font-size:10px">活动日志</button>
        </div>
      ` : ''}

      <div class="user-badge-v2" onclick="confirmLogout()">
        <div class="u-flex-col">
          <span class="user-name-text">${STATE.cu.name}</span>
          <span class="user-role-tag">${isAdmin ? '系统管理员' : '正式成员'}</span>
        </div>
        <div class="user-avatar-mini">${STATE.cu.name.charAt(0)}</div>
      </div>
    </div>
  `;
}

function buildSidebar() {
  const sb = $('sb');
  if (!sb) return;
  sb.innerHTML = `
    <div class="sb-inner">
      <div class="sb-search-box"><input type="text" id="sinp" class="fi" placeholder="搜索资源内容或类型..." oninput="renderList()"></div>
      <div id="chips-wrap" class="sb-filter-chips"></div>
      <div class="sb-meta-row">
        <span id="cnt">正在同步...</span>
        <span onclick="loadResourcesFromCloud()" style="cursor:pointer; color:var(--blue-light)">刷新数据</span>
      </div>
      <div id="rlist" class="sb-resource-list custom-scroll"></div>
    </div>
  `;
  if (typeof renderChips === 'function') renderChips();
  if (typeof renderList === 'function') renderList();
}

function confirmLogout() { if(confirm("确定要退出系统吗？")) location.reload(); }
window.addEventListener('DOMContentLoaded', () => { if(typeof renderLogin === 'function') renderLogin(); });
