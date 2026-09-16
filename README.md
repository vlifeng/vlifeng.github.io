# vlifeng.github.io

Live site: https://vlifeng.github.io/

## MINIMAXUSDT 免费行情

- 交易对：Binance **U 本位合约** `MINIMAXUSDT`（不是现货）
- 免费 REST（无需 API Key，浏览器可直接请求，已开 CORS）：
  - `https://www.binance.com/fapi/v1/ticker/price?symbol=MINIMAXUSDT`
  - 备选：`https://fapi.binance.com/fapi/v1/ticker/price?symbol=MINIMAXUSDT`（部分地区 451）
- 页面用 `setInterval(..., 1000)` 每秒拉取一次

可选本地代理：

```bash
node ticker-server.js
curl http://127.0.0.1:8787/price
```
