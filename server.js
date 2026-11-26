// Tiny dependency-free server. Run: node server.js  (default http://localhost:3000)
// Code lives here and in index.html. All saved data lives ONLY in data/data.json,
// so you can replace index.html / server.js any time without losing data.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "data.json");
const MAX_BODY = 5 * 1024 * 1024;

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [], records: [] }, null, 2));
}

function send(res, code, type, body) {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/api/data" && req.method === "GET") {
    try { return send(res, 200, "application/json", fs.readFileSync(DATA_FILE)); }
    catch (e) { return send(res, 500, "text/plain", "read error"); }
  }

  if (url === "/api/data" && req.method === "PUT") {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { res.writeHead(413); res.end(); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const d = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!d || !Array.isArray(d.items) || !Array.isArray(d.records)) throw new Error("bad shape");
        const clean = JSON.stringify({ items: d.items, records: d.records }, null, 2);
        const tmp = DATA_FILE + ".tmp";
        if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, DATA_FILE + ".bak");
        fs.writeFileSync(tmp, clean);
        fs.renameSync(tmp, DATA_FILE);
        send(res, 200, "application/json", '{"ok":true}');
      } catch (e) { send(res, 400, "text/plain", "bad data"); }
    });
    return;
  }

  if (url === "/" || url === "/index.html") {
    try { return send(res, 200, "text/html; charset=utf-8", fs.readFileSync(path.join(__dirname, "index.html"))); }
    catch (e) { return send(res, 500, "text/plain", "index.html missing"); }
  }

  send(res, 404, "text/plain", "Not found");
}).listen(PORT, () => console.log("Running on http://localhost:" + PORT));
