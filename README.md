# Arıza Bildirim ve Yönetim Sistemi - Backend

Bu repo, .NET 8 tabanlı bir RESTful API backend projesinin katmanlı iskeletini içerir.

## Mevcut Durum
- `Ariza.Core`: Entity'ler, enum'lar ve repository / unit of work sözleşmeleri.
- `Ariza.Infrastructure`: `AppDbContext`, `GenericRepository`, `UnitOfWork`.
- `Ariza.Service`: DTO'lar, servis sözleşmeleri ve temel `ServiceResult` tipi.
- `Ariza.Api`: JWT, Identity, controller'lar, middleware ve ilk veri seed altyapısı.

## Veritabanı
- İlk EF Core migration oluşturuldu: `src/Ariza.Infrastructure/Data/Migrations/20260602101320_InitialCreate.cs`
- Başlangıçta `User` ve `Admin` rollerinin yanı sıra opsiyonel admin kullanıcısı `SeedAdmin` ayarlarıyla oluşturulur.

## Sonraki Adım
- `dotnet ef database update` ile veritabanını oluşturmak.
- Gerçek iş kuralları için repository bazlı filtreleri ve daha sıkı validation kurallarını eklemek.
- İsteğe bağlı olarak unit/integration test katmanını kurmak.

## Derleme
```powershell
Set-Location 'c:\Users\Administrator\source\copilot\arıza_rapor_sistemi'
dotnet build .\Ariza.slnx
```

## API
- `Ariza.Api`: JWT, Identity, controllers, global exception middleware ve dosya yükleme desteği içerir.
- Görsel yüklemeler `wwwroot/uploads/reports` altına kaydedilir ve `UseStaticFiles` ile erişilebilir hale gelir.
```
