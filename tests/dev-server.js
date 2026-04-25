const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

const port = Number(process.argv[2] || 4173);
const root = path.resolve(__dirname, "..");
const host = "0.0.0.0";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function getNetworkUrls() {
  const interfaces = os.networkInterfaces();
  const urls = [];

  Object.values(interfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (entry.family === "IPv4" && !entry.internal) {
        urls.push(`http://${entry.address}:${port}/app/index.html`);
      }
    });
  });

  return urls;
}

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "/app/index.html" : cleanPath;
  const absolutePath = path.normalize(path.join(root, relativePath));

  if (!absolutePath.startsWith(root)) {
    return null;
  }

  return absolutePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-cache",
    };

    if ((request.url || "").startsWith("/pwa/service-worker.js")) {
      headers["Service-Worker-Allowed"] = "/";
    }

    response.writeHead(200, headers);
    response.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`Pocket Uplift dev server running at http://127.0.0.1:${port}/app/index.html`);

  const networkUrls = getNetworkUrls();
  networkUrls.forEach((url) => {
    console.log(`Available on your network at ${url}`);
  });
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
