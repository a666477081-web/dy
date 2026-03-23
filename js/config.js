/* ════════════════════════════════════════
   CONFIG.JS — 全局配置与状态初始化
════════════════════════════════════════ */

// 全局配置参数
window.CONFIG = {
  FILE_MAX_MB: 10,
  FILES_PER_RES: 5
};

// 【核心】初始化全局状态机
window.STATE = {
  resources: [],     // 云端抓取的资源列表
  users: [],         // 用户列表
  adding: false,     // 标注模式开关 (重要)
  addLL: null,       // 临时存储地图点击的坐标
  activeId: null,    // 当前选中的资源 ID
  filterCats: new Set(),
  cu: null,          // 当前登录的用户对象
  pendFiles: []      // 待上传的附件
};

// 分类配置 (保持您的分类定义不变)
window.CATS = {
  'public': { l:'公共事务', c:'#3b82f6', b:'rgba(59,130,246,0.1)', defExp:'1y' },
  'biz':    { l:'商贸对接', c:'#10b981', b:'rgba(16,185,129,0.1)', defExp:'1y' },
  'space':  { l:'空间资产', c:'#f59e0b', b:'rgba(245,158,11,0.1)', defExp:'1y' },
  'ppl':    { l:'关键人脉', c:'#8b5cf6', b:'rgba(139,92,246,0.1)', defExp:'6m' },
  'media':  { l:'地缘媒体', c:'#ec4899', b:'rgba(236,72,153,0.1)', defExp:'6m' },
  'supply': { l:'供应链',   c:'#06b6d4', b:'rgba(6,182,212,0.1)', defExp:'6m' },
  'other':  { l:'其他资源', c:'#6b7280', b:'rgba(107,114,128,0.1)', defExp:'6m' }
};
