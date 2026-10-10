# Baugeschichte II — Dosya Yöneticisi Paketi

Bu klasör, Node.js veya veritabanı gerektirmeyen statik web uygulamasıdır.

## Yükleme

1. baugeschichte-lernwerkstatt.zip dosyasını bilgisayarınıza indirin.
2. VPS sağlayıcınızın dosya yöneticisinde alan adınızın kök klasörünü açın. Bu klasör genellikle public_html, htdocs veya www adını taşır.
3. ZIP içindeki dosya ve klasörlerin tamamını bu kök klasöre yükleyin. index.html doğrudan kökte olmalıdır; ekstra bir alt klasöre taşımayın.
4. Dosya yöneticisi ZIP açabiliyorsa sunucuda açın; açamıyorsa bilgisayarınızda açıp içeriği tek tek yükleyin.
5. Alan adınızı HTTPS ile açın. Uygulama #trainer gibi hash tabanlı adresler kullandığından ek yönlendirme kuralı gerekmez.

## Paket içeriği

| Yol | Amaç |
|---|---|
| index.html | Uygulamanın giriş dosyası |
| assets/ | Derlenmiş JavaScript ve CSS |
| media/ | Uygulamanın ana görselleri |
| data/legacy-catalog.txt | Tüm mimari eserleri içeren kurs kataloğu |
| .htaccess | Apache/cPanel için temel güvenlik üstbilgileri |

## Güncelleme

Yeni bir paket aldığınızda eski assets, media, data klasörlerini ve index.html dosyasını yeni sürümle değiştirin. Öğrenci ilerlemesi her kullanıcının tarayıcısında saklandığı için bu işlem o tarayıcıdaki yerel öğrenme geçmişini silmez.

## Not

Bu paket doğrudan VPS dosya yöneticisine yüklenmek içindir. Sunucuda npm install, Node.js, PM2 veya veritabanı kurulumu gerekmez.