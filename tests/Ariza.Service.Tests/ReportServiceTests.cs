using Ariza.Core.Entities;
using Ariza.Core.Interfaces;
using Ariza.Service.Common;
using Ariza.Service.Dtos.Reports;
using Ariza.Service.Implementations;
using Microsoft.AspNetCore.Hosting;
using MockQueryable.Moq;
using Moq;
using NUnit.Framework;

namespace Ariza.Service.Tests
{
    [TestFixture]
    public class ReportServiceTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork = null!;
        private Mock<IGenericRepository<FaultReport>> _mockRepository = null!;
        private Mock<IWebHostEnvironment> _mockEnvironment = null!;
        private ReportService _sut = null!; // System Under Test

        [SetUp]
        public void SetUp()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRepository = new Mock<IGenericRepository<FaultReport>>();
            _mockEnvironment = new Mock<IWebHostEnvironment>();

            // IUnitOfWork.Repository<FaultReport>() her çağrıldığında aynı mock repository'yi dönsün
            _mockUnitOfWork
                .Setup(uow => uow.Repository<FaultReport>())
                .Returns(_mockRepository.Object);

            _sut = new ReportService(_mockUnitOfWork.Object, _mockEnvironment.Object);
        }

        #region CreateAsync Tests

        [Test]
        public async Task CreateAsync_ValidRequest_ShouldReturnSuccessWithCorrectData()
        {
            // Arrange
            var userId = "user-123";
            var bandNumber = "B-001";
            var request = new CreateFaultReportRequestDto
            {
                Description = "Motor arızası tespit edildi",
                ProductCode = "PRD-100",
                ErrorCode = "ERR-500",
                Image = null // Resim olmadan test
            };

            _mockRepository
                .Setup(r => r.AddAsync(It.IsAny<FaultReport>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork
                .Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            var result = await _sut.CreateAsync(userId, bandNumber, request);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data, Is.Not.Null);
            Assert.That(result.Data!.Description, Is.EqualTo("Motor arızası tespit edildi"));
            Assert.That(result.Data.ProductCode, Is.EqualTo("PRD-100"));
            Assert.That(result.Data.ErrorCode, Is.EqualTo("ERR-500"));
            Assert.That(result.Data.UserId, Is.EqualTo(userId));
            Assert.That(result.Data.BandNumber, Is.EqualTo(bandNumber));
            Assert.That(result.Data.Status, Is.EqualTo(FaultStatus.Pending.ToString()));
            Assert.That(result.Data.ImagePath, Is.Null);
        }

        [Test]
        public async Task CreateAsync_ValidRequest_ShouldCallRepositoryAddAndSave()
        {
            // Arrange
            var request = new CreateFaultReportRequestDto
            {
                Description = "Elektrik arızası bildirimi",
                Image = null
            };

            _mockRepository
                .Setup(r => r.AddAsync(It.IsAny<FaultReport>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork
                .Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            await _sut.CreateAsync("user-1", "B-001", request);

            // Assert
            _mockRepository.Verify(r => r.AddAsync(It.Is<FaultReport>(
                f => f.Description == "Elektrik arızası bildirimi"
                  && f.UserId == "user-1"
                  && f.Status == FaultStatus.Pending
            )), Times.Once);

            _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
        }

        [Test]
        public async Task CreateAsync_WithNullBandNumber_ShouldStillSucceed()
        {
            // Arrange
            var request = new CreateFaultReportRequestDto
            {
                Description = "Band numarası olmadan arıza bildirimi",
                Image = null
            };

            _mockRepository
                .Setup(r => r.AddAsync(It.IsAny<FaultReport>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork
                .Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            var result = await _sut.CreateAsync("user-1", null, request);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.BandNumber, Is.Null);
        }

        [Test]
        public async Task CreateAsync_WithNullOptionalFields_ShouldStillSucceed()
        {
            // Arrange
            var request = new CreateFaultReportRequestDto
            {
                Description = "Sadece açıklama var",
                ProductCode = null,
                ErrorCode = null,
                Image = null
            };

            _mockRepository
                .Setup(r => r.AddAsync(It.IsAny<FaultReport>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork
                .Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            var result = await _sut.CreateAsync("user-1", "B-001", request);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.ProductCode, Is.Null);
            Assert.That(result.Data.ErrorCode, Is.Null);
        }

        [Test]
        public async Task CreateAsync_ShouldSetStatusToPending()
        {
            // Arrange
            var request = new CreateFaultReportRequestDto
            {
                Description = "Yeni arıza kaydı durumu test",
                Image = null
            };

            FaultReport? capturedReport = null;
            _mockRepository
                .Setup(r => r.AddAsync(It.IsAny<FaultReport>()))
                .Callback<FaultReport>(r => capturedReport = r)
                .Returns(Task.CompletedTask);

            _mockUnitOfWork
                .Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            await _sut.CreateAsync("user-1", null, request);

            // Assert
            Assert.That(capturedReport, Is.Not.Null);
            Assert.That(capturedReport!.Status, Is.EqualTo(FaultStatus.Pending));
        }

        #endregion

        #region GetMyReportsAsync Tests

        [Test]
        public async Task GetMyReportsAsync_WithoutStatusFilter_ShouldReturnAllUserReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Arıza 1"),
                CreateFaultReport(2, userId, FaultStatus.InProgress, "Arıza 2"),
                CreateFaultReport(3, userId, FaultStatus.Resolved, "Arıza 3")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, null);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(3));
        }

        [Test]
        public async Task GetMyReportsAsync_WithEmptyStatus_ShouldReturnAllUserReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Arıza 1"),
                CreateFaultReport(2, userId, FaultStatus.Resolved, "Arıza 2")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetMyReportsAsync_WithWhitespaceStatus_ShouldReturnAllUserReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Arıza 1")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "   ");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(1));
        }

        [Test]
        public async Task GetMyReportsAsync_WithPendingStatus_ShouldReturnOnlyPendingReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bekleyen arıza"),
                CreateFaultReport(2, userId, FaultStatus.InProgress, "Devam eden arıza"),
                CreateFaultReport(3, userId, FaultStatus.Pending, "Bir başka bekleyen"),
                CreateFaultReport(4, userId, FaultStatus.Resolved, "Çözülmüş arıza")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "Pending");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(2));
            Assert.That(result.Data.All(r => r.Status == "Pending"), Is.True);
        }

        [Test]
        public async Task GetMyReportsAsync_WithInProgressStatus_ShouldReturnOnlyInProgressReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bekleyen"),
                CreateFaultReport(2, userId, FaultStatus.InProgress, "Devam eden"),
                CreateFaultReport(3, userId, FaultStatus.Resolved, "Çözülmüş")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "InProgress");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(1));
            Assert.That(result.Data.First().Status, Is.EqualTo("InProgress"));
        }

        [Test]
        public async Task GetMyReportsAsync_WithResolvedStatus_ShouldReturnOnlyResolvedReports()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bekleyen"),
                CreateFaultReport(2, userId, FaultStatus.Resolved, "Çözülmüş 1"),
                CreateFaultReport(3, userId, FaultStatus.Resolved, "Çözülmüş 2")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "Resolved");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(2));
            Assert.That(result.Data.All(r => r.Status == "Resolved"), Is.True);
        }

        [Test]
        public async Task GetMyReportsAsync_WithCaseInsensitiveStatus_ShouldStillFilter()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bekleyen"),
                CreateFaultReport(2, userId, FaultStatus.InProgress, "Devam eden")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "pending");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(1));
            Assert.That(result.Data.First().Status, Is.EqualTo("Pending"));
        }

        [Test]
        public async Task GetMyReportsAsync_WithInvalidStatus_ShouldReturnFailure()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Arıza")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "GecersizDurum");

            // Assert
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Message, Does.Contain("Geçersiz durum filtresi"));
            Assert.That(result.Data, Is.Null);
        }

        [Test]
        public async Task GetMyReportsAsync_WithRandomString_ShouldReturnFailure()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>();

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "xyz123");

            // Assert
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Message, Does.Contain("Geçerli değerler"));
        }

        [Test]
        public async Task GetMyReportsAsync_ShouldNotReturnOtherUsersReports()
        {
            // Arrange
            var currentUserId = "user-123";
            var otherUserId = "user-456";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, currentUserId, FaultStatus.Pending, "Benim arızam"),
                CreateFaultReport(2, otherUserId, FaultStatus.Pending, "Başkasının arızası"),
                CreateFaultReport(3, currentUserId, FaultStatus.Resolved, "Benim diğer arızam")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(currentUserId, null);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(2));
            Assert.That(result.Data.All(r => r.UserId == currentUserId), Is.True);
        }

        [Test]
        public async Task GetMyReportsAsync_WhenNoReportsExist_ShouldReturnEmptyList()
        {
            // Arrange
            var userId = "user-no-reports";
            var reports = new List<FaultReport>();

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, null);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data, Is.Not.Null);
            Assert.That(result.Data!.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task GetMyReportsAsync_WithStatusFilter_WhenNoMatch_ShouldReturnEmptyList()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bekleyen arıza"),
                CreateFaultReport(2, userId, FaultStatus.Pending, "Bir başka bekleyen")
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, "Resolved");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task GetMyReportsAsync_ShouldReturnReportsOrderedByCreatedDateDescending()
        {
            // Arrange
            var userId = "user-123";
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Eski arıza", DateTime.UtcNow.AddDays(-10)),
                CreateFaultReport(2, userId, FaultStatus.Pending, "Yeni arıza", DateTime.UtcNow),
                CreateFaultReport(3, userId, FaultStatus.Pending, "Orta arıza", DateTime.UtcNow.AddDays(-5))
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, null);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            var resultList = result.Data!.ToList();
            Assert.That(resultList[0].Description, Is.EqualTo("Yeni arıza"));
            Assert.That(resultList[1].Description, Is.EqualTo("Orta arıza"));
            Assert.That(resultList[2].Description, Is.EqualTo("Eski arıza"));
        }

        [Test]
        public async Task GetMyReportsAsync_ShouldMapAllFieldsCorrectly()
        {
            // Arrange
            var userId = "user-123";
            var createdDate = new DateTime(2026, 6, 1, 10, 30, 0, DateTimeKind.Utc);
            var reports = new List<FaultReport>
            {
                new()
                {
                    Id = 42,
                    UserId = userId,
                    BandNumber = "B-007",
                    Description = "Detaylı arıza açıklaması",
                    ProductCode = "PRD-999",
                    ErrorCode = "ERR-101",
                    Status = FaultStatus.InProgress,
                    ImagePath = "/uploads/reports/test.jpg",
                    CreatedDate = createdDate
                }
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetMyReportsAsync(userId, null);

            // Assert
            var dto = result.Data!.Single();
            Assert.That(dto.Id, Is.EqualTo(42));
            Assert.That(dto.UserId, Is.EqualTo(userId));
            Assert.That(dto.BandNumber, Is.EqualTo("B-007"));
            Assert.That(dto.Description, Is.EqualTo("Detaylı arıza açıklaması"));
            Assert.That(dto.ProductCode, Is.EqualTo("PRD-999"));
            Assert.That(dto.ErrorCode, Is.EqualTo("ERR-101"));
            Assert.That(dto.Status, Is.EqualTo("InProgress"));
            Assert.That(dto.ImagePath, Is.EqualTo("/uploads/reports/test.jpg"));
            Assert.That(dto.CreatedDate, Is.EqualTo(createdDate));
        }

        #endregion

        #region GetDashboardStatsAsync Tests

        [Test]
        public async Task GetDashboardStatsAsync_ShouldReturnCorrectStatusCounts()
        {
            // Arrange
            var userId = "user-123";
            var today = DateTime.UtcNow.Date;
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "P1", today),
                CreateFaultReport(2, userId, FaultStatus.Pending, "P2", today.AddDays(-1)),
                CreateFaultReport(3, userId, FaultStatus.InProgress, "IP1", today),
                CreateFaultReport(4, userId, FaultStatus.Resolved, "R1", today.AddDays(-2)),
                CreateFaultReport(5, userId, FaultStatus.Resolved, "R2", today.AddDays(-3)),
                CreateFaultReport(6, userId, FaultStatus.Resolved, "R3", today.AddDays(-10))
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetDashboardStatsAsync(userId);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.TotalCount, Is.EqualTo(6));
            Assert.That(result.Data.PendingCount, Is.EqualTo(2));
            Assert.That(result.Data.InProgressCount, Is.EqualTo(1));
            Assert.That(result.Data.CompletedCount, Is.EqualTo(3));
        }

        [Test]
        public async Task GetDashboardStatsAsync_ShouldReturnCorrectTodayCount()
        {
            // Arrange
            var userId = "user-123";
            var today = DateTime.UtcNow.Date;
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Bugün 1", today.AddHours(9)),
                CreateFaultReport(2, userId, FaultStatus.Pending, "Bugün 2", today.AddHours(14)),
                CreateFaultReport(3, userId, FaultStatus.InProgress, "Dün", today.AddDays(-1))
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetDashboardStatsAsync(userId);

            // Assert
            Assert.That(result.Data!.TodayCount, Is.EqualTo(2));
        }

        [Test]
        public async Task GetDashboardStatsAsync_WhenNoReports_ShouldReturnAllZeros()
        {
            // Arrange
            var userId = "user-no-reports";
            var reports = new List<FaultReport>();

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetDashboardStatsAsync(userId);

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Data!.TodayCount, Is.EqualTo(0));
            Assert.That(result.Data.WeeklyCount, Is.EqualTo(0));
            Assert.That(result.Data.TotalCount, Is.EqualTo(0));
            Assert.That(result.Data.PendingCount, Is.EqualTo(0));
            Assert.That(result.Data.InProgressCount, Is.EqualTo(0));
            Assert.That(result.Data.CompletedCount, Is.EqualTo(0));
        }

        [Test]
        public async Task GetDashboardStatsAsync_ShouldNotIncludeOtherUsersReports()
        {
            // Arrange
            var userId = "user-123";
            var otherUserId = "user-456";
            var today = DateTime.UtcNow.Date;
            var reports = new List<FaultReport>
            {
                CreateFaultReport(1, userId, FaultStatus.Pending, "Benim", today),
                CreateFaultReport(2, otherUserId, FaultStatus.Pending, "Başkasının", today),
                CreateFaultReport(3, otherUserId, FaultStatus.InProgress, "Başkasının 2", today)
            };

            var mockQueryable = reports.AsQueryable().BuildMock();
            _mockRepository.Setup(r => r.Query()).Returns(mockQueryable);

            // Act
            var result = await _sut.GetDashboardStatsAsync(userId);

            // Assert
            Assert.That(result.Data!.TotalCount, Is.EqualTo(1));
            Assert.That(result.Data.PendingCount, Is.EqualTo(1));
            Assert.That(result.Data.InProgressCount, Is.EqualTo(0));
        }

        #endregion

        #region Helpers

        /// <summary>
        /// Test verisi oluşturmak için yardımcı fabrika metodu.
        /// </summary>
        private static FaultReport CreateFaultReport(
            int id,
            string userId,
            FaultStatus status,
            string description,
            DateTime? createdDate = null)
        {
            return new FaultReport
            {
                Id = id,
                UserId = userId,
                Status = status,
                Description = description,
                BandNumber = "B-001",
                ProductCode = "PRD-100",
                ErrorCode = "ERR-100",
                CreatedDate = createdDate ?? DateTime.UtcNow
            };
        }

        #endregion
    }
}
