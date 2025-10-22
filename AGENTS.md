# Agent Çalışma Notları

Bu depo FastAPI tabanlı bir backend ve Vite/React tabanlı bir frontend içerir. Yeni geliştirmelerde aşağıdaki prensipler takip edilmelidir:

- Python kodu için `black` tarzı (PEP8), `from __future__ import annotations` tercih edilmiştir.
- FastAPI uç noktalarında şema validasyonu için `pydantic` modelleri kullanılır; DTO'lar `app/schemas` altında tutulur.
- Veritabanı işlemleri `app/services` katmanında kapsüllenmiştir. Doğrudan `routes` içerisinden ORM modeli manipüle edilmez.
- Alembic migration dosyalarını güncel tutmak zorunludur.
- Frontend tarafında Material UI bileşenleri ve React Query ile veri yönetimi tercih edilmiştir; API çağrıları `src/services/api.ts` üzerinden yapılır.
- Yeni bileşenler Türkçe arayüz metinlerine uygun yazılmalıdır.
- Tüm servisler docker-compose ile ayağa kaldırılacak şekilde tasarlanmıştır; yeni bağımlılıklar eklendiğinde ilgili Dockerfile'lar güncellenmelidir.

Pull Request özetleri değişiklik kapsamını maddeler halinde listelemeli ve çalıştırılan test/komutları belirtmelidir.
