/**
 * web-proxy.js — Replit web önizlemesi için HTTP ters proxy sunucusu.
 *
 * Port düzeni:
 *  5000  → Bu proxy (Replit'in dışarıya açtığı port)
 *  3001  → Express API sunucusu (/api/* istekleri buraya yönlendirilir)
 *  18115 → Expo Metro bundler (diğer tüm istekler buraya yönlendirilir)
 *
 * Neden gerekli?
 *  Expo web bundle'ı tarayıcıda çalışırken API için relative URL kullanır:
 *  fetch('/api/missions'). Tarayıcı bunu port 5000'e gönderir; bu proxy
 *  /api/* olanları API sunucusuna (3001), kalanları Metro'ya (18115) iletir.
 *  Böylece CORS sorunu yaşanmaz — tüm istekler aynı origin üzerinden geçer.
 *
 * WebSocket desteği:
 *  Metro, Hot Module Replacement için WebSocket kullanır. 'upgrade' olayı
 *  yakalanarak bu bağlantılar doğrudan Metro'ya tünel açılır.
 *
 * Bundle ısıtma:
 *  Sunucu başladıktan 15 saniye sonra iOS ve Android bundle'ları arka planda
 *  ısıtılır. QR kodu taratmadan önce bundle hazır olur → bekleme süresi kısalır.
 */

const http = require('http');
const net = require('net');

/** Metro bundler'ın dinlediği port (Expo workflow komutuyla eşleşmeli) */
const METRO_PORT = 18115;

/** Express API sunucusunun dinlediği port */
const API_PORT = 3001;

/** Replit'in dışarıya açtığı ve tarayıcının bağlandığı port */
const PROXY_PORT = 5000;

/** Bundle ısıtması için Metro'nun hazır olmasını bekle (ms) */
const WARMUP_DELAY_MS = 15000;

/**
 * Gelen HTTP isteğini doğru porta yönlendirir.
 * /api/ ile başlayan yollar → API_PORT (3001)
 * Diğer tüm yollar        → METRO_PORT (18115)
 */
function proxyRequest(req, res) {
  const isApiRequest = req.url.startsWith('/api/') || req.url === '/api';
  const targetPort = isApiRequest ? API_PORT : METRO_PORT;

  /** Hedef sunucuya iletilecek istek seçenekleri */
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    /** Host başlığını hedef porta göre güncelle (Metro bazı isteklerde host'u doğrular) */
    headers: { ...req.headers, host: `localhost:${targetPort}` },
  };

  /** Proxy isteğini oluştur ve yanıtı istemciye aktar */
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  /** Hedef sunucu hazır değilse (henüz başlamadıysa) anlamlı hata döner */
  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end((isApiRequest ? 'API' : 'Metro') + ' not ready: ' + err.message);
  });

  /** İstek gövdesini (POST body vb.) hedef sunucuya aktar */
  req.pipe(proxyReq, { end: true });
}

/** HTTP sunucusunu oluştur — tüm istekler proxyRequest üzerinden geçer */
const server = http.createServer(proxyRequest);

/**
 * WebSocket yükseltme isteğini yakala ve Metro'ya tünel aç.
 * Metro, tarayıcıyla Hot Module Replacement (HMR) için WebSocket kullanır.
 * Bu olmadan web önizlemesinde canlı yenileme çalışmaz.
 */
server.on('upgrade', (req, socket, head) => {
  /** Metro'ya TCP bağlantısı aç */
  const target = net.createConnection(METRO_PORT, 'localhost', () => {
    /** HTTP Upgrade isteğini raw TCP üzerinden Metro'ya ilet */
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
    /** Çift yönlü veri akışını kur: tarayıcı ↔ Metro */
    socket.pipe(target);
    target.pipe(socket);
  });

  /** Hata durumunda bağlantıyı temiz şekilde kapat */
  target.on('error', () => socket.destroy());
  socket.on('error', () => target.destroy());
});

/** Proxy sunucusunu PROXY_PORT üzerinde başlat */
server.listen(PROXY_PORT, () => {
  console.log(`Web proxy: localhost:${PROXY_PORT} → /api/* → :${API_PORT}, rest → :${METRO_PORT}`);
});

/**
 * Metro'daki manifest endpoint'ini çağırarak bundle URL'sini bulur,
 * ardından tüm bundle'ı indirerek Metro'nun önbelleğine almasını sağlar.
 * @param {string} platform — 'ios' veya 'android'
 * @returns {Promise<void>} Bundle indirilince (veya hata olunca) resolve eder
 */
function warmupBundle(platform) {
  return new Promise((resolve) => {
    /** Expo manifest endpoint'ini sorgula — bundle URL'sini içerir */
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
            /** Manifest JSON'undan bundle URL'sini çıkar */
            const manifest = JSON.parse(data);
            const bundleUrl = manifest?.launchAsset?.url?.replace(
              /https?:\/\/[^/]+/,
              `http://localhost:${METRO_PORT}`
            );
            if (!bundleUrl) return resolve();
            console.log(`Warming ${platform} bundle...`);
            /** Bundle dosyasını indirerek Metro önbelleğini doldur */
            const bundleReq = http.get(bundleUrl, (r) => {
              let bytes = 0;
              r.on('data', (c) => (bytes += c.length));
              r.on('end', () => {
                console.log(`${platform} bundle ready (${Math.round(bytes / 1024)}KB)`);
                resolve();
              });
            });
            /** İndirme hatası → sessizce devam et */
            bundleReq.on('error', () => resolve());
            /** 3 dakika zaman aşımı — çok büyük bundle'lar için */
            bundleReq.setTimeout(180000, () => { bundleReq.destroy(); resolve(); });
          } catch {
            resolve();
          }
        });
      }
    );
    /** Manifest isteği başarısız → sessizce devam et */
    manifestReq.on('error', () => resolve());
    manifestReq.end();
  });
}

/**
 * Proxy başladıktan WARMUP_DELAY_MS sonra iOS ve Android bundle'larını paralel ısıt.
 * Bu sayede kullanıcı QR kodu taratmadan önce bundle hazır olur.
 */
setTimeout(async () => {
  console.log(`Metro ready — pre-warming bundles...`);
  await Promise.all([warmupBundle('ios'), warmupBundle('android')]);
  console.log('Bundles warmed — safe to scan QR code');
}, WARMUP_DELAY_MS);
