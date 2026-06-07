# SUB

这是基于 CF-Workers-SUB 项目修改的 Cloudflare Worker 汇聚订阅工具，用来把多个节点链接和订阅链接整理成一个统一入口。我主要调整了前端页面样式与交互逻辑，移除了索引链接等非必要内容，并优化了手机端管理体验。页面采用 Apple 液态玻璃风格，手机端优先显示“汇聚订阅编辑”，方便直接维护订阅内容。
## 项目来源

本项目基于 CF-Workers-SUB 进行修改：

- 原项目：https://github.com/cmliu/CF-Workers-SUB
- 保留原项目核心订阅处理逻辑。
- 主要改动为前端界面优化、移动端布局调整、移除索引链接以及部分交互体验改进。

感谢原作者的开源贡献。

## 功能

- 支持把自建节点和订阅链接汇聚成一个订阅入口。
- 支持 Base64、Clash、Sing-box、Surge、Loon 等订阅格式。
- 支持 Cloudflare KV 在线编辑订阅内容。
- 支持访客订阅模式（通过 `GUEST` 或 `GUESTTOKEN` 环境变量）。
- 支持复制订阅地址并生成二维码。
- 支持可选 Telegram 通知，但不会在页面展示访问设备 UA。

## 项目文件

- `_worker.js`: Worker 主程序，也是前端页面所在文件。
- `wrangler.toml`: Wrangler 部署配置。
- `LICENSE`: 开源许可证。

## 访问方式

**主订阅入口**：

```text
https://你的域名/auto
```

或使用 query 参数：

```text
https://你的域名/?token=auto
```

**访客订阅入口**（如果配置了 `GUEST` 环境变量）：

```text
https://你的域名/你的GUEST值
```

如果在环境变量里修改了 `TOKEN`，就把上面的 `auto` 换成自己的 Token。

## 页面使用

**管理页面**（需要绑定 KV）：访问自己的 Token 地址，例如 `https://你的域名/auto`，手机端打开后可编辑订阅内容。

**访客页面**（如配置了 GUEST）：访客可以访问访客订阅链接，查看可用的订阅格式（自适应、Base64、Clash、Sing-box、Surge、Loon），并复制或生成二维码。

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `TOKEN` | 推荐 | 主订阅入口 Token，默认是 `auto` |
| `GUESTTOKEN` 或 `GUEST` | 可选 | 访客订阅 Token（用于访客模式的路径和链接） |
| `ADMIN_USER` | 可选 | 管理页面用户名（需同时设置 ADMIN_PASS） |
| `ADMIN_PASS` | 可选 | 管理页面密码（需同时设置 ADMIN_USER） |
| `LINK` | 可选 | 未绑定 KV 时使用的节点或订阅内容 |
| `LINKSUB` | 可选 | 额外订阅链接 |
| `SUBNAME` | 可选 | 页面标题和订阅名称 |
| `SUBAPI` | 可选 | 订阅转换后端 |
| `SUBCONFIG` | 可选 | 订阅转换配置文件 |
| `SUBUPTIME` | 可选 | 订阅更新时间，单位小时 |
| `TGTOKEN` | 可选 | Telegram Bot Token |
| `TGID` | 可选 | Telegram 接收通知的 ID |
| `TG` | 可选 | 设置为 `1` 时启用更多访问通知 |
| `URL302` | 可选 | 非法访问时 302 跳转地址 |
| `URL` | 可选 | 非法访问时反代目标 |
| `WARP` | 可选 | 额外追加的 WARP 节点内容 |

## KV 绑定

如果要使用网页编辑功能，需要在 Cloudflare 里绑定 KV 命名空间：

```toml
[[kv_namespaces]]
binding = "KV"
id = "你的 KV namespace id"
```

`binding` 必须是 `KV`。

## 部署

使用 Wrangler 部署：

```bash
wrangler deploy
```

也可以把 `_worker.js` 内容复制到 Cloudflare Worker 在线编辑器里部署。

## 说明

这个仓库是基于 CF-Workers-SUB 的个人维护版本，主要目标是自用、干净、好操作。在保留原项目核心功能的基础上，对前端界面进行了调整，移除了部分非必要展示内容，并针对手机管理订阅做了布局优化。
