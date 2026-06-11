# Arıza Bildirim ve Yönetim Sistemi

Bu proje, kurum içi veya genel kullanım için tasarlanmış kapsamlı bir Arıza Bildirim ve Yönetim Sistemi çözümüdür. Modern teknolojiler kullanılarak geliştirilmiş olup, API, Web Dashboard ve Mobil Uygulama olmak üzere üç ana bileşenden oluşmaktadır.

## Proje Bileşenleri

### 1. Backend (.NET 8 REST API)
- **Konum:** `/src` ve `/tests`
- **Açıklama:** Sistemin temel iş mantığını, veritabanı işlemlerini ve kimlik doğrulamasını (JWT, Identity) yönetir. Katmanlı mimari (Core, Infrastructure, Service, Api) kullanılarak geliştirilmiştir. `wwwroot/uploads/reports` altına görsel yükleme desteği içerir.

### 2. Frontend (Web Dashboard)
- **Konum:** `/frontend`
- **Açıklama:** Yöneticiler ve yetkili personel için tasarlanmış, arızaların takip edildiği, istatistiklerin görüntülendiği ve kullanıcı yönetiminin yapıldığı modern web arayüzü. React, TypeScript ve Vite ile geliştirilmiştir.

### 3. Mobil (Kullanıcı Uygulaması)
- **Konum:** `/mobile`
- **Açıklama:** Son kullanıcıların sahada karşılaştıkları arızaları kolayca raporlayabilecekleri, fotoğraf ekleyebilecekleri ve mevcut taleplerinin durumunu takip edebilecekleri mobil uygulama. React Native ve Expo kullanılarak geliştirilmiştir.

## Kurulum ve Çalıştırma

### 1. Veritabanı Kurulumu (Backend)
Backend projesi Entity Framework Core kullanmaktadır. Veritabanını oluşturmak için:
```powershell
Set-Location .\src\Ariza.Api
dotnet ef database update --project ..\Ariza.Infrastructure
```

### 2. Backend'i Çalıştırma
```powershell
Set-Location .\src\Ariza.Api
dotnet run
```
*(Alternatif olarak kök dizindeyken `dotnet build .\Ariza.slnx` ile tüm .NET projelerini derleyebilirsiniz)*

### 3. Frontend'i Çalıştırma
```powershell
Set-Location .\frontend
npm install
npm run dev
```

### 4. Mobil Uygulamayı Çalıştırma
```powershell
Set-Location .\mobile
npm install
npx expo start
```

## Teknolojiler
- **Backend:** .NET 8, C#, EF Core, SQL Server, ASP.NET Core Identity, JWT, xUnit
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (vb.)
- **Mobil:** React Native, Expo, TypeScript, Expo Router
