/* ════════════════════════════════════════
   APP.JS — 暴力修复版 (确保 UI 必显示)
════════════════════════════════════════ */

function $(id) { return document.getElementById(id); }

function showApp() {
  console.log("正在强制渲染 UI...");
  
  // 1. 切换视图
  if ($('lv')) $('lv').style.display = 'none';
  if ($('av')) $('av').style.display = 'flex';

  // 2. 渲染 UI (即使没有数据也强制渲染)
  try {
    buildHeader();
    buildSidebar();
  } catch (e) {
    console.error("渲染 UI 出错:", e);
  }

  // 3. 加载资源
  if (typeof loadResourcesFromCloud === 'function') {
    loadResourcesFromCloud();
  }

  // 4. 初始化地图
  if (!window.lMap) {
    setTimeout(() => { initMap(); }, 200);
  } else {
    setTimeout(() => { window.lMap.invalidateSize(); }, 250);
  }
}

function buildHeader() {
  const hdr = $('hdr');
  if (!hdr) return;
  
  // 获取用户名，如果没有就显示“管理员”
  const userName = (STATE.cu && STATE.cu.name) ? STATE.cu.name : "管理员";
  
  hdr.innerHTML = `
    <div class="hdr-brand" style="color:#fff; font-weight:bold; padding:0 15px;">◈ RESOURCE ATLAS</div>
    <div style="flex:1"></div>
    <div class="u-flex u-items-center u-gap-md" style="padding-right:15px">
      <button class="btn btn-primary" onclick="startAdd()" id="addBtn">标注新资源</button>
      <span style="color:rgba(255,255,255,0.7); font-size:12px; margin:0 10px;">${userName}</span>
      <button class="btn btn-ghost" onclick="location.reload()" style="font-size:11px">退出</button>
    </div>
  `;
}

function buildSidebar() {
  const sb = $('sb');
  if (!sb) return;
  
  sb.innerHTML = `
    <div style="padding:15px">
      <input type="text" id="sinp" class="fi" placeholder="搜索资源..." oninput="renderList()" style="width:100%">
      <div id="chips-wrap" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:5px"></div>
      <div id="cnt" style="color:rgba(255,255,255,0.5); font-size:11px; margin-top:15px">正在加载资源...</div>
      <div id="rlist" style="margin-top:10px; overflow-y:auto; max-height:calc(100vh - 200px)"></div>
    </div>
  `;
  
  if (typeof renderChips === 'function') renderChips();
  if (typeof renderList === 'function') renderList();
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof renderLogin === 'function') renderLogin();
});
