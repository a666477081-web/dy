/* ════════════════════════════════════════
   AUTH.JS — Supabase 云端版本
   Resource Atlas | DYFTZ
════════════════════════════════════════ */

// 1. 初始化 Supabase 连接
const SUPABASE_URL = 'https://imjdfpywvsnenxfxxglg.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-NvzWA-j2TXGILOPPewF5Q_OdKhnr-s; 
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 渲染登录页面
function renderLogin(){
  $('lf').innerHTML=`
    <div style="margin-bottom:24px">
      <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:5px">账号登录</div>
      <div style="font-size:12px;color:var(--text-muted)">DYFTZ 云端数据库同步系统</div>
    </div>
    <div class="u-flex-col u-gap-md">
      <div><label class="lbl">用户名</label><input class="fi" id="li-un" placeholder="输入用户名" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div><label class="lbl">密码</label><input class="fi" id="li-pw" type="password" placeholder="输入密码" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div id="li-err" class="alert alert-error"></div>
      <button class="btn btn-primary u-full-width" id="login-btn" onclick="doLogin()" style="margin-top:4px">登 录</button>
    </div>
    <div style="margin-top:18px;text-align:center;font-size:12px;color:var(--text-muted)">
      尚未有账号？<button onclick="renderReg()" style="background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;text-decoration:underline">申请注册</button>
    </div>`;
}

// 3. 执行登录逻辑
async function doLogin(){
  const un=($('li-un').value||'').trim(), pw=($('li-pw').value||'').trim();
  const e=$('li-err'), btn=$('login-btn');
  if(!un || !pw) return showAlert(e, '请输入用户名和密码');

  btn.disabled = true; btn.textContent = '验证中...';

  // 使用初始化好的 sb 客户端查询
  const { data: user, error } = await sb
    .from('users')
    .select('*')
    .eq('username', un)
    .eq('password', pw)
    .single();

  if(error || !user){
    showAlert(e, '用户名或密码错误');
    btn.disabled = false; btn.textContent = '登 录';
    return;
  }

  // 检查是否审核通过
  if(!user.approved && user.role !== 'admin'){
    showAlert(e, '账号待审核，请联系管理员');
    btn.disabled = false; btn.textContent = '登 录';
    return;
  }

  e.classList.remove('show');
  STATE.cu = user; 
  showApp();
}

// 4. 执行注册逻辑
async function doReg(){
  const un=($('r-un').value||'').trim(), name=($('r-name').value||'').trim(),
        email=($('r-email').value||'').trim(), pw=($('r-pw').value||'').trim(),
        pw2=($('r-pw2').value||'').trim(), org=($('r-org').value||'').trim();
  const e=$('r-err'), ok=$('r-ok'), btn=$('r-btn');

  if(!un||!name||!email||!pw){ showAlert(e,'请填写所有必填项'); return; }
  if(pw!==pw2){ showAlert(e,'两次密码不一致'); return; }

  btn.disabled = true; btn.textContent = '提交中...';

  // 使用初始化好的 sb 客户端插入
  const { error } = await sb
    .from('users')
    .insert([
      { username: un, password: pw, name: name, role: 'editor', approved: false }
    ]);

  if(error){
    showAlert(e, '注册失败：' + error.message);
    btn.disabled = false; btn.textContent = '提交申请';
  } else {
    ok.innerHTML='✓ 注册申请已提交成功，请等待审核';
    ok.classList.add('show');
    e.classList.remove('show');
    btn.style.display = 'none';
  }
}

// 5. 渲染注册页面
function renderReg(){
  $('lf').innerHTML=`
    <div style="margin-bottom:18px">
      <div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px">申请注册账号</div>
    </div>
    <div class="u-flex-col u-gap-md">
      <div class="grid-2">
        <div><label class="lbl">用户名 *</label><input class="fi" id="r-un" placeholder="英文/拼音"></div>
        <div><label class="lbl">姓名 *</label><input class="fi" id="r-name" placeholder="真实姓名"></div>
      </div>
      <div><label class="lbl">邮箱 *</label><input class="fi" id="r-email" type="email" placeholder="email@example.com"></div>
      <div class="grid-2">
        <div><label class="lbl">密码 *</label><input class="fi" id="r-pw" type="password"></div>
        <div><label class="lbl">确认密码 *</label><input class="fi" id="r-pw2" type="password"></div>
      </div>
      <div><label class="lbl">机构 / 申请用途</label><textarea class="fi" id="r-org" rows="2" placeholder="机构名称及申请用途..."></textarea></div>
      <div id="r-err" class="alert alert-error"></div>
      <div id="r-ok" class="alert alert-success"></div>
      <button class="btn btn-primary u-full-width" id="r-btn" onclick="doReg()">提交申请</button>
    </div>
    <div style="margin-top:13px;text-align:center">
      <button onclick="renderLogin()" style="background:none;border:none;color:var(--text-muted);font-size:11px;cursor:pointer">← 返回登录</button>
    </div>`;
}

function doLogout(){
  STATE.cu=null;
  $('av').style.display='none'; 
  $('lv').style.display='flex';
  renderLogin();
}

function showAlert(el, msg){ 
  el.textContent=msg; 
  el.classList.add('show'); 
}
