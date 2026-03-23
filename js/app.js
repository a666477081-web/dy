/* ════════════════════════════════════════
   APP.JS — 界面构建与初始化 (完整恢复版)
════════════════════════════════════════ */

function showApp() {
  $('lv').style.display = 'none';
  $('av').style.display = 'flex'; // 使用 flex 布局确保 UI 排版正常

  // 1. 同步云端资源
  if (typeof loadResourcesFromCloud === 'function') {
    loadResourcesFromCloud();
  }

  // 2. 渲染 UI 组件
  buildHeader();
  buildSidebar();

  // 3. 初始化地图
  if (!window.lMap) {
    setTimeout(() => { initMap(); }, 100);
  } else {
    setTimeout(() => { if (window.lMap) window.lMap.invalidateSize(); }, 120);
  }
}

// 渲染顶部导航
function buildHeader() {
  if (!STATE.cu) return;
  const cu = STATE.cu;
  
  // 这里的 HTML 决定了你顶部显示的按钮和文字
  $('hdr').innerHTML = `
    <div class="hdr-brand">◈ RESOURCE ATLAS <span class="ai-tag">AI</span></div>
    <div class="hdr-spacer"></div>
    <div class="u-flex u-items-center u-gap-md">
      ${STATE.adding ? '<span class="adding-hint">请在地图上点击位置...</span>' : ''}
      <button class="btn ${STATE.adding ? 'btn-amber' : 'btn-primary'}" onclick="startAdd()">
        ${STATE.adding ? '取消标注' : '标注新资源'}
      </button>
      <div class="user-badge" onclick="doLogout()">
        <span class="user-name">${cu.name}</span>
        <span class="logout-icon">退出</span>
      </div>
    </div>
  `;
}

// 渲染侧边栏框架
function buildSidebar() {
  $('sb').innerHTML = `
    <div class="sb-search">
      <input type="text" id="sinp" class="fi" placeholder="搜索资源名称..." oninput="renderList()">
    </div>
    <div id="chips-wrap" class="sb-chips"></div>
    <div id="cnt" class="sb-count">正在同步云端数据...</div>
    <div id="rlist" class="sb-list"></div>
    <div class="sb-footer">DYFTZ 云端同步系统 v4.0</div>
  `;
  // 渲染分类过滤按钮
  if (typeof renderChips === 'function') renderChips();
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof renderLogin === 'function') renderLogin();
});

function $(id) { return document.getElementById(id); }
