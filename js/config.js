/* ════════════════════════════════════════
   CONFIG.JS — 全局配置与状态初始化 (修复版)
════════════════════════════════════════ */

// 1. 全局便捷工具函数（必须放在最前面！）
function $(id) {
  return document.getElementById(id);
}

// 2. 系统参数配置
window.CONFIG = {
  FILE_MAX_MB: 10,
  FILES_PER_RES: 5
};

// 3. 初始化全局状态机
window.STATE = {
  resources: [],
  users: [],
  adding: false,
  addLL: null,
  activeId: null,
  filterCats: new Set(),
  cu: null,
  pendFiles: []
};

// 4. 资源分类配置
window.CATS = {
  'public': { l:'公共事务', c:'#3b82f6', b:'rgba(59,130,246,0.1)', defExp:'1y' },
  'biz':    { l:'商贸对接', c:'#10b981', b:'rgba(16,185,129,0.1)', defExp:'1y' },
  'space':  { l:'空间资产', c:'#f59e0b', b:'rgba(245,158,11,0.1)', defExp:'1y' },
  'ppl':    { l:'关键人脉', c:'#8b5cf6', b:'rgba(139,92,246,0.1)', defExp:'6m' },
  'media':  { l:'地缘媒体', c:'#ec4899', b:'rgba(236,72,153,0.1)', defExp:'6m' },
  'supply': { l:'供应链',   c:'#06b6d4', b:'rgba(6,182,212,0.1)', defExp:'6m' },
  'other':  { l:'其他资源', c:'#6b7280', b:'rgba(107,114,128,0.1)', defExp:'6m' }
};
