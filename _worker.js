
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'SUB-OPENTIME';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "subconverter.opentime.uk"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		const normalizedPath = (url.pathname.replace(/\/+$/, '') || '/').toLowerCase();
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		const guestPath = normalizedPath === ('/' + (String(访客订阅 || '').toLowerCase()));
		const guestOnlyPage = guestPath && !url.search;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		const allowedPath = [mytoken, fakeToken, 访客订阅].includes(token) || normalizedPath === "/" + mytoken || normalizedPath === "/" + 访客订阅 || guestPath;
		if (!allowedPath) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (guestOnlyPage) {
				return new Response(renderGuestPage(url, 访客订阅, subProtocol, subConverter, subConfig), {
					headers: { 'Content-Type': 'text/html;charset=utf-8' }
				});
			}
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search && !guestPath) {
					// 身份验证检查
					const adminUser = env.ADMIN_USER || '';
					const adminPass = env.ADMIN_PASS || '';
					const inputUser = url.searchParams.get('admin_user') || '';
					const inputPass = url.searchParams.get('admin_pass') || '';
					
					if (adminUser && adminPass) {
						if (inputUser !== adminUser || inputPass !== adminPass) {
							return new Response(renderLoginPage(url), {
								headers: { 'Content-Type': 'text/html;charset=utf-8' }
							});
						}
					}
					
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function renderLoginPage(url) {
	return `<!DOCTYPE html>
<html>
<head>
	<title>管理员登录 - ${FileName}</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		:root { color-scheme: light; --text: #172033; --accent: #147efb; --shadow: 0 24px 70px rgba(51, 71, 110, 0.22); }
		* { box-sizing: border-box; }
		body { margin: 0; padding: 24px; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif; background: linear-gradient(135deg, #f5fbff 0%, #eef4f9 48%, #f7f2ed 100%); display: flex; align-items: center; justify-content: center; }
		.login-container { max-width: 360px; width: 100%; }
		.login-card { background: rgba(255, 255, 255, 0.70); backdrop-filter: blur(28px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.56); border-radius: 22px; padding: 40px 24px; box-shadow: var(--shadow); }
		h1 { margin: 0 0 24px; font-size: 24px; color: var(--text); text-align: center; }
		.form-group { margin-bottom: 16px; }
		label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
		input { width: 100%; padding: 10px 12px; border: 1px solid rgba(255, 255, 255, 0.72); border-radius: 8px; background: rgba(255, 255, 255, 0.58); font-size: 14px; color: var(--text); font-family: inherit; }
		input:focus { outline: none; background: rgba(255, 255, 255, 0.82); border-color: var(--accent); }
		button { width: 100%; padding: 10px 12px; border: none; border-radius: 8px; background: var(--accent); color: white; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 24px; }
		button:hover { opacity: 0.9; }
	</style>
</head>
<body>
	<div class="login-container">
		<div class="login-card">
			<h1>管理员登录</h1>
			<form method="GET">
				<div class="form-group">
					<label for="user">用户名</label>
					<input type="text" id="user" name="admin_user" required autofocus>
				</div>
				<div class="form-group">
					<label for="pass">密码</label>
					<input type="password" id="pass" name="admin_pass" required>
				</div>
				<button type="submit">登录</button>
			</form>
		</div>
	</div>
</body>
</html>`;
}

function renderGuestPage(url, guest, subProtocol, subConverter, subConfig) {
	const guestEsc = encodeURIComponent(String(guest || 'guest'));
	const guestBase = `https://${url.hostname}/${guestEsc}`;
	return `<!DOCTYPE html>
	<html>
	<head>
		<title>访客订阅 - ${FileName}</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style>
			:root { color-scheme: light; --text: #172033; --muted: rgba(23, 32, 51, 0.64); --line: rgba(255, 255, 255, 0.56); --shadow: 0 24px 70px rgba(51, 71, 110, 0.22); --accent: #147efb; }
			body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif; background: linear-gradient(135deg, #f5fbff 0%, #eef4f9 48%, #f7f2ed 100%); }
			.shell { max-width: 980px; margin: 0 auto; }
			.glass { border: 1px solid var(--line); border-radius: 22px; background: rgba(255, 255, 255, 0.70); backdrop-filter: blur(28px) saturate(180%); -webkit-backdrop-filter: blur(28px) saturate(180%); box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.72); padding: 20px; }
			.header { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; margin-bottom: 20px; }
			.link-list { display: grid; gap: 14px; margin-top: 20px; }
			.link-row { display: grid; grid-template-columns: 100px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.72); }
			.link-name { font-weight: 700; color: rgba(23, 32, 51, 0.78); }
			.link-url { color: var(--accent); text-decoration: none; overflow-wrap: anywhere; word-break: break-all; white-space: normal; }
			.action-btn { min-height: 36px; border: 1px solid rgba(255,255,255,0.72); border-radius: 999px; background: rgba(255,255,255,0.58); color: var(--text); cursor: pointer; }
			.action-btn:hover { background: rgba(255,255,255,0.82); }
			.guest-token { display: block; margin-top: 6px; overflow-wrap: anywhere; }
			.toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%) translateY(18px); padding: 10px 14px; border: 1px solid var(--line); border-radius: 999px; background: rgba(28, 32, 41, 0.72); color: white; backdrop-filter: blur(22px) saturate(160%); opacity: 0; pointer-events: none; transition: opacity 180ms ease, transform 180ms ease; }
			.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
		</style>
		<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
	</head>
	<body>
		<div class="shell">
			<div class="header">
				<div>
					<h1>${FileName} 访客订阅</h1>
				</div>
			</div>
			<div class="glass">
				<h2>访客订阅链接</h2>
				<p class="guest-token">Token: ${guest}</p>
				<div class="link-list">
					<div class="link-row">
						<span class="link-name">自适应</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}','guest_0')">${guestBase}</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}','guest_0')">复制</button>
					</div>
					<div id="guest_0" class="qrcode"></div>
					<div class="link-row">
						<span class="link-name">Base64</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}?b64','guest_1')">${guestBase}?b64</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}?b64','guest_1')">复制</button>
					</div>
					<div id="guest_1" class="qrcode"></div>
					<div class="link-row">
						<span class="link-name">Clash</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}?clash','guest_2')">${guestBase}?clash</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}?clash','guest_2')">复制</button>
					</div>
					<div id="guest_2" class="qrcode"></div>
					<div class="link-row">
						<span class="link-name">Sing-box</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}?sb','guest_3')">${guestBase}?sb</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}?sb','guest_3')">复制</button>
					</div>
					<div id="guest_3" class="qrcode"></div>
					<div class="link-row">
						<span class="link-name">Surge</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}?surge','guest_4')">${guestBase}?surge</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}?surge','guest_4')">复制</button>
					</div>
					<div id="guest_4" class="qrcode"></div>
					<div class="link-row">
						<span class="link-name">Loon</span>
						<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('${guestBase}?loon','guest_5')">${guestBase}?loon</a>
						<button class="action-btn" onclick="copyToClipboard('${guestBase}?loon','guest_5')">复制</button>
					</div>
					<div id="guest_5" class="qrcode"></div>
				</div>
			</div>
		</div>
		<div id="toast" class="toast"></div>
		<script>
		function showToast(message) {
			const toast = document.getElementById('toast');
			if (!toast) return;
			toast.textContent = message;
			toast.classList.add('show');
			clearTimeout(window.__toastTimer);
			window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
		}
		function copyToClipboard(text, qrcode) {
			navigator.clipboard.writeText(text)
				.then(() => showToast('已复制，并生成二维码'))
				.catch(err => {
					console.error('复制失败:', err);
					showToast('复制失败，请手动复制');
				});
			const qrcodeDiv = document.getElementById(qrcode);
			if (!qrcodeDiv) return;
			qrcodeDiv.innerHTML = '';
			new QRCode(qrcodeDiv, { text: text, width: 220, height: 220, colorDark: "#111827", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.Q, scale: 1 });
			qrcodeDiv.style.display = 'block';
		}
		</script>
	</body>
	</html>`;
}
function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
						<style>
							:root {
								color-scheme: light;
								--text: #172033;
								--muted: rgba(23, 32, 51, 0.64);
								--line: rgba(255, 255, 255, 0.56);
								--glass: rgba(255, 255, 255, 0.46);
								--glass-strong: rgba(255, 255, 255, 0.68);
								--shadow: 0 24px 70px rgba(51, 71, 110, 0.22);
								--accent: #147efb;
								--accent-2: #30d158;
								--danger: #ff3b30;
							}
							* {
								box-sizing: border-box;
							}
							body {
								min-height: 100vh;
								margin: 0;
								padding: 24px;
								font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
								font-size: 14px;
								line-height: 1.5;
								color: var(--text);
								background:
									radial-gradient(circle at 12% 18%, rgba(48, 209, 88, 0.22), transparent 28%),
									radial-gradient(circle at 86% 8%, rgba(20, 126, 251, 0.20), transparent 30%),
									radial-gradient(circle at 68% 82%, rgba(255, 149, 0, 0.16), transparent 28%),
									linear-gradient(135deg, #f5fbff 0%, #eef4f9 48%, #f7f2ed 100%);
							}
							button, textarea {
								font: inherit;
							}
							.shell {
								width: min(1180px, 100%);
								margin: 0 auto;
							}
							.topbar {
								display: flex;
								align-items: flex-end;
								justify-content: space-between;
								gap: 18px;
								margin-bottom: 18px;
							}
							.brand h1 {
								margin: 0;
								font-size: clamp(26px, 4vw, 42px);
								font-weight: 750;
								letter-spacing: 0;
							}
							.brand p {
								margin: 6px 0 0;
								color: var(--muted);
							}
							.status-pill {
								display: inline-flex;
								align-items: center;
								gap: 8px;
								min-height: 36px;
								padding: 8px 12px;
								border: 1px solid var(--line);
								border-radius: 999px;
								background: rgba(255, 255, 255, 0.46);
								backdrop-filter: blur(24px) saturate(160%);
								-webkit-backdrop-filter: blur(24px) saturate(160%);
								box-shadow: 0 12px 40px rgba(51, 71, 110, 0.14);
								color: var(--muted);
								white-space: nowrap;
							}
							.dot {
								width: 9px;
								height: 9px;
								border-radius: 999px;
								background: var(--accent-2);
								box-shadow: 0 0 0 5px rgba(48, 209, 88, 0.16);
							}
							.grid {
								display: grid;
								grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
								gap: 18px;
								align-items: start;
							}
							.stack {
								display: grid;
								gap: 18px;
							}
							.glass {
								border: 1px solid var(--line);
								border-radius: 22px;
								background: linear-gradient(145deg, rgba(255, 255, 255, 0.70), rgba(255, 255, 255, 0.34));
								backdrop-filter: blur(28px) saturate(180%);
								-webkit-backdrop-filter: blur(28px) saturate(180%);
								box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.72);
							}
							.panel {
								padding: 20px;
							}
							.panel-head {
								display: flex;
								align-items: center;
								justify-content: space-between;
								gap: 12px;
								margin-bottom: 14px;
							}
							.panel-title {
								margin: 0;
								font-size: 16px;
								font-weight: 700;
								letter-spacing: 0;
							}
							.panel-subtitle {
								margin: 3px 0 0;
								color: var(--muted);
								font-size: 13px;
							}
							.guest-token {
								display: block;
								margin-top: 4px;
								overflow-wrap: anywhere;
							}
							.link-list {
								display: grid;
								gap: 10px;
							}
							.link-row {
								display: grid;
								grid-template-columns: 94px minmax(0, 1fr) auto;
								align-items: center;
								gap: 10px;
								min-height: 48px;
								padding: 10px;
								border: 1px solid rgba(255, 255, 255, 0.58);
								border-radius: 16px;
								background: rgba(255, 255, 255, 0.38);
							}
							.link-name {
								font-weight: 650;
								color: rgba(23, 32, 51, 0.78);
							}
							.link-url {
								overflow-wrap: anywhere;
								word-break: break-all;
								white-space: nowrap;
								color: var(--accent);
								text-decoration: none;
							}
							.link-url:hover {
								text-decoration: underline;
							}
							.action-btn, .save-btn, .toggle-btn {
								min-height: 36px;
								border: 1px solid rgba(255, 255, 255, 0.72);
								border-radius: 999px;
								background: rgba(255, 255, 255, 0.58);
								color: var(--text);
								box-shadow: 0 8px 26px rgba(51, 71, 110, 0.13);
								cursor: pointer;
								transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
							}
							.action-btn {
								width: 72px;
								padding: 7px 12px;
							}
							.action-btn:hover, .toggle-btn:hover {
								transform: translateY(-1px);
								background: rgba(255, 255, 255, 0.82);
							}
							.save-btn {
								padding: 8px 18px;
								background: linear-gradient(135deg, rgba(20, 126, 251, 0.95), rgba(10, 132, 255, 0.78));
								color: white;
							}
							.save-btn:disabled {
								cursor: wait;
								opacity: 0.72;
							}
							.toggle-btn {
								padding: 8px 14px;
							}
							.notice-content {
								display: none;
								margin-top: 14px;
							}
							.notice-content.is-open {
								display: grid;
								gap: 10px;
							}
							.config-list {
								display: grid;
								gap: 12px;
							}
							.config-item {
								padding: 12px;
								border-radius: 16px;
								background: rgba(255, 255, 255, 0.34);
								border: 1px solid rgba(255, 255, 255, 0.54);
							}
							.config-label {
								display: block;
								margin-bottom: 4px;
								color: var(--muted);
								font-size: 12px;
								font-weight: 700;
								text-transform: uppercase;
							}
							.config-value {
								overflow-wrap: anywhere;
								font-weight: 650;
							}
							.editor-container {
								width: 100%;
							}
							.editor {
								width: 100%;
								min-height: 360px;
								margin: 0;
								padding: 16px;
								border: 1px solid rgba(255, 255, 255, 0.62);
								border-radius: 18px;
								outline: none;
								background: rgba(255, 255, 255, 0.50);
								color: #111827;
								font-family: "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
								font-size: 13px;
								line-height: 1.6;
								overflow-y: auto;
								resize: vertical;
								box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
							}
							.editor:focus {
								border-color: rgba(20, 126, 251, 0.55);
								box-shadow: 0 0 0 4px rgba(20, 126, 251, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.72);
							}
							.save-container {
								margin-top: 12px;
								display: flex;
								align-items: center;
								gap: 10px;
								flex-wrap: wrap;
							}
							.save-status {
								color: var(--muted);
							}
							.qrcode {
								display: none;
								width: fit-content;
								margin: 10px 0 0 104px;
								padding: 12px;
								border-radius: 18px;
								background: rgba(255, 255, 255, 0.72);
								border: 1px solid rgba(255, 255, 255, 0.74);
								box-shadow: 0 12px 32px rgba(51, 71, 110, 0.16);
							}
							.qrcode:has(canvas), .qrcode:has(img) {
								display: block;
							}
							.toast {
								position: fixed;
								left: 50%;
								bottom: 24px;
								transform: translateX(-50%) translateY(18px);
								padding: 10px 14px;
								border: 1px solid var(--line);
								border-radius: 999px;
								background: rgba(28, 32, 41, 0.72);
								color: white;
								backdrop-filter: blur(22px) saturate(160%);
								-webkit-backdrop-filter: blur(22px) saturate(160%);
								opacity: 0;
								pointer-events: none;
								transition: opacity 180ms ease, transform 180ms ease;
							}
							.toast.show {
								opacity: 1;
								transform: translateX(-50%) translateY(0);
							}
							.kv-missing {
								margin: 0;
								padding: 16px;
								border-radius: 16px;
								background: rgba(255, 59, 48, 0.10);
								border: 1px solid rgba(255, 59, 48, 0.24);
								color: #8a1f17;
							}
							@media (max-width: 860px) {
								body {
									padding: 16px;
								}
								.topbar, .grid {
									display: grid;
									grid-template-columns: 1fr;
								}
								.editor-panel {
									order: -1;
								}
								.link-row {
									grid-template-columns: 1fr;
								}
								.action-btn {
									width: 100%;
								}
								.qrcode {
									margin-left: 0;
								}
							}
						</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
						<div class="shell">
							<header class="topbar">
								<div class="brand">
									<h1>${FileName}</h1>
									<p>汇聚订阅管理台</p>
								</div>
								<div class="status-pill"><span class="dot"></span> Worker online</div>
							</header>
							<main class="grid">
								<section class="stack">
									<div class="glass panel">
										<div class="panel-head">
											<div>
												<h2 class="panel-title">订阅地址</h2>
												<p class="panel-subtitle">点击复制会同步生成二维码</p>
											</div>
										</div>
										<div class="link-list">
											<div class="link-row">
												<span class="link-name">自适应</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')">https://${url.hostname}/${mytoken}</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')">复制</button>
											</div>
											<div id="qrcode_0" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Base64</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')">https://${url.hostname}/${mytoken}?b64</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')">复制</button>
											</div>
											<div id="qrcode_1" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Clash</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')">https://${url.hostname}/${mytoken}?clash</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')">复制</button>
											</div>
											<div id="qrcode_2" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Sing-box</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')">https://${url.hostname}/${mytoken}?sb</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')">复制</button>
											</div>
											<div id="qrcode_3" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Surge</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')">https://${url.hostname}/${mytoken}?surge</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')">复制</button>
											</div>
											<div id="qrcode_4" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Loon</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')">https://${url.hostname}/${mytoken}?loon</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')">复制</button>
											</div>
											<div id="qrcode_5" class="qrcode"></div>
										</div>
									</div>
									<div class="glass panel">
										<div class="panel-head">
											<div>
												<h2 class="panel-title">访客订阅</h2>
												<p class="panel-subtitle">只能使用订阅功能，不能进入配置页。<span class="guest-token">Token: ${guest}</span></p>
											</div>
											<button class="toggle-btn" id="noticeToggle" onclick="toggleNotice()">查看</button>
										</div>
										<div id="noticeContent" class="notice-content">
											<div class="link-row">
												<span class="link-name">自适应</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST','guest_0')">https://${url.hostname}/GUEST</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST','guest_0')">复制</button>
											</div>
											<div id="guest_0" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Base64</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST&b64','guest_1')">https://${url.hostname}/GUEST&b64</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST&b64','guest_1')">复制</button>
											</div>
											<div id="guest_1" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Clash</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST&clash','guest_2')">https://${url.hostname}/GUEST&clash</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST&clash','guest_2')">复制</button>
											</div>
											<div id="guest_2" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Sing-box</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST&sb','guest_3')">https://${url.hostname}/GUEST&sb</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST&sb','guest_3')">复制</button>
											</div>
											<div id="guest_3" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Surge</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST&surge','guest_4')">https://${url.hostname}/GUEST&surge</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST&surge','guest_4')">复制</button>
											</div>
											<div id="guest_4" class="qrcode"></div>
											<div class="link-row">
												<span class="link-name">Loon</span>
												<a class="link-url" href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/GUEST&loon','guest_5')">https://${url.hostname}/GUEST&loon</a>
												<button class="action-btn" onclick="copyToClipboard('https://${url.hostname}/GUEST&loon','guest_5')">复制</button>
											</div>
											<div id="guest_5" class="qrcode"></div>
										</div>
									</div>
									<div class="glass panel">
										<div class="panel-head">
											<div>
												<h2 class="panel-title">订阅转换配置</h2>
												<p class="panel-subtitle">当前后端与配置文件</p>
											</div>
										</div>
										<div class="config-list">
											<div class="config-item">
												<span class="config-label">SUBAPI</span>
												<span class="config-value">${subProtocol}://${subConverter}</span>
											</div>
											<div class="config-item">
												<span class="config-label">SUBCONFIG</span>
												<span class="config-value">${subConfig}</span>
											</div>
										</div>
									</div>
								</section>
								<section class="glass panel editor-panel">
									<div class="panel-head">
										<div>
											<h2 class="panel-title">汇聚订阅编辑</h2>
											<p class="panel-subtitle">每行一个节点链接或订阅链接</p>
										</div>
									</div>
									<div class="editor-container">
										${hasKV ? `
										<textarea class="editor"
											placeholder="${decodeURIComponent(atob('TElOSyVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNCVCOCVBQSVFOCU4QSU4MiVFNyU4MiVCOSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQp2bGVzcyUzQSUyRiUyRjI0NmFhNzk1LTA2MzctNGY0Yy04ZjY0LTJjOGZiMjRjMWJhZCU0MDEyNy4wLjAuMSUzQTEyMzQlM0ZlbmNyeXB0aW9uJTNEbm9uZSUyNnNlY3VyaXR5JTNEdGxzJTI2c25pJTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2YWxsb3dJbnNlY3VyZSUzRDElMjZ0eXBlJTNEd3MlMjZob3N0JTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2cGF0aCUzRCUyNTJGJTI1M0ZlZCUyNTNEMjU2MCUyM0NGbmF0CnRyb2phbiUzQSUyRiUyRmFhNmRkZDJmLWQxY2YtNGE1Mi1iYTFiLTI2NDBjNDFhNzg1NiU0MDIxOC4xOTAuMjMwLjIwNyUzQTQxMjg4JTNGc2VjdXJpdHklM0R0bHMlMjZzbmklM0RoazEyLmJpbGliaWxpLmNvbSUyNmFsbG93SW5zZWN1cmUlM0QxJTI2dHlwZSUzRHRjcCUyNmhlYWRlclR5cGUlM0Rub25lJTIzSEsKc3MlM0ElMkYlMkZZMmhoWTJoaE1qQXRhV1YwWmkxd2IyeDVNVE13TlRveVJYUlFjVzQyU0ZscVZVNWpTRzlvVEdaVmNFWlJkMjVtYWtORFVUVnRhREZ0U21SRlRVTkNkV04xVjFvNVVERjFaR3RTUzBodVZuaDFielUxYXpGTFdIb3lSbTgyYW5KbmRERTRWelkyYjNCMGVURmxOR0p0TVdwNlprTm1RbUklMjUzRCU0MDg0LjE5LjMxLjYzJTNBNTA4NDElMjNERQoKCiVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNiU5RCVBMSVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQpodHRwcyUzQSUyRiUyRnN1Yi54Zi5mcmVlLmhyJTJGYXV0bw=='))}"
											id="content">${content}</textarea>
										<div class="save-container">
											<button class="save-btn" onclick="saveContent(this)">保存</button>
											<span class="save-status" id="saveStatus"></span>
										</div>
										` : '<p class="kv-missing">请绑定变量名称为 <strong>KV</strong> 的 KV 命名空间</p>'}
									</div>
								</section>
							</main>
						</div>
						<div id="toast" class="toast"></div>
						<script>
						function showToast(message) {
							const toast = document.getElementById('toast');
							if (!toast) return;
							toast.textContent = message;
							toast.classList.add('show');
							clearTimeout(window.__toastTimer);
							window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
						}

						function copyToClipboard(text, qrcode) {
							navigator.clipboard.writeText(text)
								.then(() => showToast('已复制，并生成二维码'))
								.catch(err => {
									console.error('复制失败:', err);
									showToast('复制失败，请手动复制');
								});

							const qrcodeDiv = document.getElementById(qrcode);
							if (!qrcodeDiv) return;
							qrcodeDiv.innerHTML = '';
							new QRCode(qrcodeDiv, {
								text: text,
								width: 220,
								height: 220,
								colorDark: "#111827",
								colorLight: "#ffffff",
								correctLevel: QRCode.CorrectLevel.Q,
								scale: 1
							});
							qrcodeDiv.style.display = 'block';
						}

						const textarea = document.getElementById('content');
						const saveButton = document.querySelector('.save-btn');
						const statusElem = document.getElementById('saveStatus');
						let saveTimer;

						function updateStatus(message, isError = false) {
							if (!statusElem) return;
							statusElem.textContent = message;
							statusElem.style.color = isError ? 'var(--danger)' : 'var(--muted)';
						}

						function replaceFullwidthColon() {
							if (!textarea) return;
							textarea.value = textarea.value.replace(/：/g, ':');
						}

						function setSavingState(button, message) {
							const target = button || saveButton;
							if (!target) return;
							target.disabled = true;
							target.textContent = message;
						}

						function resetSavingState(button) {
							const target = button || saveButton;
							if (!target) return;
							target.disabled = false;
							target.textContent = '保存';
						}

						async function saveContent(button) {
							try {
								if (!textarea) {
									throw new Error('找不到文本编辑区域');
								}

								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								if (!isIOS) replaceFullwidthColon();

								const newContent = textarea.value || '';
								const originalContent = textarea.defaultValue || '';

								if (newContent === originalContent) {
									updateStatus('内容未变化');
									return;
								}

								setSavingState(button, '保存中');
								const response = await fetch(window.location.href, {
									method: 'POST',
									body: newContent,
									headers: {
										'Content-Type': 'text/plain;charset=UTF-8'
									},
									cache: 'no-cache'
								});

								if (!response.ok) {
									throw new Error('HTTP error! status: ' + response.status);
								}

								textarea.defaultValue = newContent;
								const now = new Date().toLocaleString();
								document.title = '编辑已保存 ' + now;
								updateStatus('已保存 ' + now);
								showToast('保存成功');
							} catch (error) {
								console.error('保存过程出错:', error);
								updateStatus('保存失败: ' + error.message, true);
								showToast('保存失败');
							} finally {
								resetSavingState(button);
							}
						}

						if (textarea) {
							textarea.addEventListener('blur', () => saveContent());
							textarea.addEventListener('input', () => {
								clearTimeout(saveTimer);
								saveTimer = setTimeout(() => saveContent(), 5000);
							});
						}

						function toggleNotice() {
							const noticeContent = document.getElementById('noticeContent');
							const noticeToggle = document.getElementById('noticeToggle');
							if (!noticeContent || !noticeToggle) return;
							const isOpen = noticeContent.classList.toggle('is-open');
							noticeToggle.textContent = isOpen ? '隐藏' : '查看';
						}
						</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
