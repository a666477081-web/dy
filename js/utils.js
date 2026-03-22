/* ════════════════════════════════════════
   UTILS.JS — Helper Functions
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

const $ = id => document.getElementById(id);

function rc(role)  { return (ROLES[role]||{c:'#94a3b8'}).c; }
function rl(role)  { return (ROLES[role]||{l:'用户'}).l; }
function hr(hex)   { const n=parseInt(hex.slice(1),16); return`${(n>>16)&255},${(n>>8)&255},${n&255}`; }
function today()   { return new Date().toISOString().slice(0,10); }
function ts()      { return new Date().toLocaleString('zh-CN',{hour12:false}); }
function addDays(d,n){ const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); }
function calcExp(date,type){ return type==='1y'?addDays(date,365):addDays(date,183); }

function expStatus(exp){
  if(!exp) return 'none';
  const d = Math.floor((new Date(exp)-new Date())/86400000);
  return d<0 ? 'expired' : d<=30 ? 'warn' : 'valid';
}
function expLabel(exp){
  if(!exp) return '';
  const d = Math.floor((new Date(exp)-new Date())/86400000);
  if(d<0)  return `已过期 ${Math.abs(d)} 天`;
  if(d===0)return '今日到期';
  if(d<=30)return `${d} 天后到期`;
  return `${Math.floor(d/30)} 个月后到期`;
}

/* AI quota helpers */
function getUsed(uid){
  const k=STATE.aiUsage[uid];
  return(!k||k.date!==today()) ? 0 : (k.count||0);
}
function incUsed(uid){
  if(!STATE.aiUsage[uid]||STATE.aiUsage[uid].date!==today()) STATE.aiUsage[uid]={date:today(),count:0};
  STATE.aiUsage[uid].count++;
}
function aiRem(uid,role){
  const lim=CONFIG.AI_QUOTA[role]||10;
  return Math.max(0,lim-getUsed(uid));
}
function canAI(uid,role){ return CONFIG.AI_QUOTA[role]===999999||getUsed(uid)<(CONFIG.AI_QUOTA[role]||10); }

/* CSV export */
function dlCSV(rows,name){
  const csv=rows.map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`${name}_${today()}.csv`;
  a.click();
}

/* Notification badge */
function badge(n, color='var(--red)'){
  if(!n) return '';
  return `<span class="hdr-notif-dot" style="background:${color}">${n}</span>`;
}

/* Permissions */
function canSeeContact(r){
  return STATE.cu && (
    STATE.cu.role==='admin' ||
    STATE.cu.role==='vip'   ||
    (STATE.cu.role==='editor' && r.owner===STATE.cu.id)
  );
}
