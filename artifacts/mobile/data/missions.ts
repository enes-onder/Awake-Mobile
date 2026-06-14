export type MissionType = "photo" | "headline" | "quote" | "stats" | "video";
export type Difficulty = 1 | 2 | 3;
export type Verdict = "real" | "fake";
export type Platform = "twitter" | "instagram" | "whatsapp" | "news" | "telegram";

export interface MissionContent {
  accountName: string;
  accountHandle: string;
  timestamp: string;
  text: string;
  likes: string;
  shares: string;
  platform: Platform;
  imageTag?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  type: MissionType;
  xpReward: number;
  category: string;
  verdict: Verdict;
  content: MissionContent;
  clues: string[];
  explanation: string;
}

export const MISSIONS: Mission[] = [
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
      "Bu alıntı tamamen uydurma. Sağlık Bakanı böyle bir açıklama yapmamıştır. İddianın atıfta bulunduğu Sabah gazetesi arşivinde böyle bir röportaj bulunmamaktadır. Sağlık politikalarına yönelik panik yaratmak amacıyla üretilmiştir.",
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
      '"%73" istatistigi hicbir hakemli dergide yayimlanmamis.',
      "Gerçek yan etki oranı WHO verilerine göre %0.1'den az.",
    ],
    explanation:
      "Bu mesaj tipik bir dezenformasyon örneğidir. Belirtilen araştırma gerçekte var olmamaktadır. WHO ve Avustralya Sağlık Bakanlığı verilerine göre grip aşısının ciddi yan etki oranı son derece düşüktür. 'Doktorlar susuyor' ifadesi komplo teorisi retoriğinin klasik göstergesidir.",
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
      "Depremler mevcut bilimle kesin olarak tahmin edilemez. AFAD, böyle bir uyarı yapmamıştır. Bu tür paylaşımlar toplumsal paniğe ve binalara zarar verebilecek gereksiz tahliyeye neden olmaktadır. Resmi kaynakları her zaman doğrulayın.",
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
      "Bu iddia yanlıştır. BM verilerine göre kişi başına plastik tüketimde ABD, Avustralya ve bazı Körfez ülkeleri üst sıralarda yer almaktadır. Paylaşılan link sahte bir sayfaya yönlendirmektedir. 847 kg/kişi rakamı fiziksel olarak mümkün değildir.",
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
      "Bu fotoğraf yapay zeka tarafından üretilmiştir. YZ'nin klasik hataları görünmektedir: anormal el detayları, bulanık arka plan yazıları ve abartılı yüz ifadesi. Hesap son derece yeni ve hiçbir doğrulanmış haber paylaşımı yok.",
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
      "Bu alıntı uydurma. Stephen Hawking böyle bir açıklama yapmamıştır. Cambridge konferans arşivleri bu alıntıyı doğrulamamaktadır. Otoriter isimlere sahte sözler atfetmek, dezenformasyonun yaygın bir tekniğidir.",
  },
];
