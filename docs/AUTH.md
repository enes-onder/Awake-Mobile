# Kimlik Doğrulama Sistemi — Doğruluk Dedektifi

Uygulama [Supabase Auth](https://supabase.com/docs/guides/auth) kullanır. Tüm oturum yönetimi, token yenileme ve kullanıcı durumu Supabase tarafından sağlanır.

---

## Desteklenen Giriş Yöntemleri

| Yöntem | Durum | Notlar |
|---|---|---|
| E-posta + Şifre | Çalışıyor | Giriş ve kayıt aynı formda |
| Magic Link (E-posta OTP) | Çalışıyor | Şifresiz, tek kullanımlık bağlantı |
| Misafir (Anonim) | Çalışıyor | Hesap gerekmez, veri kaybolmaz |
| Telefon OTP (SMS) | Çalışıyor* | Supabase'de Twilio konfigürasyonu gerekir |
| Google OAuth | Yapılandırma gerekiyor | Aşağıya bak |
| Apple Sign In | Yapılandırma gerekiyor | Aşağıya bak |

*Twilio credentials olmadan SMS gönderilemez.

---

## Giriş Akışı (Onboarding)

```
Kullanıcı uygulamayı açar
        ↓
_layout.tsx → NavController tetiklenir
        ↓
authUser yok?
  → /onboarding ekranına yönlendir
authUser var + username boş?
  → /onboarding ekranında kal (name adımı)
authUser var + username dolu + anonim değil?
  → /(tabs) ana uygulamaya yönlendir
        ↓
ONBOARDING ADIMLARI:
  "auth"  → Giriş yöntemi seçimi
     ↓ seçim yapılınca
  "email" → E-posta formu (veya telefon/OTP adımları)
     ↓ başarılı giriş
  "name"  → Kod adı seçimi
     ↓ "Göreve Başla"
  /(tabs) → Ana uygulama
```

### Otomatik Adım Geçişi

`useOnboardingAuth` hook'u tüm auth state'ini ve Supabase işlemlerini yönetir. Herhangi bir yöntemle giriş başarılı olunca — kullanıcının henüz kod adı yoksa — `app/onboarding.tsx` içindeki `useEffect` otomatik olarak `"name"` adımına geçer:

```typescript
// app/onboarding.tsx
useEffect(() => {
  if (authUser && !username && (auth.step === "auth" || auth.step === "email" || auth.step === "phone")) {
    auth.setStep("name");
  }
}, [authUser]);
```

Bu sayede Google/Apple gibi async OAuth akışları da yakalanır.

---

## Misafir (Anonim) Giriş

Kullanıcı "Misafir olarak devam et" butonuna bastığında:

1. `UserContext.signInAnonymously()` çağrılır
2. `supabase.auth.signInAnonymously()` bir anonim oturum açar
3. `authUser.is_anonymous === true` olur
4. Başarılı ise direkt `setStep("name")` ile kod adı ekranına geçilir

**Önemli:** Anonim kullanıcılar uygulama içinden "e-posta/şifre ile hesap bağlama" akışıyla anonim hesaplarını gerçek hesaba yükseltebilir (henüz UI'da bu özellik yok, altyapı hazır).

**NavController'daki özel davranış:** Anonim kullanıcılar, username'leri olsa bile onboarding ekranına zorla yönlendirilmez. Bu, onboarding'i tekrar ziyaret ederek hesap bağlamasına olanak tanır.

---

## E-posta ile Giriş / Kayıt

Onboarding "email" adımında iki mod var:

### Şifre ile
- **Kayıt:** `supabase.auth.signUp({ email, password })` → doğrulama e-postası gönderilir
- **Giriş:** `supabase.auth.signInWithPassword({ email, password })` → oturum açılır, "name" adımına geçilir

### Magic Link (Şifresiz)
- `supabase.auth.signInWithOtp({ email })` → e-postaya tek kullanımlık bağlantı gönderilir
- Kullanıcı linke tıklayınca `DeepLinkHandler` (\_layout.tsx) URL'deki `code=` parametresini yakalar
- `supabase.auth.exchangeCodeForSession(url)` ile oturum oluşturulur

---

## Google OAuth Kurulumu

Google OAuth şu an Supabase projesinde etkinleştirilmesi gerekiyor.

**Adımlar:**
1. [console.cloud.google.com](https://console.cloud.google.com) → Yeni proje → OAuth 2.0 kimlik bilgileri oluştur
2. Yetkili yönlendirme URI'si: `https://<SUPABASE_PROJE_ID>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google → Client ID ve Secret gir
4. İsteğe bağlı: Mobil için `Linking.createURL("/")` redirect URL'sini Supabase'e ekle

---

## Apple Sign In Kurulumu

1. [developer.apple.com](https://developer.apple.com) → Certificates → Sign in with Apple etkinleştir
2. Services ID oluştur → Redirect URL: `https://<SUPABASE_PROJE_ID>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Apple → bilgileri gir

> Apple Sign In **yalnızca macOS/iOS cihazlarda** çalışır. Web'de de çalışır ama bir Apple Developer hesabı gerektirir ($99/yıl).

---

## Oturum Yönetimi

### Nasıl Saklanır?
`lib/supabase.ts` dosyasında istemci şu ayarlarla yapılandırılmıştır:
```typescript
auth: {
  storage: AsyncStorage,   // Oturum cihazda saklanır
  autoRefreshToken: true,  // Token otomatik yenilenir
  persistSession: true,    // Uygulama kapatılsa da oturum açık kalır
  detectSessionInUrl: false,
}
```

### Oturumu Kim Yönetir?
`UserContext.tsx` içindeki `init()` fonksiyonu uygulama her açıldığında:
1. `supabase.auth.getSession()` ile mevcut oturumu kontrol eder
2. `onAuthStateChange` dinleyicisi ile tüm auth değişikliklerini takip eder
3. `authUser` ve `session` state'lerini günceller

### Çıkış Yapma
`UserContext.signOut()` çağrılınca:
1. `supabase.auth.signOut()` Supabase oturumunu kapatır
2. `AsyncStorage.removeItem(STORAGE_KEY)` yerel oyun verilerini siler
3. NavController `/onboarding` ekranına yönlendirir

---

## Deep Link Yönetimi

`_layout.tsx`'deki `DeepLinkHandler` bileşeni, e-posta bağlantıları ve OAuth geri dönüşlerini yakalar:

```typescript
const handleUrl = async (url: string) => {
  if (url.includes("access_token") || url.includes("code=")) {
    await supabase.auth.exchangeCodeForSession(url);
  }
};
```

- Uygulama açıkken gelen URL'ler: `Linking.addEventListener("url", ...)`
- Uygulama kapalıyken açılan URL'ler: `Linking.getInitialURL()`

---

## İlgili Dosyalar

| Dosya | Rolü |
|---|---|
| `lib/supabase.ts` | Supabase istemcisi yapılandırması |
| `context/UserContext.tsx` | Auth state yönetimi, `signInAnonymously`, `signOut` |
| `hooks/useOnboardingAuth.ts` | Tüm auth handler'ları ve onboarding state'i |
| `app/onboarding.tsx` | Adım routing orkestratörü (~80 satır) |
| `components/onboarding/AuthStep.tsx` | Provider seçim UI'ı |
| `components/onboarding/EmailStep.tsx` | E-posta form UI'ı |
| `components/onboarding/PhoneStep.tsx` | Telefon form UI'ı |
| `components/onboarding/OtpStep.tsx` | OTP doğrulama UI'ı |
| `components/onboarding/NameStep.tsx` | Kod adı seçimi UI'ı |
| `app/_layout.tsx` | `NavController` (yönlendirme), `DeepLinkHandler` |
