const http = require('http');
const net = require('net');

const TARGET_PORT = 18115;
const PROXY_PORT = 5000;

function proxyRequest(req, res) {
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end('Metro not ready: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer(proxyRequest);

server.on('upgrade', (req, socket, head) => {
  const target = net.createConnection(TARGET_PORT, 'localhost', () => {
    target.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      `Host: localhost:${TARGET_PORT}\r\n` +
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
  console.log(`Web proxy: localhost:${PROXY_PORT} → localhost:${TARGET_PORT}`);
});
