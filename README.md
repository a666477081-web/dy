# Resource Atlas · 资源图谱管理系统
## DYFTZ 全球资源整合 · AI 智能匹配平台

---

## 文件结构

```
resource-atlas/
├── index.html              ← 网站入口页面
├── README.md               ← 本文件
├── css/
│   ├── base.css            ← 变量、重置、字体、工具类
│   ├── components.css      ← 按钮、表单、徽章、卡片
│   └── layout.css          ← 登录布局、应用框架、面板、弹窗
├── js/
│   ├── config.js           ← ⚙️ 配置项（后端地址、配额等）
│   ├── data.js             ← 资源分类定义、演示数据
│   ├── utils.js            ← 工具函数（日期、权限、导出等）
│   ├── auth.js             ← 登录 / 注册 / 退出
│   ├── map.js              ← Leaflet 地图初始化与标注
│   ├── resources.js        ← 资源列表、详情、添加、审核、删除
│   ├── ai.js               ← AI 智能匹配引擎
│   ├── admin.js            ← 管理员面板（统计、有效期、用户、日志）
│   └── app.js              ← 应用主入口、顶栏、侧边栏
└── assets/
    └── icons/
        └── favicon.svg     ← 网站图标
```

---

## 演示账号

| 角色     | 用户名   | 密码     | 权限说明                    |
|----------|----------|----------|-----------------------------|
| 管理员   | admin    | admin888 | 全部权限、用户审核、数据导出 |
| VIP用户  | vip001   | vip888   | 查看联系方式、下载附件       |
| 资源用户 | user001  | user888  | 标注资源、查看自己的联系方式 |

---

## 部署到 GitHub Pages（第一步）

1. 在 GitHub 新建仓库（例如 `resource-atlas`），或直接上传到现有 dyftz.com 仓库的子文件夹。
2. 将本文件夹中所有文件按原目录结构上传，保持 `css/`、`js/`、`assets/` 文件夹层级不变。
3. 进入仓库 Settings → Pages → Source 选择 `main` 分支 → 根目录（或对应子目录）→ Save。
4. 访问地址为 `https://你的用户名.github.io/resource-atlas/`。
5. 绑定自定义域名：在 Pages 设置的 Custom Domain 中填写 `atlas.dyftz.com`，然后在 DNS 管理后台添加 CNAME 记录，将 `atlas` 指向 `你的用户名.github.io`。

---

## 配置后端（正式上线必须完成）

编辑 `js/config.js`，填写以下参数：

```javascript
const CONFIG = {
  SUPABASE_URL:      'https://你的项目ID.supabase.co',
  SUPABASE_ANON_KEY: '你的 anon public key',
  AI_EDGE_FN:        'https://你的项目ID.supabase.co/functions/v1/ai-match',
  ADMIN_EMAIL:       'admin@dyftz.com',
  DEMO_MODE:         false,  // 改为 false 启用真实后端
};
```

### Supabase 注册步骤

1. 访问 https://supabase.com，用 GitHub 账号登录。
2. New Project → 填写项目名 `resource-atlas`，选区 Singapore → 创建。
3. 创建完成后进入 Project Settings → API，复制 Project URL 和 anon public key。
4. 将这两个值填入 `js/config.js` 的对应位置。
5. 进入 SQL Editor，联系系统供应商获取建表 SQL，粘贴运行即可建立所有数据表。

### Claude API（AI 匹配）配置

1. 访问 https://console.anthropic.com 注册账号，获取 API Key。
2. 在 Supabase → Edge Functions → 新建函数 `ai-match`，将 API Key 存储在 Supabase Secrets 中。
3. 将 Edge Function 的 URL 填入 `js/config.js` 的 `AI_EDGE_FN`。

**注意：** 未配置后端时，系统以演示模式运行（数据保存在浏览器内存中，刷新后重置），AI 匹配功能使用关键词匹配作为替代。

---

## 依赖说明（均为 CDN，无需安装）

- Leaflet.js 1.9.4（地图引擎）
- OpenStreetMap（地图底图，全球可用，含中国大陆，无需 API Key）
