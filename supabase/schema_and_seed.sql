-- ============================================================
-- DOĞRULUK DEDEKTİFİ — Supabase Schema + Seed Data
-- Supabase SQL Editor'de bu dosyayı çalıştır.
-- ============================================================

-- ============================================================
-- 1. TABLOLAR
-- ============================================================

-- VAKALAR (Missions)
CREATE TABLE IF NOT EXISTS missions (
  id              TEXT PRIMARY KEY,          -- "m1", "m2", ...
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  difficulty      SMALLINT NOT NULL CHECK (difficulty IN (1, 2, 3)),
  type            TEXT NOT NULL CHECK (type IN ('photo', 'headline', 'quote', 'stats', 'video')),
  xp_reward       INTEGER NOT NULL DEFAULT 25,
  category        TEXT NOT NULL,
  verdict         TEXT NOT NULL CHECK (verdict IN ('real', 'fake')),
  content         JSONB NOT NULL,            -- MissionContent objesi
  clues           JSONB NOT NULL,            -- string[]
  explanation     TEXT NOT NULL,
  required_xp     INTEGER NOT NULL DEFAULT 0,  -- Progressive unlock: kaç XP gerekli
  order_index     INTEGER NOT NULL DEFAULT 0,  -- Sıralama
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DERSLER (Lessons)
CREATE TABLE IF NOT EXISTS lessons (
  id              TEXT PRIMARY KEY,          -- "l1", "l2", ...
  title           TEXT NOT NULL,
  subtitle        TEXT NOT NULL,
  duration        TEXT NOT NULL,             -- "5 dk"
  icon            TEXT NOT NULL,             -- Feather icon adı
  color           TEXT NOT NULL,             -- Hex renk "#2B7FFF"
  xp_reward       INTEGER NOT NULL DEFAULT 30,
  content         JSONB NOT NULL,            -- string[] (paragraflar)
  quiz            JSONB NOT NULL,            -- LessonQuiz[]
  required_xp     INTEGER NOT NULL DEFAULT 0,  -- Progressive unlock
  order_index     INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SİMÜLASYONLAR (Simulations)
CREATE TABLE IF NOT EXISTS simulations (
  id              TEXT PRIMARY KEY,          -- "s1", "s2", ...
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  difficulty      SMALLINT NOT NULL CHECK (difficulty IN (1, 2, 3)),
  xp_reward       INTEGER NOT NULL DEFAULT 60,
  category        TEXT NOT NULL,
  steps           JSONB NOT NULL,            -- SimStep[]
  required_xp     INTEGER NOT NULL DEFAULT 0,  -- Progressive unlock
  order_index     INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- KULLANICI PROFİLLERİ (ileride Auth entegrasyonu için hazır)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  bio             TEXT DEFAULT '',
  favorite_topic  TEXT DEFAULT '',
  xp              INTEGER NOT NULL DEFAULT 0,
  level           INTEGER NOT NULL DEFAULT 1,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_active     DATE,
  username_last_changed TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- KULLANICI İLERLEME — Vakalar
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id      TEXT REFERENCES missions(id),
  result          TEXT CHECK (result IN ('correct', 'incorrect')),
  xp_earned       INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- KULLANICI İLERLEME — Dersler
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id       TEXT REFERENCES lessons(id),
  score           INTEGER DEFAULT 0,         -- Quiz doğru sayısı
  xp_earned       INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- KULLANICI İLERLEME — Simülasyonlar
CREATE TABLE IF NOT EXISTS user_simulation_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  simulation_id   TEXT REFERENCES simulations(id),
  xp_earned       INTEGER DEFAULT 0,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, simulation_id)
);


-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- Kullanıcı sadece kendi verisini görebilir / değiştirebilir
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_simulation_progress ENABLE ROW LEVEL SECURITY;

-- Profil: sadece kendi profilini görebilir ve güncelleyebilir
CREATE POLICY "Kullanici kendi profilini gorebilir"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Kullanici kendi profilini guncelleyebilir"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Kullanici kendi profilini olusturabilir"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- İlerleme: sadece kendi kayıtları
CREATE POLICY "Kullanici kendi vaka ilerlemesini gorebilir"
  ON user_mission_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Kullanici kendi ders ilerlemesini gorebilir"
  ON user_lesson_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Kullanici kendi simulasyon ilerlemesini gorebilir"
  ON user_simulation_progress FOR ALL USING (auth.uid() = user_id);

-- İçerik tabloları herkese açık (okunabilir)
CREATE POLICY "Herkes vakalari okuyabilir"
  ON missions FOR SELECT USING (true);

CREATE POLICY "Herkes dersleri okuyabilir"
  ON lessons FOR SELECT USING (true);

CREATE POLICY "Herkes simulasyonlari okuyabilir"
  ON simulations FOR SELECT USING (true);


-- ============================================================
-- 3. SEED DATA — Mevcut uygulama verisi
-- ============================================================

-- -----------------------------------------------------------
-- VAKALAR (Missions) — Mevcut 8 vaka
-- -----------------------------------------------------------

INSERT INTO missions (id, title, description, difficulty, type, xp_reward, category, verdict, content, clues, explanation, required_xp, order_index) VALUES

('m1', 'Sel Felaketi Fotoğrafı', 'Sosyal medyada viral olan bu paylaşımın doğruluğunu araştır.', 1, 'photo', 25, 'Yanlış Bağlam', 'fake',
  '{"accountName":"Haber Acil TR","accountHandle":"@haberaciltr","timestamp":"2 saat önce","text":"YANGIN ALARMI! Dün gece İstanbul''da yaşanan sel felaketinden korkunç görüntüler! Araçlar sürükleniyor, kayıp sayısı artıyor! Paylaş, herkes görsün! #istanbul #sel #felaket","likes":"8.4K","shares":"14.2K","platform":"twitter","imageTag":"FOTOĞRAF: Sel görüntüleri"}'::jsonb,
  '["Tersine görsel arama: Bu fotoğraf 2021 yılında Brezilya''da çekilmiş.","Metadata analizi: Dosya zaman damgası 3 yıl önceye ait.","İstanbul Büyükşehir Belediyesi''nin resmi hesabında böyle bir açıklama yok."]'::jsonb,
  'Bu fotoğraf gerçek bir sel felaketine ait, ancak İstanbul''da yaşanmamıştır. 2021 yılında Brezilya''da çekilmiş ve yanlış bağlamda paylaşılarak panik yaratmak amacıyla kullanılmıştır.',
  0, 1),

('m2', 'Bakan Açıklaması', 'Bir bakana atıfla paylaşılan bu alıntıyı doğrula.', 2, 'quote', 35, 'Sahte Alıntı', 'fake',
  '{"accountName":"Gündem TR","accountHandle":"@gundemmtr","timestamp":"5 saat önce","text":"FLAŞ: Sağlık Bakanı açıkladı: ''Artık tüm ilaçlar ücretli olacak, ücretsiz ilaç dönemi bitti.'' Kaynak: Sabah gazetesi röportajı. #sağlık #ilaç","likes":"2.1K","shares":"6.8K","platform":"twitter"}'::jsonb,
  '["Sabah gazetesi arşivinde bu röportaj bulunamadı.","Sağlık Bakanlığı resmi hesabında bu yönde bir açıklama yok.","Aynı iddia birden fazla sahte hesap tarafından eş zamanlı paylaşıldı."]'::jsonb,
  'Bu alıntı tamamen uydurma. Sağlık Bakanı böyle bir açıklama yapmamıştır. İddianın atıfta bulunduğu Sabah gazetesi arşivinde böyle bir röportaj bulunmamaktadır.',
  0, 2),

('m3', 'Aşı Yan Etkileri', 'WhatsApp''ta yayılan bu mesajın içeriğini değerlendir.', 2, 'stats', 35, 'Yanıltıcı İstatistik', 'fake',
  '{"accountName":"Ailecek Sağlık","accountHandle":"WhatsApp Grubu","timestamp":"Dün, 22:14","text":"ACELE PAYLAŞ! Yeni yapılan araştırma: Grip aşısı yapılan çocukların %73''ünde ciddi yan etkiler görüldü. Avustralya''daki 50.000 kişilik çalışma. Çocuklarınızı koruyun! Doktorlar susuyor!","likes":"","shares":"Binlerce kez iletildi","platform":"whatsapp"}'::jsonb,
  '["Avustralya sağlık otoritelerinin veri tabanında böyle bir çalışma yok.","%73 istatistiği hiçbir hakemli dergide yayımlanmamış.","Gerçek yan etki oranı WHO verilerine göre %0.1''den az."]'::jsonb,
  'Bu mesaj tipik bir dezenformasyon örneğidir. Belirtilen araştırma gerçekte var olmamaktadır. WHO ve Avustralya Sağlık Bakanlığı verilerine göre grip aşısının ciddi yan etki oranı son derece düşüktür.',
  0, 3),

('m4', 'Deprem Uyarısı', 'Bu acil deprem uyarısı paylaşımını analiz et.', 1, 'headline', 20, 'Panik Haberi', 'fake',
  '{"accountName":"Deprem Bilgi Merkezi","accountHandle":"@deprembildir","timestamp":"30 dakika önce","text":"ACİL UYARI! Bugün gece yarısı İstanbul''da 7.8 büyüklüğünde deprem bekleniyor! AFAD tarafından doğrulandı! Binalarınızı TERK EDİN! Bu mesajı herkese iletin!","likes":"1.2K","shares":"45.6K","platform":"twitter"}'::jsonb,
  '["AFAD''ın resmi hesabında böyle bir uyarı bulunmuyor.","Depremler önceden kesin olarak tahmin edilemez — bu bilimsel gerçek.","Hesap 3 gün önce açılmış, 0 takipçisi var."]'::jsonb,
  'Depremler mevcut bilimle kesin olarak tahmin edilemez. AFAD, böyle bir uyarı yapmamıştır. Bu tür paylaşımlar toplumsal paniğe ve binalara zarar verebilecek gereksiz tahliyeye neden olmaktadır.',
  0, 4),

('m5', 'Çevre Raporu', 'BM tarafından yayımlandığı iddia edilen bu raporu incele.', 3, 'stats', 50, 'Sahte Rapor', 'fake',
  '{"accountName":"Eko Dünya","accountHandle":"@ekodunyatr","timestamp":"1 gün önce","text":"BM raporuna göre Türkiye, kişi başına düşen plastik tüketimde DÜNYA BİRİNCİSİ oldu. 2023 verisi: yılda 847 kg plastik. Rapor linki: bit.ly/unplastik2024","likes":"3.7K","shares":"9.1K","platform":"twitter"}'::jsonb,
  '["BM Çevre Programı raporlarında Türkiye 1. sırada yer almıyor.","Verilen link meşru bir BM sayfasına yönlendirilmiyor.","847 kg/kişi rakamı küresel ortalamadan 20 kat fazla — fiziksel olarak imkansız."]'::jsonb,
  'Bu iddia yanlıştır. BM verilerine göre kişi başına plastik tüketimde ABD, Avustralya ve bazı Körfez ülkeleri üst sıralarda yer almaktadır. Paylaşılan link sahte bir sayfaya yönlendirmektedir.',
  100, 5),

('m6', 'Müze Sergisi', 'Bu müze haberi gerçek mi?', 1, 'headline', 20, 'Gerçek Haber', 'real',
  '{"accountName":"Kültür Sanat TR","accountHandle":"@kultursanattr","timestamp":"3 saat önce","text":"İstanbul Arkeoloji Müzesi, 2025 yılında 1 milyonun üzerinde ziyaretçi ağırladı. Bu, müzenin tarihindeki en yüksek rakam. Müze Müdürü: ''Dijital rehberlik uygulaması ilginin artmasında büyük rol oynadı.''","likes":"892","shares":"1.4K","platform":"news"}'::jsonb,
  '["Kültür Bakanlığı resmi istatistikleri bu rakamı doğruluyor.","Müze web sitesinde dijital rehber uygulaması duyurusu mevcut.","Birden fazla bağımsız haber kaynağı aynı haberi yayımladı."]'::jsonb,
  'Bu haber gerçektir. İstanbul Arkeoloji Müzesi, 2025 yılında rekor ziyaretçi sayısına ulaşmıştır. Kültür Bakanlığı istatistikleri ve müzenin kendi açıklaması bu bilgiyi doğrulamaktadır.',
  0, 6),

('m7', 'Yapay Zeka Fotoğrafı', 'Siyasi bir etkinliği gösteren bu fotoğrafı incele.', 3, 'photo', 50, 'Yapay Zeka Manipülasyonu', 'fake',
  '{"accountName":"Politika Haber","accountHandle":"@politikahaber7","timestamp":"6 saat önce","text":"Belediye toplantısında skandal! Yetkili, toplantı salonunda uyuya kaldı. Fotoğraf sosyal medyayı salladı! #belediye #skandal","likes":"5.2K","shares":"18.3K","platform":"instagram","imageTag":"FOTOĞRAF: Toplantı anı"}'::jsonb,
  '["Fotoğraftaki kişinin elleri anormal şekilde görünüyor — YZ belirtisi.","Arka plandaki yazılar bulanık ve anlamsız — YZ üretimi göstergesi.","Bağlantılı haber kaynağı bulunamadı, hesap 1 haftalık."]'::jsonb,
  'Bu fotoğraf yapay zeka tarafından üretilmiştir. YZ''nin klasik hataları görünmektedir: anormal el detayları, bulanık arka plan yazıları ve abartılı yüz ifadesi.',
  100, 7),

('m8', 'Bilim İnsanı Açıklaması', 'Ünlü bir fizikçiye atfedilen bu alıntıyı değerlendir.', 2, 'quote', 35, 'Sahte Alıntı', 'fake',
  '{"accountName":"Bilim Günlüğü","accountHandle":"@bilimgunlugu","timestamp":"2 gün önce","text":"Stephen Hawking: ''Akıllı telefonlar, insanlığın bugüne kadar ürettiği en zararlı icattır. Gençliği yok ediyor.'' — 2018 Cambridge konferansı","likes":"4.1K","shares":"7.9K","platform":"twitter"}'::jsonb,
  '["2018 Cambridge konferans kayıtlarında bu alıntı yer almıyor.","Hawking, hayatı boyunca teknolojiyi genel olarak destekledi.","Bu alıntı, Hawking''in 2018''deki vefatından sonra ortaya çıktı."]'::jsonb,
  'Bu alıntı uydurma. Stephen Hawking böyle bir açıklama yapmamıştır. Otoriter isimlere sahte sözler atfetmek, dezenformasyonun yaygın bir tekniğidir.',
  50, 8);


-- -----------------------------------------------------------
-- DERSLER (Lessons) — Mevcut 6 ders
-- -----------------------------------------------------------

INSERT INTO lessons (id, title, subtitle, duration, icon, color, xp_reward, content, quiz, required_xp, order_index) VALUES

('l1', 'Tersine Görsel Arama', 'Fotoğrafların kaynağını bul', '5 dk', 'search', '#2B7FFF', 30,
  '["Tersine görsel arama, bir fotoğrafın nerede ve ne zaman ilk kez yayımlandığını bulmana yarar. Bu teknik, yanlış bağlamda kullanılan gerçek fotoğrafları tespit etmenin en etkili yollarından biridir.","Google Görseller, TinEye ve Yandex Görseller en yaygın araçlardır. Her biri farklı veritabanlarını tarar — birinde bulamazsan diğerini de dene.","Fotoğrafı arama motoruna sürükle-bırak yaparak veya URL''sini girerek arama başlatabilirsin. Mobilde ekran görüntüsü alıp yükleyebilirsin.","Sonuçlarda fotoğrafın farklı bağlamlarda kullanıldığını görürsen dikkat et. Örneğin, 2015''teki bir deprem fotoğrafının 2024 depremi olarak paylaşılması yanlış bağlam manipülasyonudur.","İpucu: teyit.org ve dogruluk.com.tr Türkiye''nin bağımsız doğrulama platformlarıdır. Şüphelendiğin içerikleri onlara bildirebilirsin."]'::jsonb,
  '[{"question":"Sosyal medyada viral olan bir fotoğrafın gerçek bağlamını öğrenmek için ne yaparsın?","options":["Beğeni sayısına bakarak karar veririm","Tersine görsel arama yaparım","Arkadaşlarıma sorarım","Hemen paylaşırım"],"correctIdx":1,"explanation":"Tersine görsel arama, fotoğrafın nereden ve ne zaman geldiğini ortaya koyar. Beğeni sayısı doğruluğun kanıtı değildir."},{"question":"Hangi araç tersine görsel arama için kullanılmaz?","options":["Google Görseller","TinEye","Yandex Görseller","Google Haritalar"],"correctIdx":3,"explanation":"Google Haritalar konum arama içindir. Tersine görsel arama için Google Görseller, TinEye veya Yandex kullanılır."}]'::jsonb,
  0, 1),

('l2', 'Metadata Analizi', 'Dosyanın gizli bilgilerini oku', '7 dk', 'file-text', '#9B59B6', 40,
  '["Her dijital fotoğrafın içinde EXIF (Exchangeable Image File Format) adı verilen gizli veriler bulunur. Bu veriler fotoğraf hakkında çok önemli ipuçları içerir.","EXIF verileri; çekim tarihi, konum bilgisi (GPS koordinatları), kamera modeli ve lens bilgisini içerebilir. Düzenlenmiş fotoğraflarda bu bilgiler tutarsız olabilir.","Jeffrey''s EXIF Viewer, ExifTool ve Jimpl.com gibi ücretsiz araçlarla bu verilere kolayca ulaşabilirsin. Fotoğrafı yükleyince tüm metadata görünür.","Manipüle edilmiş fotoğraflarda zaman damgaları çekimden sonraki bir tarihe işaret edebilir ya da konum bilgisi iddia edilen yerle örtüşmeyebilir.","Uyarı: Twitter, Instagram, WhatsApp gibi platformlar fotoğraf yüklenirken EXIF verilerini genellikle siler. Bu yüzden orijinal dosyaya ulaşmak her zaman mümkün değildir."]'::jsonb,
  '[{"question":"EXIF verisi nedir?","options":["Fotoğrafın dosya boyutu","Fotoğrafın içindeki gizli metadata","Fotoğrafın renk paleti","Fotoğrafın çözünürlüğü"],"correctIdx":1,"explanation":"EXIF, fotoğrafın çekim tarihi, konumu, kamera bilgisi gibi gizli verileri içeren metadata formatıdır."},{"question":"Sosyal medya platformları hakkında hangisi doğrudur?","options":["Tüm platformlar EXIF''i korur","Çoğu platform yükleme sırasında EXIF''i siler","Sadece Twitter EXIF''i siler","EXIF hiçbir zaman silinmez"],"correctIdx":1,"explanation":"Twitter, Instagram, WhatsApp gibi platformlar gizlilik ve depolama nedeniyle EXIF verilerini genellikle siler."}]'::jsonb,
  0, 2),

('l3', 'Kaynak Doğrulama', 'Haberin nereden geldiğini öğren', '6 dk', 'shield', '#00C851', 35,
  '["Bir haberi paylaşmadan önce birincil kaynağa ulaşmaya çalış. Birincil kaynak, haberi ilk kez yayımlayan ve doğrudan bilgiye erişimi olan kaynaktır.","Resmi kurumların (AFAD, TÜİK, Sağlık Bakanlığı gibi) kendi web siteleri ve mavi tik almış sosyal medya hesapları birincil kaynak sayılır. Onlardan alıntı yapan siteler ikincil kaynaktır.","Haberi tek bir kaynaktan gördüysen şüpheyle yaklaş. Birden fazla bağımsız kaynak aynı bilgiyi doğruluyorsa güvenilirlik artar.","Alan adını kontrol et: ''haberturk.xyz'', ''cnnturk.net'' gibi tanınmış marka adı kullanan ama farklı uzantıya sahip siteler taklit site olabilir. Resmi sitenin adresini doğrula.","Türkiye''de teyit.org ve dogruluk.com.tr bağımsız doğrulama platformlarıdır. Şüpheli içerikleri onlara bildirebilirsin — zaten haberi araştırmış olabilirler."]'::jsonb,
  '[{"question":"Bir haber için birincil kaynak hangisi sayılır?","options":["Haberi paylaşan bir Twitter kullanıcısı","AFAD''ın resmi web sitesi","WhatsApp grubundaki mesaj","Haber yapan YouTube kanalı"],"correctIdx":1,"explanation":"AFAD gibi resmi kurumların kendi web siteleri, bilginin doğrudan kaynağı olduğu için birincil kaynak sayılır."},{"question":"''haberturk.xyz'' gibi bir site için ne yapmalısın?","options":["Güvenilirdir, okuyabilirim","Resmi sitenin gerçek adresini doğrularım","Beğeni sayısına bakarım","Sadece başlığı okurum"],"correctIdx":1,"explanation":"Tanınmış marka adı kullanan farklı uzantılı siteler taklit site olabilir. Resmi sitenin adresini her zaman doğrula."}]'::jsonb,
  50, 3),

('l4', 'Duygusal Manipülasyon', 'Korku ve öfke tetikleyicilerini tanı', '8 dk', 'alert-triangle', '#FF9500', 45,
  '["Dezenformasyon çoğunlukla güçlü duygular — korku, öfke veya aşırı coşku — uyandırarak yayılır. Duygu yoğunluğu arttıkça eleştirel düşünce azalır.","Başlıkta ''ACİL'', ''YANGIN ALARMI'', ''HERKESE İLET'', ''PAYLAŞMAZSANIZ YAZIKLAR OLSUN'' gibi ifadeler görürsen dur ve düşün. Bu ifadeler seni hızlı hareket ettirmek için tasarlanmıştır.","Kendine şu soruyu sor: ''Bu paylaşım beni hemen harekete geçirmek mi istiyor?'' Cevap evet ise, paylaşmadan önce doğrulama yap.","Sosyal kanıt manipülasyonu: Yüksek beğeni, paylaşım veya yorum sayısı içeriğin doğruluğunu kanıtlamaz. Yanlış bilgiler çok hızlı yayılabilir çünkü insanlar duygusal tepki verirler.","Karşı önlem: Bir içerik seni çok kızdırıyor ya da çok korkutuyorsa, paylaşmadan önce 10 dakika bekle. Bu süre eleştirel düşünce için fırsat tanır."]'::jsonb,
  '[{"question":"Dezenformasyon neden güçlü duygular kullanır?","options":["İnsanların ilgisini çekmek için","Eleştirel düşünceyi azaltarak hızlı yayılmak için","Güzel görünmek için","Daha uzun okunması için"],"correctIdx":1,"explanation":"Güçlü duygular eleştirel düşünceyi devre dışı bırakır. Kişi doğrulama yapmadan paylaşma eğilimi gösterir."},{"question":"Seni öfkelendiren veya korkutan bir içerik gördüğünde ne yapmalısın?","options":["Hemen paylaşmalıyım, önemli olabilir","Görmezden gelmeliyim","Paylaşmadan önce bekleyip kaynağı kontrol etmeliyim","Arkadaşlarıma sorup paylaşmalıyım"],"correctIdx":2,"explanation":"Duygusal tepki veriyorsan bu dezenformasyon işareti olabilir. Bekle, kaynağı doğrula, sonra karar ver."}]'::jsonb,
  100, 4),

('l5', 'Yapay Zeka Görsel Tespiti', 'YZ üretimi fotoğrafları nasıl anlarsın', '6 dk', 'cpu', '#FF3B30', 40,
  '["Yapay zeka ile üretilen fotoğraflar giderek gerçekçileşiyor. Ancak dikkatli gözler için hâlâ ipuçları var. Bu becerileri öğrenmek artık temel bir medya okuryazarlığı gereksinimidir.","Ellere dikkat et: YZ modelleri parmak sayısını, eklem yapısını ve el şeklini sıklıkla yanlış üretir. Fazla veya eksik parmak, birbirine geçmiş eller sık görülen hatalardır.","Arka plan metinlerini incele: YZ genellikle anlamsız, birbirine karışmış veya bulanık yazılar üretir. Tabelalar, kitap kapakları veya ekranlar okunaksız görünebilir.","Kulak ve saç simetrisi: Gerçek yüzlerde hafif doğal asimetri bulunur. YZ görüntülerinde abartılı simetri, garip saç kökü geçişleri veya kulak şekli hatalar olabilir.","Araçlar: Hive Moderation, AI or Not (aiornot.com), ve Illuminarty gibi ücretsiz platformlar YZ tespiti yapabilir. Ancak bu araçlar da yanılabilir — manuel inceleme gereklidir."]'::jsonb,
  '[{"question":"YZ üretimi fotoğraflarda en sık görülen hata hangisidir?","options":["Yanlış renkler","El ve parmak hataları","Bulanık arka plan","Yanlış ışıklandırma"],"correctIdx":1,"explanation":"YZ modelleri parmak sayısı ve el yapısını üretmekte sıklıkla zorlanır. Bu en kolay tespit yöntemlerinden biridir."},{"question":"Bir görselin YZ üretimi olup olmadığını kontrol etmek için ne kullanırsın?","options":["Google Çeviri","aiornot.com gibi tespit araçları","Instagram filtreleri","Fotoğraf galerisi"],"correctIdx":1,"explanation":"aiornot.com, Hive Moderation gibi araçlar görüntüyü analiz ederek YZ olasılığını tahmin eder."}]'::jsonb,
  150, 5),

('l6', 'Bağlam Çıkarma Tekniği', 'Yanlış bağlamdaki gerçek içerikleri tanı', '5 dk', 'layers', '#00D4FF', 30,
  '["Yanlış bağlam manipülasyonu: Gerçek bir fotoğraf veya video, farklı bir olaya aitmiş gibi sunulur. Bu en yaygın dezenformasyon türlerinden biridir çünkü içerik ''gerçek'' görünür.","Tersine görsel arama ile fotoğrafın ilk ne zaman ve nerede yayımlandığını bul. Eğer fotoğraf çok eski bir tarihte başka bir ülkeden yayımlanmışsa, yanlış bağlam kullanılmış olabilir.","Fotoğraftaki detaylara bak: Araç plakaları, tabela yazıları, giysi tarzı ve mimari özellikler hangi ülke ve döneme ait olduğu hakkında ipuçları verebilir.","Video için: Videonun başlangıç ve bitişini izle. Klip kesilmiş olabilir ve bağlamı değiştiren kısımlar çıkarılmış olabilir.","Bir haber ''yurt dışından'' veya ''yurt içinden'' diye çerçeveleniyorsa bağlamı mutlaka doğrula. Mevsim, araç tipleri ve dil ipuçları yardımcı olabilir."]'::jsonb,
  '[{"question":"Yanlış bağlam manipülasyonu nedir?","options":["Sahte bir fotoğraf oluşturmak","Gerçek bir içeriği yanlış bir olay için kullanmak","Haber başlığını değiştirmek","Fotoğrafı düzenlemek"],"correctIdx":1,"explanation":"Yanlış bağlam manipülasyonunda içerik gerçektir ama yanlış bir zaman, yer veya olaya ait gibi sunulur."},{"question":"Bir fotoğrafın bağlamını doğrulamak için hangisine bakarsın?","options":["Kaç kişi beğenmiş","Plaka, tabela ve giysi tarzı gibi detaylar","Fotoğrafın boyutu","Yorumlar bölümü"],"correctIdx":1,"explanation":"Araç plakaları, tabela dili, mimari ve kıyafet tarzı gibi detaylar fotoğrafın gerçek konumu ve zamanı hakkında ipucu verir."}]'::jsonb,
  200, 6);


-- -----------------------------------------------------------
-- SİMÜLASYONLAR (Simulations) — Mevcut 3 simülasyon
-- -----------------------------------------------------------

INSERT INTO simulations (id, title, description, difficulty, xp_reward, category, steps, required_xp, order_index) VALUES

('s1', 'Viral WhatsApp Mesajı', 'Bir yakınınızdan alarmlı bir mesaj geliyor. Doğru kararı ver.', 1, 60, 'Sosyal Medya Kararları',
  '[{"id":"s1-n1","type":"narrative","text":"Annenin WhatsApp grubuna bir mesaj düşüyor: \"ACELE PAYLAŞ! Şehir suyuna tehlikeli kimyasal karıştı! Hastaneler doldu taşıyor! Herkese ulaştır!!\" Mesajın altında tanımadığın bir kişinin adı var."},{"id":"s1-c1","type":"choice","text":"İlk tepkin ne olur?","choices":[{"id":"a","text":"Hemen tüm gruplarıma iletirim, daha fazla kişi haberdar olsun.","isCorrect":false,"explanation":"Doğrulanmamış bir mesajı iletmek, yanlış bile olsa paniğe neden olur. Önce doğrula!","xpReward":0},{"id":"b","text":"Önce Belediye veya Sağlık Bakanlığı sitesini kontrol ederim.","isCorrect":true,"explanation":"Mükemmel! Resmi kaynakları kontrol etmek dezenformasyonla başa çıkmanın en etkili yoludur.","xpReward":30},{"id":"c","text":"Mesajı dikkate almam, doğru olmayabilir.","isCorrect":false,"explanation":"Görmezden gelmek yeterli değil. Kaynağı araştırıp başkalarını da uyarman gerekebilir.","xpReward":5}]},{"id":"s1-n2","type":"narrative","text":"Belediye web sitesini açıyorsun. Böyle bir duyuru yok. Sağlık Bakanlığı''nda da sessizlik. Şimdi ne yaparsın?"},{"id":"s1-c2","type":"choice","text":"Resmi kaynaklarda bilgi bulamadın. Bir sonraki adımın ne?","choices":[{"id":"a","text":"Resmi kaynaklarda yok demek saklamışlardır, paylaşırım.","isCorrect":false,"explanation":"Komplo teorisi tuzağı! Resmi kaynakların sessizliği, bilgiyi saklamak değil haberin yanlış olduğunun işaretidir.","xpReward":0},{"id":"b","text":"Anneye mesajı iletmemesini ve yanlış olabileceğini söylerim.","isCorrect":true,"explanation":"Harika! Çevrendeki insanları doğrulama yapmaya teşvik etmek dezenformasyonla mücadelede kritik.","xpReward":30},{"id":"c","text":"Teyit.org gibi bir doğrulama sitesine bildiririm.","isCorrect":true,"explanation":"Çok iyi! Bağımsız doğrulama platformları bu tür içerikleri araştırır ve kamuoyunu bilgilendirir.","xpReward":30}]}]'::jsonb,
  0, 1),

('s2', 'Siyasetçinin Sahte Sözü', 'Viral olan bir alıntının gerçekliğini sorgula ve doğru eylemi seç.', 2, 80, 'Sahte Alıntı',
  '[{"id":"s2-n1","type":"narrative","text":"X (Twitter) akışında bir paylaşım görüyorsun: \"Bakan açıkladı: ''Gençlerin sosyal medya kullanması millî güvenlik tehdididir!'' — Sabah gazetesi, bugün.\" Paylaşım 20 bin beğeni almış."},{"id":"s2-c1","type":"choice","text":"Paylaşıma tepkin ne olur?","choices":[{"id":"a","text":"20 bin beğeni almış, kesinlikle doğrudur. Yorumlara görüşümü yazarım.","isCorrect":false,"explanation":"Beğeni sayısı doğruluğun kanıtı değildir. Yanlış bilgiler çok hızlı yayılabilir.","xpReward":0},{"id":"b","text":"Sabah gazetesinin o günkü manşetlerine bakarım.","isCorrect":true,"explanation":"Doğru adım! Atıfta bulunulan kaynağı doğrudan kontrol etmek sahte alıntıları tespit etmenin en etkili yolu.","xpReward":40},{"id":"c","text":"Bakan''ın resmi sosyal medya hesabını incelerim.","isCorrect":true,"explanation":"Akıllıca! Yetkilinin kendi açıklamalarına bakmak, sahte alıntıları doğrulamak için önemli bir adım.","xpReward":40}]},{"id":"s2-n2","type":"narrative","text":"Sabah gazetesinde böyle bir haber yok. Bakan''ın resmi hesabında da böyle bir açıklama yok. Paylaşımı yapan hesap 2 gün önce açılmış ve 3 paylaşımı var."},{"id":"s2-c2","type":"choice","text":"Kanıtlar sahte olduğunu gösteriyor. Ne yapıyorsun?","choices":[{"id":"a","text":"Paylaşımı ''Sahte haber!'' diye kendi hesabımdan yeniden paylaşırım.","isCorrect":false,"explanation":"Dikkatli ol! Sahte olduğunu söylemek için paylaşmak da yayılmasına yardım eder. Daha etkili bir yol var.","xpReward":5},{"id":"b","text":"Platformun ''Yanlış bilgi bildir'' özelliğini kullanırım.","isCorrect":true,"explanation":"Mükemmel! Platformların şikayet mekanizmaları dezenformasyonla mücadelede en etkili araçlardandır.","xpReward":40},{"id":"c","text":"İçeriğin yanlış olduğunu, kaynaklarımla destekleyerek yorumda belirtirim.","isCorrect":true,"explanation":"Çok iyi! Kanıt göstererek düzeltme yapmak, diğer kullanıcıların da yanılmamasını sağlar.","xpReward":40}]}]'::jsonb,
  50, 2),

('s3', 'Deprem Anında Dezenformasyon', 'Kriz anında doğrulama baskısı altında doğru kararlar ver.', 3, 100, 'Kriz Senaryosu',
  '[{"id":"s3-n1","type":"narrative","text":"6.5 büyüklüğünde bir deprem oldu. Sosyal medya kaynıyor. Bir hesap ''Kadıköy''de çöken bina var, 50 kişi mahsur!'' yazıyor ve paylaşım binlere ulaşıyor. AFAD henüz açıklama yapmadı."},{"id":"s3-c1","type":"choice","text":"Bu anda ne yaparsın?","choices":[{"id":"a","text":"Acil durum bu, hemen paylaşırım. Yanlış bile olsa zararı olmaz.","isCorrect":false,"explanation":"Yanlış! Sahte ''çöken bina'' haberleri kurtarma ekiplerini yanlış yönlendirir ve gerçek kurbanların gecikmesine yol açar.","xpReward":0},{"id":"b","text":"AFAD''ın resmi açıklamasını beklerim.","isCorrect":true,"explanation":"Doğru! Kriz anında resmi kaynakları takip etmek hem güvenli hem de sorumluluk sahibi davranıştır.","xpReward":50},{"id":"c","text":"Hesabın geçmişini incelerim — daha önce doğru haber yaptı mı?","isCorrect":true,"explanation":"Akıllıca! Hesabın güvenilirlik geçmişi, bilginin doğruluğu hakkında önemli ipuçları verir.","xpReward":50}]},{"id":"s3-n2","type":"narrative","text":"AFAD açıkladı: Kadıköy''de hasar raporu yok. Paylaşım tamamen yanlıştı. Ama binler bu bilgiyle zaten panik yaşadı, bazıları bölgeye koştu. Şimdi ne hissediyorsun?"},{"id":"s3-c2","type":"choice","text":"Bu deneyimden çıkarman gereken en önemli ders nedir?","choices":[{"id":"a","text":"Kriz anlarında sosyal medyayı hiç kullanmamak gerekir.","isCorrect":false,"explanation":"Bu aşırı bir çözüm. Sosyal medya kriz anında doğru kullanıldığında çok değerli olabilir.","xpReward":5},{"id":"b","text":"Doğrulama hızı, paylaşım hızından her zaman önce gelmelidir.","isCorrect":true,"explanation":"Tam olarak! ''Doğrulama hızı > Paylaşım hızı'' dedektifin temel kuralıdır. Kriz anında da geçerlidir.","xpReward":50},{"id":"c","text":"Resmi kaynaklar sessiz kaldığında bilgiye güvenilmez.","isCorrect":false,"explanation":"Resmi kaynakların sessizliği, bilgileri doğrulama sürecinde oldukları anlamına gelebilir. Sabır önemlidir.","xpReward":10}]}]'::jsonb,
  100, 3);


-- ============================================================
-- 4. YARDIMCI FONKSIYONLAR
-- ============================================================

-- Kullanıcının erişebildiği vakaları getir (progressive unlock)
-- Kullanım: SELECT * FROM get_available_missions(500);
CREATE OR REPLACE FUNCTION get_available_missions(user_xp INTEGER)
RETURNS SETOF missions AS $$
  SELECT * FROM missions
  WHERE is_active = true AND required_xp <= user_xp
  ORDER BY order_index;
$$ LANGUAGE sql STABLE;

-- Kullanıcının erişebildiği dersleri getir
CREATE OR REPLACE FUNCTION get_available_lessons(user_xp INTEGER)
RETURNS SETOF lessons AS $$
  SELECT * FROM lessons
  WHERE is_active = true AND required_xp <= user_xp
  ORDER BY order_index;
$$ LANGUAGE sql STABLE;

-- Kullanıcının erişebildiği simülasyonları getir
CREATE OR REPLACE FUNCTION get_available_simulations(user_xp INTEGER)
RETURNS SETOF simulations AS $$
  SELECT * FROM simulations
  WHERE is_active = true AND required_xp <= user_xp
  ORDER BY order_index;
$$ LANGUAGE sql STABLE;


-- ============================================================
-- KURULUM TAMAMLANDI
-- Toplam: 8 vaka + 6 ders + 3 simülasyon eklendi.
-- Yeni içerik eklemek için tablolara INSERT yapabilirsin.
-- ============================================================
