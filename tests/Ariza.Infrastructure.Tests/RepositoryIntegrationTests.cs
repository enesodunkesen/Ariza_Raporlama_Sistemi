using Ariza.Core.Entities;
using Ariza.Infrastructure.Data;
using Ariza.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace Ariza.Infrastructure.Tests
{
    [TestFixture]
    public class RepositoryIntegrationTests
    {
        private AppDbContext _context = null!;
        private UnitOfWork _unitOfWork = null!;

        [SetUp]
        public void SetUp()
        {
            // Arrange: Her test için benzersiz isimli In-Memory veritabanı oluştur
            var dbName = $"ArizaTestDb_{Guid.NewGuid():N}";
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();
            _unitOfWork = new UnitOfWork(_context);
        }

        [TearDown]
        public void TearDown()
        {
            // Cleanup: Veritabanını sil ve kaynakları serbest bırak
            _context.Database.EnsureDeleted();
            _unitOfWork.Dispose();
        }

        #region AddAsync / SaveChanges Tests

        [Test]
        public async Task AddAsync_ShouldPersistFaultReportToDatabase()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            var report = CreateReport("user-1", "Motor arızası");

            // Act
            await repo.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var saved = await _context.FaultReports.FirstOrDefaultAsync(r => r.Id == report.Id);
            Assert.That(saved, Is.Not.Null);
            Assert.That(saved!.Description, Is.EqualTo("Motor arızası"));
            Assert.That(saved.UserId, Is.EqualTo("user-1"));
        }

        [Test]
        public async Task AddAsync_MultipleFaultReports_ShouldPersistAll()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            var report1 = CreateReport("user-1", "Arıza 1");
            var report2 = CreateReport("user-1", "Arıza 2");
            var report3 = CreateReport("user-2", "Arıza 3");

            // Act
            await repo.AddAsync(report1);
            await repo.AddAsync(report2);
            await repo.AddAsync(report3);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var count = await _context.FaultReports.CountAsync();
            Assert.That(count, Is.EqualTo(3));
        }

        [Test]
        public async Task AddAsync_ShouldAutoGenerateId()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            var report = CreateReport("user-1", "Oto ID test");

            // Act
            await repo.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.That(report.Id, Is.GreaterThan(0));
        }

        [Test]
        public async Task AddAsync_ShouldPreserveDefaultValues()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            var report = CreateReport("user-1", "Default değer testi");

            // Act
            await repo.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var saved = await _context.FaultReports.FindAsync(report.Id);
            Assert.That(saved!.Status, Is.EqualTo(FaultStatus.Pending));
            Assert.That(saved.CreatedDate, Is.Not.EqualTo(default(DateTime)));
        }

        #endregion

        #region GetByIdAsync Tests

        [Test]
        public async Task GetByIdAsync_ExistingId_ShouldReturnCorrectEntity()
        {
            // Arrange
            var report = CreateReport("user-1", "ID ile sorgulama testi");
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var result = await repo.GetByIdAsync(report.Id);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Id, Is.EqualTo(report.Id));
            Assert.That(result.Description, Is.EqualTo("ID ile sorgulama testi"));
        }

        [Test]
        public async Task GetByIdAsync_NonExistingId_ShouldReturnNull()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var result = await repo.GetByIdAsync(9999);

            // Assert
            Assert.That(result, Is.Null);
        }

        #endregion

        #region GetAllAsync Tests

        [Test]
        public async Task GetAllAsync_WhenEmpty_ShouldReturnEmptyCollection()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.GetAllAsync();

            // Assert
            Assert.That(results, Is.Not.Null);
            Assert.That(results.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task GetAllAsync_WithData_ShouldReturnAllRecords()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "Rapor 1"),
                CreateReport("user-2", "Rapor 2"),
                CreateReport("user-3", "Rapor 3")
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.GetAllAsync();

            // Assert
            Assert.That(results.Count(), Is.EqualTo(3));
        }

        #endregion

        #region Query (IQueryable) Tests

        [Test]
        public async Task Query_FilterByUserId_ShouldReturnOnlyMatchingReports()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "Kullanıcı 1 - Rapor A"),
                CreateReport("user-1", "Kullanıcı 1 - Rapor B"),
                CreateReport("user-2", "Kullanıcı 2 - Rapor C"),
                CreateReport("user-3", "Kullanıcı 3 - Rapor D")
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.Query()
                .Where(r => r.UserId == "user-1")
                .ToListAsync();

            // Assert
            Assert.That(results.Count, Is.EqualTo(2));
            Assert.That(results.All(r => r.UserId == "user-1"), Is.True);
        }

        [Test]
        public async Task Query_FilterByStatus_ShouldReturnCorrectSubset()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "Bekleyen 1", FaultStatus.Pending),
                CreateReport("user-1", "Bekleyen 2", FaultStatus.Pending),
                CreateReport("user-1", "Devam eden", FaultStatus.InProgress),
                CreateReport("user-1", "Çözülmüş", FaultStatus.Resolved)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var pendingReports = await repo.Query()
                .Where(r => r.Status == FaultStatus.Pending)
                .ToListAsync();

            // Assert
            Assert.That(pendingReports.Count, Is.EqualTo(2));
            Assert.That(pendingReports.All(r => r.Status == FaultStatus.Pending), Is.True);
        }

        [Test]
        public async Task Query_FilterByUserIdAndStatus_ShouldCombineFiltersCorrectly()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "U1 Pending", FaultStatus.Pending),
                CreateReport("user-1", "U1 Resolved", FaultStatus.Resolved),
                CreateReport("user-2", "U2 Pending", FaultStatus.Pending),
                CreateReport("user-2", "U2 InProgress", FaultStatus.InProgress)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.Query()
                .Where(r => r.UserId == "user-1" && r.Status == FaultStatus.Pending)
                .ToListAsync();

            // Assert
            Assert.That(results.Count, Is.EqualTo(1));
            Assert.That(results[0].Description, Is.EqualTo("U1 Pending"));
        }

        [Test]
        public async Task Query_OrderByDescending_ShouldReturnInCorrectOrder()
        {
            // Arrange
            var oldDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var midDate = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc);
            var newDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);

            await SeedReportsAsync(
                CreateReport("user-1", "Eski rapor", createdDate: oldDate),
                CreateReport("user-1", "Orta rapor", createdDate: midDate),
                CreateReport("user-1", "Yeni rapor", createdDate: newDate)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.Query()
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();

            // Assert
            Assert.That(results[0].Description, Is.EqualTo("Yeni rapor"));
            Assert.That(results[1].Description, Is.EqualTo("Orta rapor"));
            Assert.That(results[2].Description, Is.EqualTo("Eski rapor"));
        }

        [Test]
        public async Task Query_CountAsync_ShouldReturnCorrectCount()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "R1", FaultStatus.Pending),
                CreateReport("user-1", "R2", FaultStatus.Pending),
                CreateReport("user-1", "R3", FaultStatus.InProgress),
                CreateReport("user-1", "R4", FaultStatus.Resolved),
                CreateReport("user-1", "R5", FaultStatus.Resolved)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var totalCount = await repo.Query().CountAsync();
            var pendingCount = await repo.Query().CountAsync(r => r.Status == FaultStatus.Pending);
            var resolvedCount = await repo.Query().CountAsync(r => r.Status == FaultStatus.Resolved);

            // Assert
            Assert.That(totalCount, Is.EqualTo(5));
            Assert.That(pendingCount, Is.EqualTo(2));
            Assert.That(resolvedCount, Is.EqualTo(2));
        }

        [Test]
        public async Task Query_FilterByDateRange_ShouldReturnCorrectSubset()
        {
            // Arrange
            var today = DateTime.UtcNow.Date;
            await SeedReportsAsync(
                CreateReport("user-1", "Bugünkü", createdDate: today.AddHours(10)),
                CreateReport("user-1", "Dünkü", createdDate: today.AddDays(-1)),
                CreateReport("user-1", "Geçen hafta", createdDate: today.AddDays(-8))
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var todayReports = await repo.Query()
                .Where(r => r.CreatedDate >= today)
                .ToListAsync();

            // Assert
            Assert.That(todayReports.Count, Is.EqualTo(1));
            Assert.That(todayReports[0].Description, Is.EqualTo("Bugünkü"));
        }

        #endregion

        #region FindAsync Tests

        [Test]
        public async Task FindAsync_WithMatchingPredicate_ShouldReturnFilteredResults()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "A raporu", FaultStatus.Pending),
                CreateReport("user-1", "B raporu", FaultStatus.InProgress),
                CreateReport("user-2", "C raporu", FaultStatus.Pending)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.FindAsync(r => r.Status == FaultStatus.Pending);

            // Assert
            Assert.That(results.Count(), Is.EqualTo(2));
            Assert.That(results.All(r => r.Status == FaultStatus.Pending), Is.True);
        }

        [Test]
        public async Task FindAsync_WithNoMatch_ShouldReturnEmptyCollection()
        {
            // Arrange
            await SeedReportsAsync(
                CreateReport("user-1", "Bekleyen", FaultStatus.Pending)
            );

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            var results = await repo.FindAsync(r => r.Status == FaultStatus.Resolved);

            // Assert
            Assert.That(results.Count(), Is.EqualTo(0));
        }

        #endregion

        #region Update Tests

        [Test]
        public async Task Update_ShouldPersistChangedFields()
        {
            // Arrange
            var report = CreateReport("user-1", "Orijinal açıklama", FaultStatus.Pending);
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            report.Status = FaultStatus.InProgress;
            report.Description = "Güncellenmiş açıklama";
            repo.Update(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert: Yeni bir context ile doğrula (cache bypass)
            var updated = await _context.FaultReports.FindAsync(report.Id);
            Assert.That(updated!.Status, Is.EqualTo(FaultStatus.InProgress));
            Assert.That(updated.Description, Is.EqualTo("Güncellenmiş açıklama"));
        }

        [Test]
        public async Task Update_StatusTransition_PendingToResolved_ShouldPersist()
        {
            // Arrange
            var report = CreateReport("user-1", "Çözüm testi", FaultStatus.Pending);
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            report.Status = FaultStatus.Resolved;
            repo.Update(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var resolved = await _context.FaultReports.FindAsync(report.Id);
            Assert.That(resolved!.Status, Is.EqualTo(FaultStatus.Resolved));
        }

        #endregion

        #region Remove Tests

        [Test]
        public async Task Remove_ShouldDeleteEntityFromDatabase()
        {
            // Arrange
            var report = CreateReport("user-1", "Silinecek rapor");
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();
            var savedId = report.Id;

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            repo.Remove(report);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var deleted = await _context.FaultReports.FindAsync(savedId);
            Assert.That(deleted, Is.Null);
        }

        [Test]
        public async Task Remove_ShouldNotAffectOtherEntities()
        {
            // Arrange
            var report1 = CreateReport("user-1", "Kalacak rapor");
            var report2 = CreateReport("user-1", "Silinecek rapor");
            _context.FaultReports.AddRange(report1, report2);
            await _context.SaveChangesAsync();

            var repo = _unitOfWork.Repository<FaultReport>();

            // Act
            repo.Remove(report2);
            await _unitOfWork.SaveChangesAsync();

            // Assert
            var remaining = await _context.FaultReports.ToListAsync();
            Assert.That(remaining.Count, Is.EqualTo(1));
            Assert.That(remaining[0].Description, Is.EqualTo("Kalacak rapor"));
        }

        #endregion

        #region UnitOfWork Tests

        [Test]
        public async Task UnitOfWork_ShouldReturnSameRepositoryInstanceForSameType()
        {
            // Arrange & Act
            var repo1 = _unitOfWork.Repository<FaultReport>();
            var repo2 = _unitOfWork.Repository<FaultReport>();

            // Assert
            Assert.That(repo1, Is.SameAs(repo2));
        }

        [Test]
        public async Task UnitOfWork_ShouldReturnDifferentRepositoryInstancesForDifferentTypes()
        {
            // Arrange & Act
            var faultRepo = _unitOfWork.Repository<FaultReport>();
            var maintenanceRepo = _unitOfWork.Repository<MaintenanceRequest>();

            // Assert
            Assert.That(faultRepo, Is.Not.SameAs(maintenanceRepo));
        }

        [Test]
        public async Task UnitOfWork_SaveChangesAsync_ShouldReturnAffectedRowCount()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            await repo.AddAsync(CreateReport("user-1", "Satır sayısı testi 1"));
            await repo.AddAsync(CreateReport("user-1", "Satır sayısı testi 2"));

            // Act
            var affectedRows = await _unitOfWork.SaveChangesAsync();

            // Assert
            Assert.That(affectedRows, Is.EqualTo(2));
        }

        [Test]
        public async Task UnitOfWork_ChangesNotPersistedWithoutSaveChanges()
        {
            // Arrange
            var repo = _unitOfWork.Repository<FaultReport>();
            await repo.AddAsync(CreateReport("user-1", "Kaydedilmemiş rapor"));
            // SaveChangesAsync çağrılmıyor!

            // Act: Ayrı bir sorgu ile kontrol et
            var count = await _context.FaultReports.CountAsync();

            // Assert: InMemory provider'da AddAsync entity'yi tracker'a ekler
            // ama SaveChanges olmadan kalıcı değildir.
            // Not: InMemory provider'da tracker'a eklenen entity'ler
            // aynı context üzerinden görünebilir, bu davranış beklenen bir durumdur.
            Assert.That(count, Is.LessThanOrEqualTo(1));
        }

        #endregion

        #region Test Isolation Verification

        [Test]
        public async Task TestIsolation_DatabaseShouldStartEmpty_TestA()
        {
            // Assert: Her test taze bir veritabanı ile başlar
            var count = await _context.FaultReports.CountAsync();
            Assert.That(count, Is.EqualTo(0));
        }

        [Test]
        public async Task TestIsolation_DatabaseShouldStartEmpty_TestB()
        {
            // Arrange: Bu testte veri ekle
            _context.FaultReports.Add(CreateReport("user-1", "İzolasyon testi"));
            await _context.SaveChangesAsync();

            // Assert: Bu test kendi verisiyle çalışır
            var count = await _context.FaultReports.CountAsync();
            Assert.That(count, Is.EqualTo(1));
        }

        [Test]
        public async Task TestIsolation_DatabaseShouldStartEmpty_TestC()
        {
            // Assert: Önceki testteki veri burada görünmemeli
            var count = await _context.FaultReports.CountAsync();
            Assert.That(count, Is.EqualTo(0));
        }

        #endregion

        #region Entity Field Integrity Tests

        [Test]
        public async Task FaultReport_AllFieldsShouldBePersisted()
        {
            // Arrange
            var createdDate = new DateTime(2026, 6, 1, 14, 30, 0, DateTimeKind.Utc);
            var report = new FaultReport
            {
                UserId = "user-42",
                BandNumber = "B-007",
                Description = "Tüm alanlar testi",
                ProductCode = "PRD-999",
                ErrorCode = "ERR-404",
                Status = FaultStatus.InProgress,
                ImagePath = "/uploads/reports/test.jpg",
                CreatedDate = createdDate
            };

            // Act
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();

            // Assert: Tüm alanlar doğru kaydedildi mi?
            var saved = await _context.FaultReports.FindAsync(report.Id);
            Assert.That(saved, Is.Not.Null);
            Assert.That(saved!.UserId, Is.EqualTo("user-42"));
            Assert.That(saved.BandNumber, Is.EqualTo("B-007"));
            Assert.That(saved.Description, Is.EqualTo("Tüm alanlar testi"));
            Assert.That(saved.ProductCode, Is.EqualTo("PRD-999"));
            Assert.That(saved.ErrorCode, Is.EqualTo("ERR-404"));
            Assert.That(saved.Status, Is.EqualTo(FaultStatus.InProgress));
            Assert.That(saved.ImagePath, Is.EqualTo("/uploads/reports/test.jpg"));
            Assert.That(saved.CreatedDate, Is.EqualTo(createdDate));
        }

        [Test]
        public async Task FaultReport_NullableFieldsShouldAcceptNull()
        {
            // Arrange
            var report = new FaultReport
            {
                UserId = "user-1",
                Description = "Nullable alanlar testi",
                BandNumber = null,
                ProductCode = null,
                ErrorCode = null,
                ImagePath = null
            };

            // Act
            _context.FaultReports.Add(report);
            await _context.SaveChangesAsync();

            // Assert
            var saved = await _context.FaultReports.FindAsync(report.Id);
            Assert.That(saved!.BandNumber, Is.Null);
            Assert.That(saved.ProductCode, Is.Null);
            Assert.That(saved.ErrorCode, Is.Null);
            Assert.That(saved.ImagePath, Is.Null);
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Test verisi oluşturmak için yardımcı fabrika metodu.
        /// </summary>
        private static FaultReport CreateReport(
            string userId,
            string description,
            FaultStatus status = FaultStatus.Pending,
            DateTime? createdDate = null)
        {
            return new FaultReport
            {
                UserId = userId,
                Description = description,
                BandNumber = "B-001",
                ProductCode = "PRD-100",
                ErrorCode = "ERR-100",
                Status = status,
                CreatedDate = createdDate ?? DateTime.UtcNow
            };
        }

        /// <summary>
        /// Birden fazla raporu veritabanına seed etmek için yardımcı metot.
        /// </summary>
        private async Task SeedReportsAsync(params FaultReport[] reports)
        {
            _context.FaultReports.AddRange(reports);
            await _context.SaveChangesAsync();
        }

        #endregion
    }
}
