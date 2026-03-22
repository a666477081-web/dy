/* ════════════════════════════════════════
   AUTH.JS — Login · Register · Session
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

function buildDemoList(){
  $('demoL').innerHTML = STATE.users.filter(u=>u.approved).slice(0,3).map(u=>
    `<div class="demo-item" onclick="fillCreds('${u.un}','${u.pw}')">
      <span class="demo-item__name">${u.name}</span>
      <span style="font-size:9px;color:${rc(u.role)};margin-left:5px">[${rl(u.role)}]</span>
      <div class="demo-item__creds u-mono">${u.un} / ${u.pw}</div>
    </div>`
  ).join('') + `<div class="demo-hint">↑ 点击账号自动填入</div>`;
}

function fillCreds(u,p){
  const a=$('li-un'), b=$('li-pw');
  if(a) a.value=u;
  if(b) b.value=p;
}

function renderLogin(){
  $('lf').innerHTML=`
    <div style="margin-bottom:24px">
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:5px">账号登录</div>
      <div style="font-size:12px;color:var(--text-muted)">DYFTZ 资源图谱 AI 匹配系统</div>
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">用户名</label><input class="fi" id="li-un" placeholder="输入用户名" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div><label class="lbl">密码</label><input class="fi" id="li-pw" type="password" placeholder="输入密码" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div id="li-err" class="alert alert-error"></div>
      <button class="btn btn-primary u-full-width" onclick="doLogin()" style="margin-top:4px">登 录</button>
    </div>
    <div style="margin-top:18px;text-align:center;font-size:12px;color:var(--text-muted)">
      尚未有账号？<button onclick="renderReg()" style="background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;text-decoration:underline">申请注册</button>
    </div>`;
}

function renderReg(){
  $('lf').innerHTML=`
    <div style="margin-bottom:18px">
      <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px">申请注册账号</div>
      <div style="font-size:11px;color:var(--text-muted)">提交后等待管理员审核，审核通过方可登录</div>
    </div>
    <div class="u-flex-col u-gap-md">
      <div class="grid-2">
        <div><label class="lbl">用户名 *</label><input class="fi" id="r-un" placeholder="英文或拼音"></div>
        <div><label class="lbl">真实姓名 *</label><input class="fi" id="r-name" placeholder="姓名"></div>
      </div>
      <div><label class="lbl">联系邮箱 *</label><input class="fi" id="r-email" type="email" placeholder="work@example.com"></div>
      <div class="grid-2">
        <div><label class="lbl">设置密码 *</label><input class="fi" id="r-pw" type="password" placeholder="至少6位"></div>
        <div><label class="lbl">确认密码 *</label><input class="fi" id="r-pw2" type="password" placeholder="再次输入"></div>
      </div>
      <div><label class="lbl">机构 / 申请用途</label><textarea class="fi" id="r-org" rows="2" placeholder="机构名称及申请用途..."></textarea></div>
      <div id="r-err" class="alert alert-error"></div>
      <div id="r-ok" class="alert alert-success"></div>
      <button class="btn btn-primary u-full-width" id="r-btn" onclick="doReg()">提交注册申请</button>
    </div>
    <div style="margin-top:13px;text-align:center">
      <button onclick="renderLogin()" style="background:none;border:none;color:var(--text-muted);font-size:11px;cursor:pointer">← 返回登录</button>
    </div>`;
}

function doLogin(){
  const un=($('li-un').value||'').trim(), pw=($('li-pw').value||'').trim();
  const e=$('li-err');
  const u=STATE.users.find(x=>x.un===un&&x.pw===pw);
  if(!u){ showAlert(e,'用户名或密码错误，请重新输入'); return; }
  if(!u.approved){ showAlert(e,'账号等待管理员审核中，审核通过后可登录'); return; }
  e.classList.remove('show');
  STATE.cu=u;
  showApp();
}

function doReg(){
  const un=($('r-un').value||'').trim(), name=($('r-name').value||'').trim(),
        email=($('r-email').value||'').trim(), pw=($('r-pw').value||'').trim(),
        pw2=($('r-pw2').value||'').trim(), org=($('r-org').value||'').trim();
  const e=$('r-err'), ok=$('r-ok');
  if(!un||!name||!email||!pw){ showAlert(e,'请填写所有必填项（*）'); return; }
  if(pw.length<6){ showAlert(e,'密码至少需要6位'); return; }
  if(pw!==pw2){ showAlert(e,'两次密码不一致，请检查'); return; }
  if(STATE.users.find(x=>x.un===un)){ showAlert(e,'该用户名已被使用，请更换'); return; }
  e.classList.remove('show');
  STATE.users.push({id:'u'+Date.now(),un,pw,role:'editor',name,email,tel:'',org,approved:false,reg:today()});
  ok.innerHTML='✓ 注册申请已提交成功<br><span style="font-size:10px;opacity:.75">等待管理员审核，审核通过后请使用您的账号密码登录</span>';
  ok.classList.add('show');
  const b=$('r-btn'); if(b){ b.disabled=true; b.style.opacity='.38'; }
}

function doLogout(){
  STATE.cu=null;
  $('av').style.display='none'; $('lv').style.display='flex';
  $('dp').classList.remove('open'); STATE.activeId=null;
  renderLogin();
}

function showAlert(el, msg){ el.textContent=msg; el.classList.add('show'); }
