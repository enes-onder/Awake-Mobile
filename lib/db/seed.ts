import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { lessonsTable, missionsTable, simulationsTable } from "./src/schema/index.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const missions = [
  {
    id: "m1",
    title: "Sel Felaketi Fotoğrafı",
    description: "Sosyal medyada viral olan bu paylaşımın doğruluğunu araştır.",
    difficulty: 1,
    type: "photo",
    xpReward: 25,
    category: "Yanlış Bağlam",
    verdict: "fake",
    content: {
      accountName: "Haber Acil TR",
      accountHandle: "@haberaciltr",
      timestamp: "2 saat önce",
      text: "YANGIN ALARMI! Dün gece İstanbul'da yaşanan sel felaketinden korkunç görüntüler! Araçlar sürükleniyor, kayıp sayısı artıyor! Paylaş, herkes görsün! #istanbul #sel #felaket",
      likes: "8.4K",
      shares: "14.2K",
      platform: "twitter",
      imageTag: "FOTOĞRAF: Sel görüntüleri",
    },
    clues: [
      "Tersine görsel arama: Bu fotoğraf 2021 yılında Brezilya'da çekilmiş.",
      "Metadata analizi: Dosya zaman damgası 3 yıl önceye ait.",
      "İstanbul Büyükşehir Belediyesi'nin resmi hesabında böyle bir açıklama yok.",
    ],
    explanation:
      "Bu fotoğraf gerçek bir sel felaketine ait, ancak İstanbul'da yaşanmamıştır. 2021 yılında Brezilya'da çekilmiş ve yanlış bağlamda paylaşılarak panik yaratmak amacıyla kullanılmıştır.",
    requiredXp: 0,
    orderIndex: 1,
    isActive: true,
  },
  {
    id: "m2",
    title: "Bakan Açıklaması",
    description: "Bir bakana atıfla paylaşılan bu alıntıyı doğrula.",
    difficulty: 2,
    type: "quote",
    xpReward: 35,
    category: "Sahte Alıntı",
    verdict: "fake",
    content: {
      accountName: "Gündem TR",
      accountHandle: "@gundemmtr",
      timestamp: "5 saat önce",
      text: "FLAŞ: Sağlık Bakanı açıkladı: 'Artık tüm ilaçlar ücretli olacak, ücretsiz ilaç dönemi bitti.' Kaynak: Sabah gazetesi röportajı. #sağlık #ilaç",
      likes: "2.1K",
      shares: "6.8K",
      platform: "twitter",
    },
    clues: [
      "Sabah gazetesi arşivinde bu röportaj bulunamadı.",
      "Sağlık Bakanlığı resmi hesabında bu yönde bir açıklama yok.",
      "Aynı iddia birden fazla sahte hesap tarafından eş zamanlı paylaşıldı.",
    ],
    explanation:
      "Bu alıntı tamamen uydurma. Sağlık Bakanı böyle bir açıklama yapmamıştır. İddianın atıfta bulunduğu Sabah gazetesi arşivinde böyle bir röportaj bulunmamaktadır.",
    requiredXp: 0,
    orderIndex: 2,
    isActive: true,
  },
  {
    id: "m3",
    title: "Aşı Yan Etkileri",
    description: "WhatsApp'ta yayılan bu mesajın içeriğini değerlendir.",
    difficulty: 2,
    type: "stats",
    xpReward: 35,
    category: "Yanıltıcı İstatistik",
    verdict: "fake",
    content: {
      accountName: "Ailecek Sağlık",
      accountHandle: "WhatsApp Grubu",
      timestamp: "Dün, 22:14",
      text: "ACELE PAYLAŞ! Yeni yapılan araştırma: Grip aşısı yapılan çocukların %73'ünde ciddi yan etkiler görüldü. Avustralya'daki 50.000 kişilik çalışma. Çocuklarınızı koruyun! Doktorlar susuyor!",
      likes: "",
      shares: "Binlerce kez iletildi",
      platform: "whatsapp",
    },
    clues: [
      "Avustralya sağlık otoritelerinin veri tabanında böyle bir çalışma yok.",
      "%73 istatistiği hiçbir hakemli dergide yayımlanmamış.",
      "Gerçek yan etki oranı WHO verilerine göre %0.1'den az.",
    ],
    explanation:
      "Bu mesaj tipik bir dezenformasyon örneğidir. Belirtilen araştırma gerçekte var olmamaktadır. WHO ve Avustralya Sağlık Bakanlığı verilerine göre grip aşısının ciddi yan etki oranı son derece düşüktür.",
    requiredXp: 0,
    orderIndex: 3,
    isActive: true,
  },
  {
    id: "m4",
    title: "Deprem Uyarısı",
    description: "Bu acil deprem uyarısı paylaşımını analiz et.",
    difficulty: 1,
    type: "headline",
    xpReward: 20,
    category: "Panik Haberi",
    verdict: "fake",
    content: {
      accountName: "Deprem Bilgi Merkezi",
      accountHandle: "@deprembildir",
      timestamp: "30 dakika önce",
      text: "ACİL UYARI! Bugün gece yarısı İstanbul'da 7.8 büyüklüğünde deprem bekleniyor! AFAD tarafından doğrulandı! Binalarınızı TERK EDİN! Bu mesajı herkese iletin!",
      likes: "1.2K",
      shares: "45.6K",
      platform: "twitter",
    },
    clues: [
      "AFAD'ın resmi hesabında böyle bir uyarı bulunmuyor.",
      "Depremler önceden kesin olarak tahmin edilemez — bu bilimsel gerçek.",
      "Hesap 3 gün önce açılmış, 0 takipçisi var.",
    ],
    explanation:
      "Depremler mevcut bilimle kesin olarak tahmin edilemez. AFAD, böyle bir uyarı yapmamıştır. Bu tür paylaşımlar toplumsal paniğe ve binalara zarar verebilecek gereksiz tahliyeye neden olmaktadır.",
    requiredXp: 0,
    orderIndex: 4,
    isActive: true,
  },
  {
    id: "m5",
    title: "Çevre Raporu",
    description: "BM tarafından yayımlandığı iddia edilen bu raporu incele.",
    difficulty: 3,
    type: "stats",
    xpReward: 50,
    category: "Sahte Rapor",
    verdict: "fake",
    content: {
      accountName: "Eko Dünya",
      accountHandle: "@ekodunyatr",
      timestamp: "1 gün önce",
      text: "BM raporuna göre Türkiye, kişi başına düşen plastik tüketimde DÜNYA BİRİNCİSİ oldu. 2023 verisi: yılda 847 kg plastik. Rapor linki: bit.ly/unplastik2024",
      likes: "3.7K",
      shares: "9.1K",
      platform: "twitter",
    },
    clues: [
      "BM Çevre Programı raporlarında Türkiye 1. sırada yer almıyor.",
      "Verilen link meşru bir BM sayfasına yönlendirilmiyor.",
      "847 kg/kişi rakamı küresel ortalamadan 20 kat fazla — fiziksel olarak imkansız.",
    ],
    explanation:
      "Bu iddia yanlıştır. BM verilerine göre kişi başına plastik tüketimde ABD, Avustralya ve bazı Körfez ülkeleri üst sıralarda yer almaktadır. Paylaşılan link sahte bir sayfaya yönlendirmektedir.",
    requiredXp: 100,
    orderIndex: 5,
    isActive: true,
  },
  {
    id: "m6",
    title: "Müze Sergisi",
    description: "Bu müze haberi gerçek mi?",
    difficulty: 1,
    type: "headline",
    xpReward: 20,
    category: "Gerçek Haber",
    verdict: "real",
    content: {
      accountName: "Kültür Sanat TR",
      accountHandle: "@kultursanattr",
      timestamp: "3 saat önce",
      text: "İstanbul Arkeoloji Müzesi, 2025 yılında 1 milyonun üzerinde ziyaretçi ağırladı. Bu, müzenin tarihindeki en yüksek rakam. Müze Müdürü: 'Dijital rehberlik uygulaması ilginin artmasında büyük rol oynadı.'",
      likes: "892",
      shares: "1.4K",
      platform: "news",
    },
    clues: [
      "Kültür Bakanlığı resmi istatistikleri bu rakamı doğruluyor.",
      "Müze web sitesinde dijital rehber uygulaması duyurusu mevcut.",
      "Birden fazla bağımsız haber kaynağı aynı haberi yayımladı.",
    ],
    explanation:
      "Bu haber gerçektir. İstanbul Arkeoloji Müzesi, 2025 yılında rekor ziyaretçi sayısına ulaşmıştır. Kültür Bakanlığı istatistikleri ve müzenin kendi açıklaması bu bilgiyi doğrulamaktadır.",
    requiredXp: 0,
    orderIndex: 6,
    isActive: true,
  },
  {
    id: "m7",
    title: "Yapay Zeka Fotoğrafı",
    description: "Siyasi bir etkinliği gösteren bu fotoğrafı incele.",
    difficulty: 3,
    type: "photo",
    xpReward: 50,
    category: "Yapay Zeka Manipülasyonu",
    verdict: "fake",
    content: {
      accountName: "Politika Haber",
      accountHandle: "@politikahaber7",
      timestamp: "6 saat önce",
      text: "Belediye toplantısında skandal! Yetkili, toplantı salonunda uyuya kaldı. Fotoğraf sosyal medyayı salladı! #belediye #skandal",
      likes: "5.2K",
      shares: "18.3K",
      platform: "instagram",
      imageTag: "FOTOĞRAF: Toplantı anı",
    },
    clues: [
      "Fotoğraftaki kişinin elleri anormal şekilde görünüyor — YZ belirtisi.",
      "Arka plandaki yazılar bulanık ve anlamsız — YZ üretimi göstergesi.",
      "Bağlantılı haber kaynağı bulunamadı, hesap 1 haftalık.",
    ],
    explanation:
      "Bu fotoğraf yapay zeka tarafından üretilmiştir. YZ'nin klasik hataları görünmektedir: anormal el detayları, bulanık arka plan yazıları ve abartılı yüz ifadesi.",
    requiredXp: 100,
    orderIndex: 7,
    isActive: true,
  },
  {
    id: "m8",
    title: "Bilim İnsanı Açıklaması",
    description: "Ünlü bir fizikçiye atfedilen bu alıntıyı değerlendir.",
    difficulty: 2,
    type: "quote",
    xpReward: 35,
    category: "Sahte Alıntı",
    verdict: "fake",
    content: {
      accountName: "Bilim Günlüğü",
      accountHandle: "@bilimgunlugu",
      timestamp: "2 gün önce",
      text: "Stephen Hawking: 'Akıllı telefonlar, insanlığın bugüne kadar ürettiği en zararlı icattır. Gençliği yok ediyor.' — 2018 Cambridge konferansı",
      likes: "4.1K",
      shares: "7.9K",
      platform: "twitter",
    },
    clues: [
      "2018 Cambridge konferans kayıtlarında bu alıntı yer almıyor.",
      "Hawking, hayatı boyunca teknolojiyi genel olarak destekledi.",
      "Bu alıntı, Hawking'in 2018'deki vefatından sonra ortaya çıktı.",
    ],
    explanation:
      "Bu alıntı uydurma. Stephen Hawking böyle bir açıklama yapmamıştır. Otoriter isimlere sahte sözler atfetmek, dezenformasyonun yaygın bir tekniğidir.",
    requiredXp: 50,
    orderIndex: 8,
    isActive: true,
  },
];

const simulations = [
  {
    id: "s1",
    title: "Viral WhatsApp Mesajı",
    description: "Bir yakınınızdan alarmlı bir mesaj geliyor. Doğru kararı ver.",
    difficulty: 1,
    xpReward: 60,
    category: "Sosyal Medya Kararları",
    steps: [
      {
        id: "s1-n1",
        type: "narrative",
        text: "Annenin WhatsApp grubuna bir mesaj düşüyor: \"ACELE PAYLAŞ! Şehir suyuna tehlikeli kimyasal karıştı! Hastaneler doldu taşıyor! Herkese ulaştır!!\" Mesajın altında tanımadığın bir kişinin adı var.",
      },
      {
        id: "s1-c1",
        type: "choice",
        text: "İlk tepkin ne olur?",
        choices: [
          {
            id: "a",
            text: "Hemen tüm gruplarıma iletirim, daha fazla kişi haberdar olsun.",
            isCorrect: false,
            explanation: "Doğrulanmamış bir mesajı iletmek, yanlış bile olsa paniğe neden olur. Önce doğrula!",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Belediye veya Sağlık Bakanlığı'nın resmi sitesini kontrol ederim.",
            isCorrect: true,
            explanation: "Doğru! Resmi kaynakları kontrol etmek her zaman ilk adım olmalı.",
            xpReward: 20,
          },
          {
            id: "c",
            text: "Arkadaşlarıma sorarım, onlar biliyordur.",
            isCorrect: false,
            explanation: "Arkadaşların da aynı yanlış bilgiye sahip olabilir. Birincil kaynaklara git.",
            xpReward: 0,
          },
        ],
      },
      {
        id: "s1-n2",
        type: "narrative",
        text: "Belediye sitesinde böyle bir uyarı yok. Ama mesaj çok gerçekçi görünüyor ve annen endişelenmiş durumda.",
      },
      {
        id: "s1-c2",
        type: "choice",
        text: "Şimdi ne yaparsın?",
        choices: [
          {
            id: "a",
            text: "Belki belediye henüz güncellemedi, ihtiyaten iletirim.",
            isCorrect: false,
            explanation: "Doğrulanmamış bilgiyi yaymak yanlıştır. 'İhtiyaten' paylaşmak panik yaratabilir.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Anneme sakin ol derim ve resmi açıklama bekleriz.",
            isCorrect: true,
            explanation: "Doğru! Paniklemeden resmi açıklama beklemek en sağlıklı yaklaşım.",
            xpReward: 20,
          },
          {
            id: "c",
            text: "Su içmeyi keserim, zarar gelmez.",
            isCorrect: false,
            explanation: "Doğrulanmamış bilgiye göre davranmak gereksiz endişeye yol açar.",
            xpReward: 0,
          },
        ],
      },
    ],
    requiredXp: 0,
    orderIndex: 1,
    isActive: true,
  },
  {
    id: "s2",
    title: "Sosyal Medya Algoritması",
    description: "Bir haber döngüsünde fark yaratmak için doğru kararı ver.",
    difficulty: 2,
    xpReward: 80,
    category: "Dijital Medya Okuryazarlığı",
    steps: [
      {
        id: "s2-n1",
        type: "narrative",
        text: "Twitter'da çok paylaşılan bir haber görüyorsun: 'Ünlü bilim insanı: Aşılar DNA'yı değiştiriyor!' Paylaşım sayısı 50.000'i geçmiş.",
      },
      {
        id: "s2-c1",
        type: "choice",
        text: "Yüksek paylaşım sayısı ne anlama gelir?",
        choices: [
          {
            id: "a",
            text: "Çok paylaşılmış, kesinlikle doğrudur.",
            isCorrect: false,
            explanation: "Paylaşım sayısı doğruluğun kanıtı değildir. Yanlış bilgiler de viral olabilir.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "İçerik duygusal tepki uyandırmış olabilir, doğrulamam gerek.",
            isCorrect: true,
            explanation: "Doğru! Viral içerikler çoğunlukla güçlü duygular uyandırdığı için yayılır, doğru oldukları için değil.",
            xpReward: 25,
          },
          {
            id: "c",
            text: "Paylaşılan her şey incelenmez, geçiyorum.",
            isCorrect: false,
            explanation: "Kritik düşünce gerektirir. Özellikle bilim konularında doğrulama önemli.",
            xpReward: 0,
          },
        ],
      },
    ],
    requiredXp: 50,
    orderIndex: 2,
    isActive: true,
  },
  {
    id: "s3",
    title: "Haber Kaynağı Testi",
    description: "Farklı kaynaklardan gelen haberleri değerlendir.",
    difficulty: 3,
    xpReward: 100,
    category: "Kaynak Analizi",
    steps: [
      {
        id: "s3-n1",
        type: "narrative",
        text: "Üç farklı kaynaktan aynı konu hakkında haberler geliyor: 1) Resmi devlet kurumu sitesi 2) Tanımadığın bir blog 3) Sosyal medya paylaşımı",
      },
      {
        id: "s3-c1",
        type: "choice",
        text: "Hangi kaynağa öncelik verirsin?",
        choices: [
          {
            id: "a",
            text: "En çok beğeni alan sosyal medya paylaşımı.",
            isCorrect: false,
            explanation: "Beğeni sayısı güvenilirlik göstergesi değildir.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Resmi devlet kurumu sitesi, birincil kaynak olduğu için.",
            isCorrect: true,
            explanation: "Doğru! Birincil kaynaklar en güvenilir bilgi kaynaklarıdır.",
            xpReward: 30,
          },
          {
            id: "c",
            text: "Blog, bağımsız olduğu için daha tarafsızdır.",
            isCorrect: false,
            explanation: "Bağımsız olmak tarafsızlık veya doğruluk anlamına gelmez. Kaynak güvenilirliği önemli.",
            xpReward: 0,
          },
        ],
      },
    ],
    requiredXp: 150,
    orderIndex: 3,
    isActive: true,
  },
];

const lessons = [
  {
    id: "l1",
    title: "Tersine Görsel Arama",
    subtitle: "Fotoğrafların kaynağını bul",
    duration: "5 dk",
    icon: "search",
    color: "#2B7FFF",
    xpReward: 30,
    content: [
      "Tersine görsel arama, bir fotoğrafın nerede ve ne zaman ilk kez yayımlandığını bulmana yarar. Bu teknik, yanlış bağlamda kullanılan gerçek fotoğrafları tespit etmenin en etkili yollarından biridir.",
      "Google Görseller, TinEye ve Yandex Görseller en yaygın araçlardır. Her biri farklı veritabanlarını tarar — birinde bulamazsan diğerini de dene.",
      "Fotoğrafı arama motoruna sürükle-bırak yaparak veya URL'sini girerek arama başlatabilirsin. Mobilde ekran görüntüsü alıp yükleyebilirsin.",
      "Sonuçlarda fotoğrafın farklı bağlamlarda kullanıldığını görürsen dikkat et. Örneğin, 2015'teki bir deprem fotoğrafının 2024 depremi olarak paylaşılması yanlış bağlam manipülasyonudur.",
      "İpucu: teyit.org ve dogruluk.com.tr Türkiye'nin bağımsız doğrulama platformlarıdır. Şüphelendiğin içerikleri onlara bildirebilirsin.",
    ],
    quiz: [
      {
        question: "Sosyal medyada viral olan bir fotoğrafın gerçek bağlamını öğrenmek için ne yaparsın?",
        options: ["Beğeni sayısına bakarak karar veririm", "Tersine görsel arama yaparım", "Arkadaşlarıma sorarım", "Hemen paylaşırım"],
        correctIdx: 1,
        explanation: "Tersine görsel arama, fotoğrafın nereden ve ne zaman geldiğini ortaya koyar. Beğeni sayısı doğruluğun kanıtı değildir.",
      },
      {
        question: "Hangi araç tersine görsel arama için kullanılmaz?",
        options: ["Google Görseller", "TinEye", "Yandex Görseller", "Google Haritalar"],
        correctIdx: 3,
        explanation: "Google Haritalar konum arama içindir. Tersine görsel arama için Google Görseller, TinEye veya Yandex kullanılır.",
      },
    ],
    requiredXp: 0,
    orderIndex: 1,
    isActive: true,
  },
  {
    id: "l2",
    title: "Metadata Analizi",
    subtitle: "Dosyanın gizli bilgilerini oku",
    duration: "7 dk",
    icon: "file-text",
    color: "#9B59B6",
    xpReward: 40,
    content: [
      "Her dijital fotoğrafın içinde EXIF (Exchangeable Image File Format) adı verilen gizli veriler bulunur. Bu veriler fotoğraf hakkında çok önemli ipuçları içerir.",
      "EXIF verileri; çekim tarihi, konum bilgisi (GPS koordinatları), kamera modeli ve lens bilgisini içerebilir. Düzenlenmiş fotoğraflarda bu bilgiler tutarsız olabilir.",
      "Jeffrey's EXIF Viewer, ExifTool ve Jimpl.com gibi ücretsiz araçlarla bu verilere kolayca ulaşabilirsin. Fotoğrafı yükleyince tüm metadata görünür.",
      "Manipüle edilmiş fotoğraflarda zaman damgaları çekimden sonraki bir tarihe işaret edebilir ya da konum bilgisi iddia edilen yerle örtüşmeyebilir.",
      "Uyarı: Twitter, Instagram, WhatsApp gibi platformlar fotoğraf yüklenirken EXIF verilerini genellikle siler. Bu yüzden orijinal dosyaya ulaşmak her zaman mümkün değildir.",
    ],
    quiz: [
      {
        question: "EXIF verisi nedir?",
        options: ["Fotoğrafın dosya boyutu", "Fotoğrafın içindeki gizli metadata", "Fotoğrafın renk paleti", "Fotoğrafın çözünürlüğü"],
        correctIdx: 1,
        explanation: "EXIF, fotoğrafın çekim tarihi, konumu, kamera bilgisi gibi gizli verileri içeren metadata formatıdır.",
      },
      {
        question: "Sosyal medya platformları hakkında hangisi doğrudur?",
        options: ["Tüm platformlar EXIF'i korur", "Çoğu platform yükleme sırasında EXIF'i siler", "Sadece Twitter EXIF'i siler", "EXIF hiçbir zaman silinmez"],
        correctIdx: 1,
        explanation: "Twitter, Instagram, WhatsApp gibi platformlar gizlilik ve depolama nedeniyle EXIF verilerini genellikle siler.",
      },
    ],
    requiredXp: 0,
    orderIndex: 2,
    isActive: true,
  },
  {
    id: "l3",
    title: "Kaynak Doğrulama",
    subtitle: "Haberin nereden geldiğini öğren",
    duration: "6 dk",
    icon: "shield",
    color: "#00C851",
    xpReward: 35,
    content: [
      "Bir haberi paylaşmadan önce birincil kaynağa ulaşmaya çalış. Birincil kaynak, haberi ilk kez yayımlayan ve doğrudan bilgiye erişimi olan kaynaktır.",
      "Resmi kurumların (AFAD, TÜİK, Sağlık Bakanlığı gibi) kendi web siteleri ve mavi tik almış sosyal medya hesapları birincil kaynak sayılır. Onlardan alıntı yapan siteler ikincil kaynaktır.",
      "Haberi tek bir kaynaktan gördüysen şüpheyle yaklaş. Birden fazla bağımsız kaynak aynı bilgiyi doğruluyorsa güvenilirlik artar.",
      "Alan adını kontrol et: 'haberturk.xyz', 'cnnturk.net' gibi tanınmış marka adı kullanan ama farklı uzantıya sahip siteler taklit site olabilir. Resmi sitenin adresini doğrula.",
      "Türkiye'de teyit.org ve dogruluk.com.tr bağımsız doğrulama platformlarıdır. Şüpheli içerikleri onlara bildirebilirsin — zaten haberi araştırmış olabilirler.",
    ],
    quiz: [
      {
        question: "Bir haber için birincil kaynak hangisi sayılır?",
        options: ["Haberi paylaşan bir Twitter kullanıcısı", "AFAD'ın resmi web sitesi", "WhatsApp grubundaki mesaj", "Haber yapan YouTube kanalı"],
        correctIdx: 1,
        explanation: "AFAD gibi resmi kurumların kendi web siteleri, bilginin doğrudan kaynağı olduğu için birincil kaynak sayılır.",
      },
      {
        question: "'haberturk.xyz' gibi bir site için ne yapmalısın?",
        options: ["Güvenilirdir, okuyabilirim", "Resmi sitenin gerçek adresini doğrularım", "Beğeni sayısına bakarım", "Sadece başlığı okurum"],
        correctIdx: 1,
        explanation: "Tanınmış marka adı kullanan farklı uzantılı siteler taklit site olabilir. Resmi sitenin adresini her zaman doğrula.",
      },
    ],
    requiredXp: 50,
    orderIndex: 3,
    isActive: true,
  },
  {
    id: "l4",
    title: "Duygusal Manipülasyon",
    subtitle: "Korku ve öfke tetikleyicilerini tanı",
    duration: "8 dk",
    icon: "alert-triangle",
    color: "#FF9500",
    xpReward: 45,
    content: [
      "Dezenformasyon çoğunlukla güçlü duygular — korku, öfke veya aşırı coşku — uyandırarak yayılır. Duygu yoğunluğu arttıkça eleştirel düşünce azalır.",
      "Başlıkta 'ACİL', 'YANGIN ALARMI', 'HERKESE İLET', 'PAYLAŞMAZSANIZ YAZIKLAR OLSUN' gibi ifadeler görürsen dur ve düşün. Bu ifadeler seni hızlı hareket ettirmek için tasarlanmıştır.",
      "Kendine şu soruyu sor: 'Bu paylaşım beni hemen harekete geçirmek mi istiyor?' Cevap evet ise, paylaşmadan önce doğrulama yap.",
      "Sosyal kanıt manipülasyonu: Yüksek beğeni, paylaşım veya yorum sayısı içeriğin doğruluğunu kanıtlamaz. Yanlış bilgiler çok hızlı yayılabilir çünkü insanlar duygusal tepki verirler.",
      "Karşı önlem: Bir içerik seni çok kızdırıyor ya da çok korkutuyorsa, paylaşmadan önce 10 dakika bekle. Bu süre eleştirel düşünce için fırsat tanır.",
    ],
    quiz: [
      {
        question: "Dezenformasyon neden güçlü duygular kullanır?",
        options: ["İnsanların ilgisini çekmek için", "Eleştirel düşünceyi azaltarak hızlı yayılmak için", "Güzel görünmek için", "Daha uzun okunması için"],
        correctIdx: 1,
        explanation: "Güçlü duygular eleştirel düşünceyi devre dışı bırakır. Kişi doğrulama yapmadan paylaşma eğilimi gösterir.",
      },
      {
        question: "Seni öfkelendiren veya korkutan bir içerik gördüğünde ne yapmalısın?",
        options: ["Hemen paylaşmalıyım, önemli olabilir", "Görmezden gelmeliyim", "Paylaşmadan önce bekleyip kaynağı kontrol etmeliyim", "Arkadaşlarıma sorup paylaşmalıyım"],
        correctIdx: 2,
        explanation: "Duygusal tepki veriyorsan bu dezenformasyon işareti olabilir. Bekle, kaynağı doğrula, sonra karar ver.",
      },
    ],
    requiredXp: 100,
    orderIndex: 4,
    isActive: true,
  },
  {
    id: "l5",
    title: "Yapay Zeka Görsel Tespiti",
    subtitle: "YZ üretimi fotoğrafları nasıl anlarsın",
    duration: "6 dk",
    icon: "cpu",
    color: "#FF3B30",
    xpReward: 40,
    content: [
      "Yapay zeka ile üretilen fotoğraflar giderek gerçekçileşiyor. Ancak dikkatli gözler için hâlâ ipuçları var. Bu becerileri öğrenmek artık temel bir medya okuryazarlığı gereksinimidir.",
      "Ellere dikkat et: YZ modelleri parmak sayısını, eklem yapısını ve el şeklini sıklıkla yanlış üretir. Fazla veya eksik parmak, birbirine geçmiş eller sık görülen hatalardır.",
      "Arka plan metinlerini incele: YZ genellikle anlamsız, birbirine karışmış veya bulanık yazılar üretir. Tabelalar, kitap kapakları veya ekranlar okunaksız görünebilir.",
      "Kulak ve saç simetrisi: Gerçek yüzlerde hafif doğal asimetri bulunur. YZ görüntülerinde abartılı simetri, garip saç kökü geçişleri veya kulak şekli hatalar olabilir.",
      "Araçlar: Hive Moderation, AI or Not (aiornot.com), ve Illuminarty gibi ücretsiz platformlar YZ tespiti yapabilir. Ancak bu araçlar da yanılabilir — manuel inceleme gereklidir.",
    ],
    quiz: [
      {
        question: "YZ üretimi fotoğraflarda en sık görülen hata hangisidir?",
        options: ["Yanlış renkler", "El ve parmak hataları", "Bulanık arka plan", "Yanlış ışıklandırma"],
        correctIdx: 1,
        explanation: "YZ modelleri parmak sayısı ve el yapısını üretmekte sıklıkla zorlanır. Bu en kolay tespit yöntemlerinden biridir.",
      },
      {
        question: "Bir görselin YZ üretimi olup olmadığını kontrol etmek için ne kullanırsın?",
        options: ["Google Çeviri", "aiornot.com gibi tespit araçları", "Instagram filtreleri", "Fotoğraf galerisi"],
        correctIdx: 1,
        explanation: "aiornot.com, Hive Moderation gibi araçlar görüntüyü analiz ederek YZ olasılığını tahmin eder.",
      },
    ],
    requiredXp: 150,
    orderIndex: 5,
    isActive: true,
  },
  {
    id: "l6",
    title: "Bağlam Çıkarma Tekniği",
    subtitle: "Yanlış bağlamdaki gerçek içerikleri tanı",
    duration: "5 dk",
    icon: "layers",
    color: "#00D4FF",
    xpReward: 30,
    content: [
      "Yanlış bağlam manipülasyonu: Gerçek bir fotoğraf veya video, farklı bir olaya aitmiş gibi sunulur. Bu en yaygın dezenformasyon türlerinden biridir çünkü içerik 'gerçek' görünür.",
      "Tersine görsel arama ile fotoğrafın ilk ne zaman ve nerede yayımlandığını bul. Eğer fotoğraf çok eski bir tarihte başka bir ülkeden yayımlanmışsa, yanlış bağlam kullanılmış olabilir.",
      "Fotoğraftaki detaylara bak: Araç plakaları, tabela yazıları, giysi tarzı ve mimari özellikler hangi ülke ve döneme ait olduğu hakkında ipuçları verebilir.",
      "Video için: Videonun başlangıç ve bitişini izle. Klip kesilmiş olabilir ve bağlamı değiştiren kısımlar çıkarılmış olabilir.",
      "Bir haber 'yurt dışından' veya 'yurt içinden' diye çerçeveleniyorsa bağlamı mutlaka doğrula. Mevsim, araç tipleri ve dil ipuçları yardımcı olabilir.",
    ],
    quiz: [
      {
        question: "Yanlış bağlam manipülasyonu nedir?",
        options: ["Sahte bir fotoğraf oluşturmak", "Gerçek bir içeriği yanlış bir olay için kullanmak", "Haber başlığını değiştirmek", "Fotoğrafı düzenlemek"],
        correctIdx: 1,
        explanation: "Yanlış bağlam manipülasyonunda içerik gerçektir ama yanlış bir zaman, yer veya olaya ait gibi sunulur.",
      },
      {
        question: "Bir fotoğrafın bağlamını doğrulamak için hangisine bakarsın?",
        options: ["Kaç kişi beğenmiş", "Plaka, tabela ve giysi tarzı gibi detaylar", "Fotoğrafın boyutu", "Yorumlar bölümü"],
        correctIdx: 1,
        explanation: "Araç plakaları, tabela dili, mimari ve kıyafet tarzı gibi detaylar fotoğrafın gerçek konumu ve zamanı hakkında ipucu verir.",
      },
    ],
    requiredXp: 200,
    orderIndex: 6,
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding missions...");
  for (const mission of missions) {
    await db.insert(missionsTable).values(mission).onConflictDoNothing();
    console.log(`  ✓ ${mission.id}: ${mission.title}`);
  }

  console.log("Seeding simulations...");
  for (const simulation of simulations) {
    await db.insert(simulationsTable).values(simulation).onConflictDoNothing();
    console.log(`  ✓ ${simulation.id}: ${simulation.title}`);
  }

  console.log("Seeding lessons...");
  for (const lesson of lessons) {
    await db.insert(lessonsTable).values(lesson).onConflictDoNothing();
    console.log(`  ✓ ${lesson.id}: ${lesson.title}`);
  }

  console.log("Done!");
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
