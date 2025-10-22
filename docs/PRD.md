# Rezerva Ürün Gereksinim Dokümanı

## 1. Ürün Tanımı
Rezerva; otel, ofis, etkinlik alanı ve çok lokasyonlu işletmeler için tasarlanmış, tam özellikli bir rezervasyon ve alan yönetim platformudur. Sistem; personel ve yöneticilerin tek panel üzerinden lokasyon tanımlaması, alan kapasitesi yönetimi, müşteri rezervasyonu oluşturması ve operasyonel görünürlük sağlaması amacıyla geliştirilmiştir. Platform hem REST API katmanı hem de yönetim arayüzü ile canlı kullanıma hazır olarak tasarlanmıştır.

## 2. Hedef Kitle ve Kullanıcı Rolleri
- **Yönetici (Admin/Superuser):** Yeni kullanıcı oluşturma, lokasyon/alan tanımlama, tüm rezervasyonları görüntüleme ve raporlama.
- **Operasyon/Saha Ekibi (Staff):** Rezervasyon oluşturma, güncelleme, müsaitlik kontrolü ve müşteri iletişimi.
- **Müşteri (Customer):** Sistem içinde son kullanıcı rolü bulunmakla birlikte yönetim paneline erişimi yoktur; rezervasyonları personel oluşturur.

## 3. Ana Özellikler
1. **Kimlik Doğrulama ve Yetkilendirme**
   - JWT tabanlı erişim token’ı.
   - Süper kullanıcı başlangıçta otomatik oluşturulur.
   - Yetki bazlı uç noktalar (sadece yönetici kullanıcıları kullanıcı/lokasyon yönetimi yapabilir).

2. **Lokasyon ve Alan Yönetimi**
   - Lokasyon bazlı (Venue) yapılandırma: isim, adres, zaman dilimi, açıklama.
   - Lokasyona bağlı alan (Space) yönetimi: kapasite, olanaklar, açıklamalar.
   - API üzerinden listeleme, oluşturma, güncelleme ve silme işlemleri.

3. **Rezervasyon Yönetimi**
   - Zaman çakışmalarını engelleyen doğrulama.
   - Rezervasyon statüleri: pending, confirmed, cancelled, checked_in, completed.
   - Rezervasyon iptal akışı ve müsait alan sorgulama uç noktası.
   - Celery ile bildirim kuyruğu (broker erişimi yoksa log uyarısı).

4. **Gösterge Paneli**
   - Toplam lokasyon/alan/rezervasyon sayıları.
   - Yaklaşan rezervasyon listesi.
   - React + Material UI ile responsive yönetim arayüzü.

5. **DevOps / Dağıtım Hazırlığı**
   - Docker + docker-compose ile Postgres, Redis, FastAPI, Celery ve Vite tabanlı frontend konteynerleri.
   - Alembic ile versiyonlanmış veri tabanı şeması.
   - Örnek ortam değişkeni dosyası (`backend/.env.example`).

## 4. Kullanıcı Akışları
1. Yönetici oturum açar, yeni lokasyon ve alanları tanımlar.
2. Operasyon görevlisi aynı panelden ilgili alan için belirli tarih aralığında rezervasyon oluşturur.
3. Sistem zaman çakışması olup olmadığını kontrol eder; uygun ise rezervasyonu kaydeder ve Celery kuyruğuna bildirim atar.
4. Gösterge paneli anlık olarak toplam metrikleri ve yaklaşan rezervasyonları sunar.
5. Gerekirse yönetici yeni kullanıcı oluşturabilir, mevcut rezervasyonları güncelleyebilir veya iptal edebilir.

## 5. Teknik Gereksinimler
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.x, PostgreSQL, Redis, Celery, Alembic.
- **Frontend:** React 18, Vite, TypeScript, Material UI, React Query, React Router.
- **Altyapı:** Docker Compose ile çoklu servis orkestrasyonu.
- **Güvenlik:** JWT, şifre hash (bcrypt), rol bazlı erişim kontrolü.
- **Gözlenebilirlik:** Loguru ile yapılandırılmış loglama, sağlık kontrolü uç noktası.

## 6. Performans ve Ölçeklenebilirlik
- Connection pooling ve `pool_pre_ping` ile veritabanı bağlantı sağlıklılığı.
- Celery ile asenkron bildirim işlemleri.
- React Query önbelleklemesi ile istemci tarafında minimal API yükü.

## 7. Kabul Kriterleri
- Uygulama docker-compose ile ayağa kalktığında backend `http://localhost:8000/api/v1` üzerinden tüm uç noktaları sunar.
- Frontend `http://localhost:5173` üzerinden kimlik doğrulama ve rezervasyon yönetimini gerçekleştirir.
- Müsaitlik kontrolü çakışma durumlarında 409 hatası döndürür.
- Alembic migrasyonu başarıyla çalıştırılarak veritabanı şeması oluşturulur.
- Varsayılan süper kullanıcı ile giriş yapılıp yönetici işlemleri yapılabilir.

## 8. Gelecek Yol Haritası
- Gerçek e-posta / SMS sağlayıcısı entegrasyonu.
- Müşteri self-servis rezervasyon modülü.
- Detaylı raporlama ve dışa aktarma (CSV/PDF).
- Çok dil desteği ve kapsamlı rol bazlı yetki matrisi.
