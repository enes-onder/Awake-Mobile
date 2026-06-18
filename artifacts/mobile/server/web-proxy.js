const http = require('http');
const net = require('net');

const METRO_PORT = 18115;
const API_PORT = 3001;
const PROXY_PORT = 5000;
const WARMUP_DELAY_MS = 15000;

function proxyRequest(req, res) {
  const isApiRequest = req.url.startsWith('/api/') || req.url === '/api';
  const targetPort = isApiRequest ? API_PORT : METRO_PORT;

  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${targetPort}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end((isApiRequest ? 'API' : 'Metro') + ' not ready: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer(proxyRequest);

server.on('upgrade', (req, socket, head) => {
  const target = net.createConnection(METRO_PORT, 'localhost', () => {
    target.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      `Host: localhost:${METRO_PORT}\r\n` +
      Object.entries(req.headers)
        .filter(([k]) => k !== 'host')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    target.write(head);
    socket.pipe(target);
    target.pipe(socket);
  });

  target.on('error', () => socket.destroy());
  socket.on('error', () => target.destroy());
});

server.listen(PROXY_PORT, () => {
  console.log(`Web proxy: localhost:${PROXY_PORT} → /api/* → :${API_PORT}, rest → :${METRO_PORT}`);
});

function warmupBundle(platform) {
  return new Promise((resolve) => {
    const manifestReq = http.request(
      {
        hostname: 'localhost',
        port: METRO_PORT,
        path: '/',
        method: 'GET',
        headers: {
          Accept: 'application/expo+json,application/json',
          'Expo-Platform': platform,
          'Expo-SDK-Version': '54.0.0',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const manifest = JSON.parse(data);
            const bundleUrl = manifest?.launchAsset?.url?.replace(
              /https?:\/\/[^/]+/,
              `http://localhost:${METRO_PORT}`
            );
            if (!bundleUrl) return resolve();
            console.log(`Warming ${platform} bundle...`);
            const bundleReq = http.get(bundleUrl, (r) => {
              let bytes = 0;
              r.on('data', (c) => (bytes += c.length));
              r.on('end', () => {
                console.log(`${platform} bundle ready (${Math.round(bytes / 1024)}KB)`);
                resolve();
              });
            });
            bundleReq.on('error', () => resolve());
            bundleReq.setTimeout(180000, () => { bundleReq.destroy(); resolve(); });
          } catch {
            resolve();
          }
        });
      }
    );
    manifestReq.on('error', () => resolve());
    manifestReq.end();
  });
}

setTimeout(async () => {
  console.log(`Metro ready — pre-warming bundles...`);
  await Promise.all([warmupBundle('ios'), warmupBundle('android')]);
  console.log('Bundles warmed — safe to scan QR code');
}, WARMUP_DELAY_MS);
