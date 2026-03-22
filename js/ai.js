/* ════════════════════════════════════════
   AI.JS — AI Resource Matching
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

function openAIMatch(prefill){
  const rem = aiRem(STATE.cu.id, STATE.cu.role);
  const lim = CONFIG.AI_QUOTA[STATE.cu.role];
  const isAdmin = STATE.cu.role === 'admin';
  const quotaBlocked = !canAI(STATE.cu.id, STATE.cu.role);

  $('mbox').innerHTML = `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">✦ AI 智能资源匹配</h3>
        <div style="font-size:10px;color:rgba(167,139,250,.7);margin-top:2px">由 Claude AI 驱动 · 查询全程记录通知管理员</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        ${isAdmin
          ? `<div style="font-size:10px;color:rgba(167,139,250,.65)">管理员·无限制</div>`
          : `<div style="font-size:11px;font-weight:700;color:${rem>5?'rgba(52,211,153,.85)':'rgba(239,68,68,.85)'}">今日剩余：${rem}/${lim} 次</div>`}
        <button class="modal-close" onclick="closeMo()" style="display:block;margin-top:4px">×</button>
      </div>
    </div>

    ${quotaBlocked ? `
      <div class="card-red" style="border-radius:var(--radius-md);padding:18px;text-align:center;margin-bottom:13px">
        <div style="font-size:14px;color:var(--red-light);font-weight:700;margin-bottom:7px">今日查询次数已用完</div>
        <div style="font-size:11px;color:rgba(255,255,255,.45);line-height:1.75">
          普通用户每天 ${CONFIG.AI_QUOTA.editor} 次，VIP 每天 ${CONFIG.AI_QUOTA.vip} 次<br>
          明日零点自动重置 · 或联系管理员升级权限
        </div>
      </div>
      <button class="btn btn-ghost u-full-width" onclick="closeMo()">关闭</button>`
    : `
      <div class="u-flex-col u-gap-md">
        <div>
          <label class="lbl">描述您的资源或需求</label>
          <textarea class="fi" id="ai-q" rows="4"
            placeholder="例如：我有优质白糖，希望打入马来西亚市场，寻找分销渠道和合作伙伴。&#10;或：我在圣保罗有几家中餐厅，需要稳定的食材供应链和本地媒体推广资源。"
          >${prefill ? `我想为「${prefill}」寻找相关协作资源` : ''}</textarea>
        </div>
        <div class="card-purple" style="border-radius:var(--radius-md);padding:10px;font-size:11px;color:rgba(255,255,255,.45);line-height:1.7">
          ${(STATE.cu.role==='vip'||STATE.cu.role==='admin')
            ? '✦ 您的权限可查看匹配资源的完整联系信息和附件'
            : '📋 匹配结果将显示资源概况。联系方式和附件下载需升级至 VIP 权限。'}
        </div>
        <div id="ai-result"></div>
        <div class="u-flex u-gap-md">
          <button class="btn btn-ghost" style="flex:1" onclick="closeMo()">关闭</button>
          <button id="ai-btn" onclick="runAIMatch()" class="btn btn-ai" style="flex:2;font-size:13px;padding:10px">✦ 开始 AI 匹配</button>
        </div>
      </div>`}`;
  $('mo').classList.add('show');
}

async function runAIMatch(){
  const q = ($('ai-q').value||'').trim();
  if(!q){ alert('请描述您的资源或需求'); return; }
  if(!canAI(STATE.cu.id, STATE.cu.role)){ alert('今日配额已用完'); return; }

  const btn=$('ai-btn'), res=$('ai-result');
  btn.disabled=true; btn.textContent='AI 分析中...'; btn.style.opacity='.5';
  res.innerHTML=`<div style="padding:18px;text-align:center;color:var(--purple-light);font-size:12px">✦ Claude AI 正在分析资源库...</div>`;

  const ctx = STATE.resources.filter(r=>r.approved).map(r=>
    `[ID:${r.id}][类型:${CATS[r.cat]?.l||r.cat}][名称:${r.name}][地址:${r.addr}][描述:${r.notes.slice(0,120)}]`
  ).join('\n');

  const prompt = `你是专业国际商业资源匹配顾问。从资源库找出最匹配用户需求的资源。\n\n资源库：\n${ctx}\n\n用户需求：${q}\n\n返回纯JSON（无代码块）：{"summary":"需求分析2-3句","matches":[{"id":整数,"score":1到10整数,"reason":"匹配原因1-2句"}],"suggestions":"补充建议1-2句"}\nmatches按score降序，最多5条。`;

  try {
    let parsed;
    if(CONFIG.AI_EDGE_FN){
      /* Production: call Supabase Edge Function (API key stays server-side) */
      const resp = await fetch(CONFIG.AI_EDGE_FN, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query:q, context:ctx })
      });
      const data = await resp.json();
      parsed = JSON.parse((data.result||'{}').replace(/```json|```/g,'').trim());
    } else {
      /* Demo fallback: simple keyword matching without real AI */
      parsed = demoMatch(q, ctx);
    }
    incUsed(STATE.cu.id); buildHeader();
    renderAIResult(parsed, q);
    STATE.actLog.unshift({
      id:Date.now(), userId:STATE.cu.id, userName:STATE.cu.name,
      userRole:STATE.cu.role, query:q,
      resultIds:(parsed.matches||[]).map(m=>m.id),
      time:ts(), seenByAdmin:false
    });
  } catch(err){
    incUsed(STATE.cu.id); buildHeader();
    STATE.actLog.unshift({
      id:Date.now(), userId:STATE.cu.id, userName:STATE.cu.name,
      userRole:STATE.cu.role, query:q, resultIds:[], time:ts(), seenByAdmin:false, error:true
    });
    res.innerHTML=`<div class="card-red" style="border-radius:var(--radius-md);padding:13px;font-size:12px;color:var(--red-light)">
      AI 匹配需要配置后端 Edge Function 才能运行。<br>
      <span style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;display:block">请在 js/config.js 中填写 AI_EDGE_FN 地址。</span>
    </div>`;
  }
  btn.disabled=false; btn.textContent='✦ 重新匹配'; btn.style.opacity='1';
}

/* Demo keyword matching (used when AI_EDGE_FN is not configured) */
function demoMatch(q, ctx){
  const qLower = q.toLowerCase();
  const keywords = qLower.split(/[\s，,。.]+/).filter(w=>w.length>1);
  const matches = STATE.resources.filter(r=>r.approved).map(r=>{
    const text = (r.name+r.addr+r.notes+CATS[r.cat]?.l).toLowerCase();
    const hits  = keywords.filter(k=>text.includes(k)).length;
    const score = Math.min(10, Math.round(hits * 2.5 + (hits>0?3:0)));
    return { id:r.id, score, reason:`关键词「${keywords.filter(k=>text.includes(k)).join('、')||'...'}」与该资源描述相关联` };
  }).filter(m=>m.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  return {
    summary:`（演示模式）基于关键词匹配找到 ${matches.length} 条相关资源。配置 Claude API 后可获得更智能的语义匹配与专业分析。`,
    matches,
    suggestions:'建议完善资源描述，并配置 AI_EDGE_FN 以启用完整 AI 语义匹配功能。'
  };
}

function renderAIResult(parsed, q){
  const res  = $('ai-result');
  const see  = STATE.cu.role==='vip' || STATE.cu.role==='admin';
  const items = (parsed.matches||[]).map(m=>{
    const r = STATE.resources.find(x=>x.id===m.id); if(!r) return '';
    const c  = CATS[r.cat]||CATS.other;
    const sc = m.score>=8 ? '#34d399' : m.score>=5 ? '#f59e0b' : '#94a3b8';
    return `<div class="ai-card">
      <div class="u-flex u-gap-md" style="align-items:flex-start">
        <div style="width:30px;height:30px;border-radius:50%;background:rgba(${hr(sc)},.18);border:1.5px solid ${sc};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${sc};flex-shrink:0">${m.score}</div>
        <div style="flex:1;min-width:0">
          <div class="u-flex u-items-center u-gap-sm" style="margin-bottom:3px;flex-wrap:wrap">
            <span style="font-size:13px;font-weight:700;color:#fff">${r.name}</span>
            <span style="padding:2px 7px;border-radius:4px;background:${c.b};color:${c.c};font-size:9px;font-weight:700;border:1px solid ${c.c}44">${c.l}</span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:5px">📍 ${r.addr}</div>
          <div style="font-size:11px;color:var(--purple-light);margin-bottom:7px;line-height:1.65">↳ ${m.reason}</div>
          ${see && r.contact.name
            ? `<div style="font-size:11px;color:rgba(255,255,255,.55);margin-bottom:7px">联系人：${r.contact.name}${r.contact.tel?' · '+r.contact.tel:''}</div>`
            : `<div style="font-size:10px;color:var(--text-faint);margin-bottom:7px">🔒 联系方式 VIP 可见</div>`}
          <button onclick="showDetail(${r.id});closeMo();" class="btn btn-ghost" style="padding:3px 11px;font-size:10px">查看完整详情 →</button>
        </div>
      </div>
    </div>`;
  }).join('');

  res.innerHTML = `
    <div style="border-top:1.5px solid var(--border);padding-top:13px;margin-top:5px">
      <div class="card-surface" style="margin-bottom:11px;font-size:12px;color:rgba(255,255,255,.65);line-height:1.8">${parsed.summary||''}</div>
      <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:9px;font-weight:700">匹配结果 (${(parsed.matches||[]).length} 条)</div>
      ${items || '<div style="font-size:11px;color:var(--text-faint);padding:10px 0">未找到匹配资源，建议完善资源库后重试</div>'}
      ${parsed.suggestions
        ? `<div class="card-amber" style="margin-top:11px;border-radius:var(--radius-md);padding:10px;font-size:11px;color:var(--gold-light);line-height:1.7">💡 ${parsed.suggestions}</div>`
        : ''}
      <div style="margin-top:10px;font-size:9px;color:var(--text-faint);text-align:center">✓ 本次查询已记录并通知管理员</div>
    </div>`;
}
