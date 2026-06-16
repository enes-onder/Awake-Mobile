import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { lessonsTable } from "./src/schema/index.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

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
  console.log("Seeding lessons...");
  for (const lesson of lessons) {
    await db
      .insert(lessonsTable)
      .values(lesson)
      .onConflictDoNothing();
    console.log(`  ✓ ${lesson.id}: ${lesson.title}`);
  }
  console.log("Done!");
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
