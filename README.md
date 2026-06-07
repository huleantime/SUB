# CF-SUB-LEAN

> 基于 CF-Workers-SUB 修改的 Cloudflare Workers 订阅聚合工具。
>
> 保留原项目核心订阅处理能力，在此基础上进行了界面重构、移动端优化、访客订阅页面、后台登录验证等增强，更适合作为个人订阅管理面板使用。

## 项目简介

CF-SUB-LEAN 是基于 CF-Workers-SUB 的个人维护版本。

与原版相比，本项目主要专注于：

- Apple 风格液态玻璃 UI
- 手机端优先的管理体验
- 简洁的订阅展示页面
- 访客订阅模式
- Cloudflare KV 在线编辑
- ADMIN_USER / ADMIN_PASS 后台登录验证
- Cookie 登录保持
- 移除部分非必要展示内容

## 项目来源

本项目基于以下开源项目进行修改：

- 原项目：https://github.com/cmliu/CF-Workers-SUB

保留原项目核心订阅处理逻辑与订阅转换能力。

感谢原作者的开源贡献。

## 功能特性

- 聚合多个订阅链接和节点内容
- 支持 Base64、Clash、Sing-box、Surge、Loon 等格式
- 支持订阅转换后端
- 支持 Cloudflare KV 在线编辑
- 支持访客订阅页面
- 支持二维码生成与复制订阅链接
- 支持 Telegram 访问通知
- 支持后台登录验证
- 支持移动端优化界面
- 支持自定义页面标题与订阅名称

## 访问方式

### 主订阅入口

```text
https://你的域名/auto
```

或：

```text
https://你的域名/?token=auto
```

如果修改了 TOKEN，请将 auto 替换为自己的 Token。

### 访客订阅入口

配置 GUEST 或 GUESTTOKEN 后可访问：

```text
https://你的域名/你的GUEST值
```

### 管理后台

绑定 KV 后访问：

```text
https://你的域名/你的TOKEN
```

如果配置：

```text
ADMIN_USER
ADMIN_PASS
```

将先进入登录页面。

登录成功后可：

- 编辑订阅内容
- 保存至 Cloudflare KV
- 查看各种订阅格式链接
- 查看访客订阅链接
- 管理聚合内容

## 环境变量

### 基础配置

| 变量名 | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| TOKEN | ✅ | auto | 主订阅 Token |
| LINK | ❌ | vmess://... | 节点内容或订阅内容 |
| LINKSUB | ❌ | https://sub.example.com/sub | 额外订阅链接 |
| SUBNAME | ❌ | CF-SUB-LEAN | 页面标题与订阅名称 |
| GUESTTOKEN / GUEST | ❌ | guest | 访客订阅 Token |

### 后台登录

| 变量名 | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| ADMIN_USER | ❌ | admin | 管理后台用户名 |
| ADMIN_PASS | ❌ | 123456 | 管理后台密码 |

说明：

- 两个变量必须同时设置才会启用登录验证。
- 未设置时可直接访问后台。
- 设置后访问 TOKEN 页面会先进入登录界面。

### 订阅转换

| 变量名 | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| SUBAPI | ❌ | api.v1.mk | 订阅转换后端 |
| SUBCONFIG | ❌ | URL | 订阅转换配置 |
| SUBUPTIME | ❌ | 6 | 更新时间（小时） |

### Telegram 通知

| 变量名 | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| TGTOKEN | ❌ | 123456:ABC | Telegram Bot Token |
| TGID | ❌ | 123456789 | Telegram 用户 ID |
| TG | ❌ | 1 | 开启详细访问通知 |

### 其他配置

| 变量名 | 是否必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| URL302 | ❌ | https://google.com | 非法访问跳转地址 |
| URL | ❌ | https://example.com | 非法访问反代目标 |
| WARP | ❌ | vmess://... | 追加 WARP 节点 |

## 快速搭建教程

### 方式一：Cloudflare Dashboard（推荐）

#### 第一步：创建 Worker

1. 登录 Cloudflare Dashboard
2. 打开 Workers & Pages
3. 创建 Worker
4. 删除默认代码
5. 粘贴 `_worker.js`
6. 点击 Deploy

#### 第二步：配置环境变量

进入：

```text
Settings → Variables and Secrets
```

最小配置示例：

```text
TOKEN=auto
SUBNAME=CF-SUB-LEAN
```

启用后台登录示例：

```text
TOKEN=auto
ADMIN_USER=admin
ADMIN_PASS=123456
```

启用访客订阅示例：

```text
TOKEN=auto
GUESTTOKEN=guest
```

#### 第三步：绑定 KV

创建 KV Namespace。

例如：

```text
CF-SUB-LEAN
```

然后绑定到 Worker：

```text
KV
```

注意名称必须是：

```text
KV
```

#### 第四步：访问后台

例如：

```text
TOKEN=auto
```

后台地址：

```text
https://你的域名/auto
```

如果启用了 ADMIN_USER 与 ADMIN_PASS：

```text
https://你的域名/auto
↓
登录页面
↓
订阅管理后台
```

### 方式二：Wrangler 部署

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

首次部署后再到 Cloudflare Dashboard 配置环境变量与 KV。

## 常见使用场景

### 个人使用

```text
TOKEN=auto
SUBNAME=我的订阅
```

### 开启访客订阅

```text
TOKEN=auto
GUESTTOKEN=guest
```

访客访问：

```text
https://域名/guest
```

### 开启后台密码

```text
TOKEN=auto
ADMIN_USER=admin
ADMIN_PASS=123456
```

访问后台时需要先登录。

## KV 配置

启用在线编辑功能需要绑定 KV：

```toml
[[kv_namespaces]]
binding = "KV"
id = "你的KV命名空间ID"
```

注意：binding 名称必须为 KV。

## 部署方式

### Cloudflare Dashboard

直接将 `_worker.js` 内容复制到 Cloudflare Workers 后保存部署。

### Wrangler

```bash
wrangler deploy
```

## 与原版的主要区别

- 调整前端视觉风格
- Apple 液态玻璃设计
- 手机端优先布局
- 默认隐藏部分无关展示内容
- 增加访客订阅页面
- 增加后台登录验证
- 增加 Cookie 登录保持
- 优化订阅管理体验

## 免责声明

本项目仅供学习与技术研究使用。

请遵守当地法律法规及相关服务条款。

因使用本项目造成的任何后果由使用者自行承担。

## 致谢

感谢 CF-Workers-SUB 项目及其贡献者。

如果你喜欢本项目，也请为原项目点一个 Star。
