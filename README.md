# Rezerva

Rezerva, lokasyon ve alan bazlı rezervasyon süreçlerini uçtan uca yöneten üretim hazır bir platformdur. Proje; FastAPI ile geliştirilmiş bir REST API, React/TypeScript tabanlı yönetim arayüzü ve Celery ile kuyruk yönetimi sunar.

## 🚀 Özellikler
- JWT tabanlı kimlik doğrulama ve rol yönetimi
- Lokasyon (venue) ve alan (space) tanımlama
- Çakışma kontrolü yapan rezervasyon oluşturma/güncelleme/iptal akışları
- Yaklaşan rezervasyonları gösteren gösterge paneli
- Docker Compose ile tam entegre dağıtım

## 📦 Hızlı Başlangıç
```bash
git clone <repo>
cd Rezerva
cp backend/.env.example backend/.env
docker-compose up --build
```

Servisler ayaklandığında:
- Backend API: http://localhost:8000/api/v1
- OpenAPI dokümanı: http://localhost:8000/api/v1/openapi.json
- Frontend: http://localhost:5173

Varsayılan süper kullanıcı bilgileri `.env` dosyasında yer alır (`admin@rezerva.local / ChangeMe123!`).

## 🧪 Testler
Backend birim testlerini yerel ortamda çalıştırmak için:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

## 📁 Proje Yapısı
```
backend/
  app/
    api/           # FastAPI rotaları
    core/          # Konfigürasyon ve güvenlik yardımcıları
    db/            # SQLAlchemy ayarları ve migrasyonlar
    models/        # ORM modelleri
    schemas/       # Pydantic şemaları
    services/      # İş kuralları, Celery işleri
frontend/
  src/
    components/    # Arayüz bileşenleri
    contexts/      # Auth context
    pages/         # Sayfalar
    services/      # API istemcisi
```

## 🗺 Yol Haritası
Detaylı gereksinimler ve gelecek geliştirmeler için [docs/PRD.md](docs/PRD.md) dosyasına göz atabilirsiniz.
