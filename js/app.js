/* ════════════════════════════════════════
   APP.JS — 应用程序核心入口（完整修正版）
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

/**
 * 1. 当用户登录成功后，调用此函数启动整个应用界面
 */
function showApp() {
  console.log("正在启动应用界面...");

  // --- 视图切换 ---
  const loginView = document.getElementById('lv');
  const appView = document.getElementById('av');

  if (loginView) loginView.style.display = 'none';
  if (appView) appView.style.display = 'flex';

  // --- 数据同步 ---
  // 立即从 Supabase 云端抓取最新的资源数据
  if (typeof loadResourcesFromCloud === 'function') {
    loadResourcesFromCloud();
  } else {
    console.error("错误：找不到 loadResourcesFromCloud 函数，请检查 resources.js 是否加载。");
  }

  // --- UI 渲染 ---
  // 渲染顶部导航栏（包含资源统计和用户状态）
  if (typeof buildHeader === 'function') {
    buildHeader();
  }

  // 渲染侧边栏列表
  if (typeof buildSidebar === 'function') {
    buildSidebar();
  }

  // --- 地图初始化 ---
  // 如果地图还未创建，则初始化；如果已存在，则刷新尺寸（防止渲染空白）
  if (typeof initMap === 'function') {
    if (!window.lMap) {
      // 给浏览器一点渲染 DOM 的时间，100ms 后初始化地图
      setTimeout(() => { 
        initMap(); 
        console.log("地图初始化完成");
      }, 100);
    } else {
      // 解决 Leaflet 在隐藏容器显示时的尺寸 Bug
      setTimeout(() => { 
        window.lMap.invalidateSize(); 
        console.log("地图尺寸已刷新");
      }, 120);
    }
  }
}

/**
 * 2. 页面首次加载时的初始化逻辑
 */
window.addEventListener('DOMContentLoaded', () => {
  console.log("系统已就绪，等待登录...");
  
  // 默认渲染登录表单
  if (typeof renderLogin === 'function') {
    renderLogin();
  }
});

/**
 * 3. 辅助工具函数：快速获取 DOM 元素 (对应代码中的 $ 符号)
 */
function $(id) {
  return document.getElementById(id);
}
