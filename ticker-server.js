#!/usr/bin/env node
/** Local optional proxy: node ticker-server.js  then GET http://127.0.0.1:8787/price */
const http = require("http");
const https = require("https");
const PORT = Number(process.env.PORT || 8787);
const SYMBOL = (process.env.SYMBOL || "MINIMAXUSDT").toUpperCase();
const UPSTREAMS = [
  `https://www.binance.com/fapi/v1/ticker/price?symbol=${SYMBOL}`,
  `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${SYMBOL}`,
];
let latest = { symbol: SYMBOL, price: null, time: null, error: "warming_up" };
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: "application/json" }, timeout: 8000 }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error("HTTP " + res.statusCode));
        try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}
async function poll() {
  for (const url of UPSTREAMS) {
    try {
      const data = await fetchJson(url);
      latest = { symbol: data.symbol || SYMBOL, price: String(data.price), time: data.time || Date.now(), source: url, updatedAt: new Date().toISOString(), error: null };
      return;
    } catch (e) { latest = { ...latest, error: String(e.message || e), updatedAt: new Date().toISOString() }; }
  }
}
setInterval(() => { poll().catch(() => {}); }, 500);
poll().catch(() => {});
http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  const path = (req.url || "/").split("?")[0];
  if (path === "/price" || path === "/api/ticker") {
    res.writeHead(latest.price ? 200 : 503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(latest));
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, endpoints: ["/price"], symbol: SYMBOL }));
}).listen(PORT, "0.0.0.0", () => console.log("listening", PORT));
