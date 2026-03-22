/* ════════════════════════════════════════
   DATA.JS — Resource Categories & Demo Data
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

/* ── Resource Categories ── */
const CATS = {
  affairs:  { l:'公共事务', c:'#a78bfa', b:'rgba(167,139,250,.14)', defExp:'1y'  },
  commerce: { l:'商贸渠道', c:'#f59e0b', b:'rgba(245,158,11,.14)',  defExp:'1y'  },
  property: { l:'空间资产', c:'#34d399', b:'rgba(52,211,153,.14)',  defExp:'1y'  },
  network:  { l:'战略人脉', c:'#60a5fa', b:'rgba(96,165,250,.14)',  defExp:'6m'  },
  media:    { l:'媒体传播', c:'#f472b6', b:'rgba(244,114,182,.14)', defExp:'6m'  },
  supply:   { l:'供应链',   c:'#fb923c', b:'rgba(251,146,60,.14)',  defExp:'6m'  },
  other:    { l:'其他资源', c:'#94a3b8', b:'rgba(148,163,184,.14)', defExp:'6m'  },
};

/* ── User Roles ── */
const ROLES = {
  admin:  { l:'管理员',   c:'#f472b6' },
  vip:    { l:'VIP用户', c:'#f59e0b' },
  editor: { l:'资源用户', c:'#60a5fa' },
};

/* ── Demo Users ── */
let DEMO_USERS = [
  { id:'u1', un:'admin',    pw:'admin888', role:'admin',  name:'系统管理员',  email:'admin@dyftz.com',    tel:'',            org:'DYFTZ平台',   approved:true,  reg:'2024-01-01' },
  { id:'u2', un:'vip001',   pw:'vip888',   role:'vip',    name:'李总监',      email:'li@example.com',     tel:'+86-138xxxx', org:'东方美食集团', approved:true,  reg:'2024-03-15' },
  { id:'u3', un:'user001',  pw:'user888',  role:'editor', name:'张资源专员',  email:'zhang@example.com',  tel:'+86-139xxxx', org:'供应链部门',   approved:true,  reg:'2024-05-20' },
  { id:'u4', un:'pending1', pw:'test888',  role:'editor', name:'王新申请',    email:'wang@test.com',      tel:'',            org:'合作洽谈方',   approved:false, reg:'2025-03-18' },
];

/* ── Demo Resources ── */
let DEMO_RESOURCES = [
  {
    id:1, name:'粤港澳政务协调网络', cat:'affairs',
    lat:22.4, lng:114.1, addr:'香港特别行政区',
    contact:{ name:'张先生', email:'zhang@example.hk', tel:'+852-9xxx' },
    notes:'粤港澳大湾区政府事务协调资源，覆盖深港两地，可协助企业备案及政策咨询。食品饮料行业有丰富经验。',
    files:[{n:'大湾区政策白皮书.pdf',sz:2.3},{n:'合作框架协议.docx',sz:0.8}],
    owner:'u3', approved:true, approvedDate:'2024-09-01', expType:'1y', expDate:'2025-09-01'
  },
  {
    id:2, name:'新加坡贸易分销网络', cat:'commerce',
    lat:1.34, lng:103.82, addr:'新加坡滨海湾',
    contact:{ name:'Li Wei', email:'liwei@example.sg', tel:'+65-8xxx' },
    notes:'新加坡顶级贸易资源，对接东南亚主要分销渠道，辐射六国。熟悉食品饮料进出口法规。',
    files:[], owner:'u3', approved:true, approvedDate:'2024-10-15', expType:'1y', expDate:'2025-10-15'
  },
  {
    id:3, name:'巴拿马自贸区仓储基地', cat:'property',
    lat:9.1, lng:-79.5, addr:'巴拿马科隆自贸区',
    contact:{ name:'Carlos M.', email:'carlos@example.pa', tel:'+507-6xxx' },
    notes:'8000㎡冷链仓储空间，直达拉美主要港口。可存储食品饮料及农产品，配备温控系统。',
    files:[{n:'仓储平面图.pdf',sz:3.1},{n:'租赁合同.docx',sz:0.5}],
    owner:'u3', approved:true, approvedDate:'2024-07-01', expType:'1y', expDate:'2025-07-01'
  },
  {
    id:4, name:'迪拜华人商会核心圈层', cat:'network',
    lat:25.2, lng:55.28, addr:'迪拜商业湾',
    contact:{ name:'王总', email:'wang@example.ae', tel:'+971-5xxx' },
    notes:'迪拜华人商圈核心人脉，对接海湾六国政商关系。熟悉清真认证及当地食品法规。深耕中东20年。',
    files:[], owner:'u2', approved:false, approvedDate:null, expType:'6m', expDate:null
  },
  {
    id:5, name:'圣保罗华人媒体矩阵', cat:'media',
    lat:-23.55, lng:-46.64, addr:'巴西圣保罗',
    contact:{ name:'陈主编', email:'chen@example.br', tel:'+55-11-xxxx' },
    notes:'覆盖巴西华人社群，媒体矩阵月活30万+。擅长食品餐饮类品牌本地化推广。',
    files:[{n:'媒体受众报告.pdf',sz:4.7}],
    owner:'u3', approved:true, approvedDate:'2024-06-01', expType:'6m', expDate:'2024-12-01'
  },
  {
    id:6, name:'上海自贸区进出口资质', cat:'commerce',
    lat:31.2, lng:121.5, addr:'上海自贸区',
    contact:{ name:'李经理', email:'li@example.sh', tel:'+86-21-xxxx' },
    notes:'持有完整进出口资质及跨境电商许可，专注食品饮料，可作国内收发货主体。',
    files:[{n:'营业执照.pdf',sz:0.3},{n:'进出口许可证.pdf',sz:0.4}],
    owner:'u2', approved:true, approvedDate:'2025-01-15', expType:'1y', expDate:'2026-01-15'
  },
  {
    id:7, name:'墨西哥城物流中转节点', cat:'supply',
    lat:19.43, lng:-99.13, addr:'墨西哥城工业园区',
    contact:{ name:'Miguel R.', email:'miguel@example.mx', tel:'+52-55-xxxx' },
    notes:'墨西哥最大物流园区合作伙伴，提供清关、仓储、本地配送一站式服务，辐射中美洲。',
    files:[], owner:'u3', approved:true, approvedDate:'2025-02-01', expType:'6m', expDate:'2025-08-01'
  },
  {
    id:8, name:'东京亚洲食品行业协会', cat:'network',
    lat:35.68, lng:139.69, addr:'日本东京六本木',
    contact:{ name:'田中様', email:'tanaka@example.jp', tel:'+81-3-xxxx' },
    notes:'日本亚洲食品行业顶级协会，可对接日本市场准入及主要连锁零售渠道。',
    files:[{n:'协会成员名册.pdf',sz:2.1}],
    owner:'u2', approved:true, approvedDate:'2025-03-01', expType:'6m', expDate:'2025-09-01'
  },
  {
    id:9, name:'吉隆坡华人餐饮协会', cat:'network',
    lat:3.14, lng:101.69, addr:'马来西亚吉隆坡',
    contact:{ name:'陈会长', email:'chen@example.my', tel:'+60-3-xxxx' },
    notes:'马来西亚华人餐饮圈最大协会，会员餐厅500+，可协助食材采购及清真认证辅导。',
    files:[], owner:'u3', approved:true, approvedDate:'2025-01-10', expType:'6m', expDate:'2025-07-10'
  },
  {
    id:10, name:'马来西亚糖业进口商', cat:'commerce',
    lat:3.0, lng:101.5, addr:'马来西亚雪兰莪',
    contact:{ name:'Lim H.', email:'lim@example.my', tel:'+60-12-xxxx' },
    notes:'马来西亚主要白糖及食品原料进口商，持有进口许可证，覆盖全马零售及餐饮市场。',
    files:[{n:'进口资质证明.pdf',sz:1.8}],
    owner:'u2', approved:true, approvedDate:'2025-02-20', expType:'1y', expDate:'2026-02-20'
  },
];

/* ── Runtime State ── */
let STATE = {
  users:      [...DEMO_USERS],
  resources:  [...DEMO_RESOURCES],
  actLog:     [],
  aiUsage:    {},
  cu:         null,      // current user
  activeId:   null,      // active resource id
  filterCats: new Set(),
  adding:     false,
  addLL:      null,
  pendFiles:  [],
  nextId:     20,
};
