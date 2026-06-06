# SUB

这是我自己维护的 Cloudflare Worker 汇聚订阅工具，用来把多个节点链接和订阅链接整理成一个统一入口。页面已经改成 Apple 液态玻璃风格，手机端优先显示“汇聚订阅编辑”，方便直接维护订阅内容。

## 功能

- 支持把自建节点和订阅链接汇聚成一个订阅入口。
- 支持 Base64、Clash、Sing-box、Surge、Loon 等订阅格式。
- 支持 Cloudflare KV 在线编辑订阅内容。
- 支持访客订阅 Token，只开放订阅功能，不开放配置页。
- 支持复制订阅地址并生成二维码。
- 支持可选 Telegram 通知，但不会在页面展示访问设备 UA。

## 项目文件

- `_worker.js`: Worker 主程序，也是前端页面所在文件。
- `wrangler.toml`: Wrangler 部署配置。
- `LICENSE`: 开源许可证。

## 访问方式

默认订阅入口是：

```text
https://你的域名/auto
```

也可以使用：

```text
https://你的域名/?token=auto
```

如果你在环境变量里修改了 `TOKEN`，就把上面的 `auto` 换成自己的 Token。

## 页面使用

绑定 KV 后，访问自己的 Token 地址，例如：

```text
https://你的域名/auto
```

手机端打开后，最上方会优先显示“汇聚订阅编辑”。把节点链接或订阅链接按“一行一个”填进去，点击保存即可。

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `TOKEN` | 推荐 | 主订阅入口 Token，默认是 `auto` |
| `GUEST` / `GUESTTOKEN` | 可选 | 访客订阅 Token |
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

这个仓库是我的个人维护版本，主要目标是自用、干净、好操作。前端页面已经去掉无关推广信息，并针对手机管理订阅做了布局优化。
