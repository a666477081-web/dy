/* ════════════════════════════════════════
   APP.JS — 管理员全功能恢复版
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

function $(id) { return document.getElementById(id); }

/**
 * 启动应用界面
 */
function showApp() {
  console.log("正在启动全功能界面...");
  
  if ($('lv')) $('lv').style.display = 'none';
  if ($('av')) $('av').style.display = 'flex';

  // 1. 渲染 UI (此时会根据权限显示不同按钮)
  buildHeader();
  buildSidebar();

  // 2. 加载云端数据
  if (typeof loadResourcesFromCloud === 'function') {
    loadResourcesFromCloud();
  }

  // 3. 初始化地图
  if (!window.lMap) {
    setTimeout(() => { initMap(); }, 200);
  } else {
    setTimeout(() => { if(window.lMap) window.lMap.invalidateSize(); }, 250);
  }
}

/**
 * 渲染顶部导航栏 (包含管理员专用按钮)
 */
function buildHeader() {
  const hdr = $('hdr');
  if (!hdr || !STATE.cu) return;

  const cu = STATE.cu;
  const isAdmin = cu.role === 'admin'; // 判断是否为管理员

  // 计算待审核的数量 (从本地状态获取)
  const pendRes = STATE.resources.filter(r => !r.approved).length;

  hdr.innerHTML = `
    <div class="hdr-brand">◈ RESOURCE ATLAS <span class="ai-tag">AI</span></div>
    
    <div style="flex:1"></div>
    
    <div class="u-flex u-items-center u-gap-sm">
      ${STATE.adding ? '<span style="color:#f59e0b; font-size:11px; margin-right:10px;">请点击地图位置...</span>' : ''}
      
      <button class="btn ${STATE.adding ? 'btn-amber' : 'btn-primary'}" onclick="startAdd()">
        ${STATE.adding ? '取消标注' : '标注新资源'}
      </button>

      ${isAdmin ? `
        <div class="admin-tools u-flex u-gap-xs" style="margin-left:10px; border-left:1px solid rgba(255,255,255,0.1); padding-left:10px;">
          <button class="btn btn-ghost" onclick="openAdminUsers()" style="font-size:11px;">
            用户管理
          </button>
          <button class="btn btn-ghost" onclick="renderList()" style="font-size:11px; position:relative;">
            审核资源 ${pendRes > 0 ? `<span class="badge-dot"></span>` : ''}
          </button>
        </div>
      ` : ''}

      <div class="user-badge" style="margin-left:15px; cursor:pointer;" onclick="confirmLogout()">
        <span style="color:rgba(255,255,255,0.8); font-size:12px;">${cu.name}</span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px; margin-left:5px;">(${isAdmin ? '管理员' : '成员'})</span>
      </div>
    </div>
  `;
}

/**
 * 渲染侧边栏
 */
function buildSidebar() {
  const sb = $('sb');
  if (!sb) return;

  sb.innerHTML = `
    <div class="sb-inner" style="padding:15px; display:flex; flex-direction:column; height:100%;">
      <div class="sb-search-wrap">
        <input type="text" id="sinp" class="fi" placeholder="搜索资源..." oninput="renderList()" style="width:100%">
      </div>
      
      <div id="chips-wrap" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:6px;"></div>
      
      <div id="cnt" style="margin-top:15px; color:rgba(255,255,255,0.4); font-size:11px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
        正在加载资源...
      </div>
      
      <div id="rlist" class="custom-scroll" style="flex:1; overflow-y:auto; margin-top:10px;"></div>
      
      <div style="padding-top:10px; color:rgba(255,255,255,0.2); font-size:9px; text-align:center;">
        RESOURCE ATLAS v4.0 · CLOUD SYNC
      </div>
    </div>
  `;

  if (typeof renderChips === 'function') renderChips();
  if (typeof renderList === 'function') renderList();
}

/**
 * 退出登录
 */
function confirmLogout() {
  if (confirm("确定要退出登录吗？")) {
    location.reload();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof renderLogin === 'function') renderLogin();
});
