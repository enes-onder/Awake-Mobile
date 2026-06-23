# PROJECT_RULES — Doğruluk Dedektifi Geliştirme Kuralları

Bu dosya, Doğruluk Dedektifi projesinde yapılacak tüm geliştirme, refactor, bugfix, dokümantasyon ve temizlik işleri için bağlayıcı kuralları tanımlar.

Bu projede çalışan her geliştirici veya AI agent önce bu dosyayı, sonra gerekiyorsa `FEEDBACK.md`, `CODEBASE.md`, `replit.md` ve ilgili `docs/` dosyalarını okumalıdır.

---

## 1. Mutlak Öncelik Sırası

1. Kritik hata düzeltmeleri önce gelir.
2. `FEEDBACK.md` içinde belirtilen maddeler öncelik sırasına göre ele alınır:
   - Önce `P0`
   - Sonra `P1`
   - Sonra `P2`
   - En son `P3`
3. `P0` veya `P1` açıkken kozmetik refactor, UI süsleme, animasyon, yeni özellik veya temizlik işi yapılmaz.
4. Her iş küçük ve kontrol edilebilir parçalara bölünür.
5. Bir prompt / bir tur = mümkünse tek konu.

---

## 2. Projenin Gerçek Mimarisi

Bu proje monorepo yapısındadır.

Ana çalışan parçalar:

- `artifacts/mobile/` — Expo React Native mobil/web uygulaması
- `artifacts/api-server/` — Express REST API
- `lib/db/` — Drizzle ORM + Replit PostgreSQL şeması
- `docs/` — proje dokümantasyonu
- `CODEBASE.md` — kod tabanı haritası
- `replit.md` — Replit çalışma bilgileri
- `FEEDBACK.md` — hata/iyileştirme listesi

Önemli notlar:

- Gerçek backend Express + Drizzle + Replit PostgreSQL mimarisidir.
- Supabase aktif mimari olarak kabul edilmez, kodda gerçekten kullanılmıyorsa dokümantasyonda aktif özellik gibi anlatılamaz.
- `artifacts/mobile-app/`, `artifacts/mockup-sandbox/`, `supabase/`, `server/db.ts` gibi dizinler/kalıntılar temizlenmeden önce ayrıca doğrulanmalıdır.
- Bir dosya veya klasörün ölü kod olduğu varsayılmaz; önce import, script, workspace ve runtime bağlantıları kontrol edilir.

---

## 3. Kod Değiştirme Kuralları

1. Değişiklik yapmadan önce ilgili dosyaları oku.
2. Sorunu önce doğrula, sonra düzelt.
3. Gereksiz geniş refactor yapma.
4. Çalışan UI davranışını istemeden değiştirme.
5. Mevcut Türkçe yorum stilini koru.
6. Yeni karmaşık mantık ekliyorsan kısa ve anlaşılır Türkçe yorum yaz.
7. Magic number ekleme; gerekiyorsa anlamlı sabit kullan.
8. Aynı mantığı iki yere kopyalama; ama gereksiz abstraction da yapma.
9. Dosya sorumluluklarını karıştırma.
10. Büyük dosyaları daha da büyütmeden önce mevcut mimariye uy.

---

## 4. State Yönetimi Kuralları

Bu projede en kritik risk stale state / stale closure hatalarıdır.

Kesin kurallar:

1. Aynı kullanıcı aksiyonu içinde birden fazla tam obje state kaydı yapma.
2. `save({ ...state, ... })` çağrıları birbirini ezebilir; dikkatli kullan.
3. Ardışık `earnXP()` + `completeMission()` veya `completeLesson()` gibi çağrılar state kaybı yaratabilir.
4. Aynı aksiyona ait XP, tamamlanma, istatistik, rozet, streak ve tarih güncellemeleri mümkünse tek atomik güncellemede yapılmalıdır.
5. Gerekirse fonksiyonel updater kullan:
   - `setState(prev => next)`
   - veya `saveWithUpdater(prev => next)`
6. XP asla 0'ın altına düşmemelidir.
7. AsyncStorage'a yazılan veri ile ekranda görünen veri tutarlı olmalıdır.
8. Uygulama kapatılıp açıldığında ilerleme korunmalıdır.

---

## 5. Oyun Mekaniği Kuralları

1. XP sistemi güvenilir olmalıdır.
2. Günlük 2× XP kullanıcıya gösteriliyorsa gerçekten verilmelidir.
3. `lastLoginDate` ve `lastPlayDate` farklı anlamlara sahiptir:
   - `lastLoginDate`: uygulama giriş/günlük bonus kontrolü
   - `lastPlayDate`: gerçek oyun aktivitesi tamamlandı mı kontrolü
4. Streak günde en fazla 1 kez artmalıdır.
5. Yanlış cevap, ürün kararı net değilse "tamamlandı" sayılmamalıdır.
6. "Sahte tespit" sayacı sadece gerçekten `verdict === "fake"` olan vaka doğru çözülürse artmalıdır.
7. Rozetler eski state'e göre değil, güncel işlem sonrası oluşan yeni değerlere göre verilmelidir.
8. Kullanıcıya gösterilen animasyon, XP balonu ve profil toplam XP değeri birbiriyle tutarlı olmalıdır.

---

## 6. Backend ve Güvenlik Kuralları

1. API endpoint'i kullanıcı verisi değiştiriyorsa güvenlik etkisi değerlendirilmelidir.
2. Leaderboard güvenilir kabul edilecekse XP sadece istemciye güvenerek yazılamaz.
3. Auth yoksa bu açıkça dokümante edilmelidir.
4. Production için `cors()` tüm origin'lere açık bırakılmamalıdır.
5. Kullanıcıdan gelen sayısal alanlar doğrulanmalıdır.
6. Request body'den gelen `username`, `xp`, `level`, `streak` gibi alanlar kötüye kullanım açısından değerlendirilmelidir.
7. Gizli anahtarlar, tokenlar, connection stringler repoya yazılmamalıdır.
8. Loglarda hassas veri yazılmamalıdır.

---

## 7. Dokümantasyon Kuralları

1. README gerçek çalışan mimariyi anlatmalıdır.
2. Kodda olmayan özellik dokümantasyonda varmış gibi yazılamaz.
3. Supabase kullanılmıyorsa "Supabase Auth çalışıyor" gibi ifade kullanılamaz.
4. Dokümantasyon ve kod çelişirse kod gerçek kabul edilir, dokümantasyon düzeltilir.
5. Yeni route, env değişkeni, veri modeli veya kurulum adımı eklenirse ilgili doküman güncellenir.
6. Terk edilmiş mimari varsa silinir veya `docs/archive/` altında "terk edilmiş tasarım" diye açıkça işaretlenir.

---

## 8. Temiz Kod Prensipleri

1. Her dosya tek ana sorumluluk taşımalıdır.
2. Bileşenler UI göstermeli, ağır iş mantığı hook/context/helper içinde olmalıdır.
3. Hook'lar iş mantığını yönetmeli ama UI detaylarına boğulmamalıdır.
4. Context dosyaları global state ve eylemleri yönetmeli; ekran rendering mantığı içermemelidir.
5. API çağrıları tek merkezden yapılmalıdır.
6. Tipler açık ve anlaşılır olmalıdır.
7. `any` kullanımı mecbur kalmadıkça yasaktır.
8. Kör type cast (`as number`, `as string`) dikkatli kullanılmalıdır; API verisi mümkünse doğrulanmalıdır.
9. Kullanılmayan import, bağımlılık, script ve klasörler temizlenmelidir.
10. Kod okunabilirliği, kısa hileli çözümlerden daha önemlidir.

---

## 9. UI / UX Kuralları

1. Var olan tasarım dili korunmalıdır.
2. Koyu tema, siber/dedektif atmosferi ve mevcut renk sistemi bozulmamalıdır.
3. Mobil öncelikli düşünülmelidir.
4. Web görünümü bozulmamalıdır.
5. Safe area davranışları korunmalıdır.
6. Animasyonlar state tutarlılığını bozmamalıdır.
7. Kullanıcıya vaat edilen ödül, sayaç ve sonuç gerçekten doğru olmalıdır.
8. Hata mesajları kullanıcıyı suçlamamalı; kısa ve anlaşılır olmalıdır.

---

## 10. Erişilebilirlik Kuralları

1. Tüm kritik `TouchableOpacity` öğelerinde `accessibilityRole="button"` olmalıdır.
2. Salt ikon butonlarında anlamlı `accessibilityLabel` olmalıdır.
3. "DOĞRU", "YANLIŞ", "İpucu Al", "Kapat", "Başla" gibi kritik aksiyonlar ekran okuyucu ile anlaşılmalıdır.
4. Dokunma hedefleri mümkün olduğunca en az 44pt olmalıdır.
5. Swipe ile yapılan kritik aksiyonların buton alternatifi erişilebilir olmalıdır.

---

## 11. Performans Kuralları

1. XP değişti diye içerik API'leri tekrar tekrar çekilmemelidir.
2. İçerik verisi mümkünse mount sırasında çekilir; kilit hesapları client-side yapılır.
3. Gereksiz render ve gereksiz network isteği azaltılır.
4. Büyük listelerde gereksiz inline hesaplamalar azaltılır.
5. `setTimeout` ve interval gibi yan etkiler cleanup olmadan bırakılmaz.

---

## 12. Test ve Doğrulama Kuralları

Her değişiklikten sonra en az şu kontrol yapılmalıdır:

```bash
pnpm run typecheck
```

Bugfix sonrası manuel kabul kriterleri kontrol edilmelidir.

P0/P1 oyun mekaniği değişikliklerinde özellikle:

1. Yeni kullanıcı oluştur.
2. İlk vakayı doğru çöz.
3. XP'nin `xpReward × 2` arttığını kontrol et.
4. Aynı gün ikinci vakada `×1` olduğunu kontrol et.
5. İpucu kullanınca `-5 XP` net hesaba yansıyor mu kontrol et.
6. Yanlış cevaplanan vaka ürün kararına göre doğru davranıyor mu kontrol et.
7. Gerçek haberi doğru işaretleyince `fakesDetected` artmıyor mu kontrol et.
8. Ders tamamlanınca hem XP hem `completedLessons` korunuyor mu kontrol et.
9. Uygulamayı kapat/aç; AsyncStorage verisi korunuyor mu kontrol et.

---

## 13. Agent Çalışma Protokolü

Her agent şu sırayı izlemelidir:

1. Görevi oku.
2. `PROJECT_RULES.md` kurallarını dikkate al.
3. Görev hata düzeltmeyse `FEEDBACK.md` önceliklerini kontrol et.
4. İlgili dosyaları oku.
5. Sorunu doğrula.
6. En küçük güvenilir düzeltmeyi yap.
7. Typecheck çalıştır.
8. Kabul kriterlerini raporla.
9. Değişen dosyaları listele.
10. Yapmadığı veya emin olmadığı şeyi açıkça söyle.

Agent şunları yapmamalıdır:

* P0/P1 açıkken rastgele refactor yapmak
* UI tasarımını izinsiz değiştirmek
* Dokümantasyonu koda aykırı yazmak
* Çalışmayan özelliği çalışıyor gibi göstermek
* Typecheck çalıştırmadan "tamamlandı" demek
* Birden fazla bağımsız konuyu tek değişiklikte karıştırmak
* Eski/ölü görünen dosyayı doğrulamadan silmek

---

## 14. Commit / Değişiklik Disiplini

1. Her kritik düzeltme ayrı mantıksal değişiklik olmalıdır.
2. Commit mesajı açıklayıcı olmalıdır.
3. Örnek:

   * `fix: make mission XP update atomic`
   * `fix: correct daily 2x XP play-date logic`
   * `fix: prevent completed lesson state from being overwritten`
   * `docs: align README with Express Drizzle backend`
4. Büyük "her şeyi düzelttim" commitleri tercih edilmez.

---

## 15. Nihai İlke

Bu projede hızdan önce doğruluk gelir.

Özellikle XP, streak, rozet, tamamlanma ve leaderboard gibi kullanıcı ilerlemesini etkileyen alanlarda:

* Veri kaybı kabul edilemez.
* Yanlış ödül kabul edilemez.
* Ekranda görünen ile kayıtlı state'in farklı olması kabul edilemez.
* Dokümantasyonun koddan farklı konuşması kabul edilemez.

Her değişiklik bu ilkeye göre değerlendirilmelidir.
