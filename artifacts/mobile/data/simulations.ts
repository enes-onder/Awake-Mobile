export type SimChoice = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  xpReward: number;
};

export type SimStep = {
  id: string;
  type: "narrative" | "choice";
  text: string;
  choices?: SimChoice[];
};

export type Simulation = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  xpReward: number;
  category: string;
  steps: SimStep[];
};

export const SIMULATIONS: Simulation[] = [
  {
    id: "s1",
    title: "Viral WhatsApp Mesajı",
    description:
      "Bir yakınından alarmlı bir mesaj geliyor. Doğru kararı ver.",
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
            explanation:
              "Doğrulanmamış bir mesajı iletmek, yanlış bile olsa paniğe neden olur. Önce doğrula!",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Önce Belediye veya Sağlık Bakanlığı sitesini kontrol ederim.",
            isCorrect: true,
            explanation:
              "Mükemmel! Resmi kaynakları kontrol etmek dezenformasyonla başa çıkmanın en etkili yoludur.",
            xpReward: 30,
          },
          {
            id: "c",
            text: "Mesajı dikkate almam, doğru olmayabilir.",
            isCorrect: false,
            explanation:
              "Görmezden gelmek yeterli değil. Kaynağı araştırıp başkalarını da uyarman gerekebilir.",
            xpReward: 5,
          },
        ],
      },
      {
        id: "s1-n2",
        type: "narrative",
        text: "Belediye web sitesini açıyorsun. Böyle bir duyuru yok. Sağlık Bakanlığı'nda da sessizlik. Şimdi ne yaparsın?",
      },
      {
        id: "s1-c2",
        type: "choice",
        text: "Resmi kaynaklarda bilgi bulamadın. Bir sonraki adımın ne?",
        choices: [
          {
            id: "a",
            text: "Resmi kaynaklarda yok demek saklamışlardır, paylaşırım.",
            isCorrect: false,
            explanation:
              "Komplo teorisi tuzağı! Resmi kaynakların sessizliği, bilgiyi saklamak değil haberin yanlış olduğunun işaretidir.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Anneye mesajı iletmemesini ve yanlış olabileceğini söylerim.",
            isCorrect: true,
            explanation:
              "Harika! Çevrendeki insanları doğrulama yapmaya teşvik etmek dezenformasyonla mücadelede kritik.",
            xpReward: 30,
          },
          {
            id: "c",
            text: "Teyit.org gibi bir doğrulama sitesine bildiririm.",
            isCorrect: true,
            explanation:
              "Çok iyi! Bağımsız doğrulama platformları bu tür içerikleri araştırır ve kamuoyunu bilgilendirir.",
            xpReward: 30,
          },
        ],
      },
    ],
  },
  {
    id: "s2",
    title: "Siyasetçinin Sahte Sözü",
    description:
      "Viral olan bir alıntının gerçekliğini sorgula ve doğru eylemi seç.",
    difficulty: 2,
    xpReward: 80,
    category: "Sahte Alıntı",
    steps: [
      {
        id: "s2-n1",
        type: "narrative",
        text: "X (Twitter) akışında bir paylaşım görüyorsun: \"Bakan açıkladı: 'Gençlerin sosyal medya kullanması millî güvenlik tehdididir!' — Sabah gazetesi, bugün.\" Paylaşım 20 bin beğeni almış.",
      },
      {
        id: "s2-c1",
        type: "choice",
        text: "Paylaşıma tepkin ne olur?",
        choices: [
          {
            id: "a",
            text: "20 bin beğeni almış, kesinlikle doğrudur. Yorumlara görüşümü yazarım.",
            isCorrect: false,
            explanation:
              "Beğeni sayısı doğruluğun kanıtı değildir. Yanlış bilgiler çok hızlı yayılabilir.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "Sabah gazetesinin o günkü manşetlerine bakarım.",
            isCorrect: true,
            explanation:
              "Doğru adım! Atıfta bulunulan kaynağı doğrudan kontrol etmek sahte alıntıları tespit etmenin en etkili yolu.",
            xpReward: 40,
          },
          {
            id: "c",
            text: "Bakan'ın resmi sosyal medya hesabını incelerim.",
            isCorrect: true,
            explanation:
              "Akıllıca! Yetkilinin kendi açıklamalarına bakmak, sahte alıntıları doğrulamak için önemli bir adım.",
            xpReward: 40,
          },
        ],
      },
      {
        id: "s2-n2",
        type: "narrative",
        text: "Sabah gazetesinde böyle bir haber yok. Bakan'ın resmi hesabında da böyle bir açıklama yok. Paylaşımı yapan hesap 2 gün önce açılmış ve 3 paylaşımı var.",
      },
      {
        id: "s2-c2",
        type: "choice",
        text: "Kanıtlar sahte olduğunu gösteriyor. Ne yapıyorsun?",
        choices: [
          {
            id: "a",
            text: "Paylaşımı 'Sahte haber!' diye kendi hesabımdan yeniden paylaşırım.",
            isCorrect: false,
            explanation:
              "Dikkatli ol! Sahte olduğunu söylemek için paylaşmak da yayılmasına yardım eder. Daha etkili bir yol var.",
            xpReward: 5,
          },
          {
            id: "b",
            text: "Platformun 'Yanlış bilgi bildir' özelliğini kullanırım.",
            isCorrect: true,
            explanation:
              "Mükemmel! Platformların şikayet mekanizmaları dezenformasyonla mücadelede en etkili araçlardandır.",
            xpReward: 40,
          },
          {
            id: "c",
            text: "İçeriğin yanlış olduğunu, kaynaklarımla destekleyerek yorumda belirtirim.",
            isCorrect: true,
            explanation:
              "Çok iyi! Kanıt göstererek düzeltme yapmak, diğer kullanıcıların da yanılmamasını sağlar.",
            xpReward: 40,
          },
        ],
      },
    ],
  },
  {
    id: "s3",
    title: "Deprem Anında Dezenformasyon",
    description:
      "Kriz anında doğrulama baskısı altında doğru kararlar ver.",
    difficulty: 3,
    xpReward: 100,
    category: "Kriz Senaryosu",
    steps: [
      {
        id: "s3-n1",
        type: "narrative",
        text: "6.5 büyüklüğünde bir deprem oldu. Sosyal medya kaynıyor. Bir hesap 'Kadıköy'de çöken bina var, 50 kişi mahsur!' yazıyor ve paylaşım binlere ulaşıyor. AFAD henüz açıklama yapmadı.",
      },
      {
        id: "s3-c1",
        type: "choice",
        text: "Bu anda ne yaparsın?",
        choices: [
          {
            id: "a",
            text: "Acil durum bu, hemen paylaşırım. Yanlış bile olsa zararı olmaz.",
            isCorrect: false,
            explanation:
              "Yanlış! Sahte 'çöken bina' haberleri kurtarma ekiplerini yanlış yönlendirir ve gerçek kurbanların gecikmesine yol açar.",
            xpReward: 0,
          },
          {
            id: "b",
            text: "AFAD'ın resmi açıklamasını beklerim.",
            isCorrect: true,
            explanation:
              "Doğru! Kriz anında resmi kaynakları takip etmek hem güvenli hem de sorumluluk sahibi davranıştır.",
            xpReward: 50,
          },
          {
            id: "c",
            text: "Hesabın geçmişini incelerim — daha önce doğru haber yaptı mı?",
            isCorrect: true,
            explanation:
              "Akıllıca! Hesabın güvenilirlik geçmişi, bilginin doğruluğu hakkında önemli ipuçları verir.",
            xpReward: 50,
          },
        ],
      },
      {
        id: "s3-n2",
        type: "narrative",
        text: "AFAD açıkladı: Kadıköy'de hasar raporu yok. Paylaşım tamamen yanlıştı. Ama binler bu bilgiyle zaten panik yaşadı, bazıları bölgeye koştu. Şimdi ne hissediyorsun?",
      },
      {
        id: "s3-c2",
        type: "choice",
        text: "Bu deneyimden çıkarman gereken en önemli ders nedir?",
        choices: [
          {
            id: "a",
            text: "Kriz anlarında sosyal medyayı hiç kullanmamak gerekir.",
            isCorrect: false,
            explanation:
              "Bu aşırı bir çözüm. Sosyal medya kriz anında doğru kullanıldığında çok değerli olabilir.",
            xpReward: 5,
          },
          {
            id: "b",
            text: "Doğrulama hızı, paylaşım hızından her zaman önce gelmelidir.",
            isCorrect: true,
            explanation:
              "Tam olarak! 'Doğrulama hızı > Paylaşım hızı' dedektifin temel kuralıdır. Kriz anında da geçerlidir.",
            xpReward: 50,
          },
          {
            id: "c",
            text: "Resmi kaynaklar sessiz kaldığında bilgiye güvenilmez.",
            isCorrect: false,
            explanation:
              "Resmi kaynakların sessizliği, bilgileri doğrulama sürecinde oldukları anlamına gelebilir. Sabır önemlidir.",
            xpReward: 10,
          },
        ],
      },
    ],
  },
];
