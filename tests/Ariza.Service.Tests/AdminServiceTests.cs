using Ariza.Core.Entities;
using Ariza.Core.Interfaces;
using Ariza.Service.Common;
using Ariza.Service.Implementations;
using Microsoft.AspNetCore.Identity;
using MockQueryable.Moq;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ariza.Service.Tests
{
    [TestFixture]
    public class AdminServiceTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork = null!;
        private Mock<IGenericRepository<MaintenanceRequest>> _mockRequestRepository = null!;
        private Mock<UserManager<AppUser>> _mockUserManager = null!;
        private Mock<RoleManager<AppRole>> _mockRoleManager = null!;
        private AdminService _sut = null!;

        [SetUp]
        public void SetUp()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRequestRepository = new Mock<IGenericRepository<MaintenanceRequest>>();

            _mockUnitOfWork
                .Setup(uow => uow.Repository<MaintenanceRequest>())
                .Returns(_mockRequestRepository.Object);

            var mockUserStore = new Mock<IUserStore<AppUser>>();
            _mockUserManager = new Mock<UserManager<AppUser>>(mockUserStore.Object, null!, null!, null!, null!, null!, null!, null!, null!);

            var mockRoleStore = new Mock<IRoleStore<AppRole>>();
            _mockRoleManager = new Mock<RoleManager<AppRole>>(mockRoleStore.Object, null!, null!, null!, null!);

            _sut = new AdminService(_mockUnitOfWork.Object, _mockUserManager.Object, _mockRoleManager.Object);
        }

        [Test]
        public async Task UpdateMaintenanceRequestStatusAsync_WithInvalidStatus_ShouldReturnFailure()
        {
            // Act
            var result = await _sut.UpdateMaintenanceRequestStatusAsync(1, "GecersizDurum");

            // Assert
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Message, Is.EqualTo("Geçersiz talep durumu."));
        }

        [Test]
        public async Task UpdateMaintenanceRequestStatusAsync_WhenRequestDoesNotExist_ShouldReturnFailure()
        {
            // Arrange
            var requests = new List<MaintenanceRequest>().AsQueryable().BuildMock();
            _mockRequestRepository.Setup(r => r.Query()).Returns(requests);

            // Act
            var result = await _sut.UpdateMaintenanceRequestStatusAsync(99, "Completed");

            // Assert
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Message, Is.EqualTo("Bakım talebi bulunamadı."));
        }

        [Test]
        public async Task UpdateMaintenanceRequestStatusAsync_WithValidRequest_ShouldUpdateStatusAndSave()
        {
            // Arrange
            var request = new MaintenanceRequest
            {
                Id = 1,
                Status = MaintenanceStatus.Pending,
                RequestText = "Bant 1 motor ses yapıyor",
                ReportId = 10,
                CreatedById = "user-1",
                CreatedDate = DateTime.UtcNow
            };

            var requests = new List<MaintenanceRequest> { request }.AsQueryable().BuildMock();
            _mockRequestRepository.Setup(r => r.Query()).Returns(requests);

            _mockRequestRepository.Setup(r => r.Update(It.IsAny<MaintenanceRequest>())).Verifiable();
            _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1).Verifiable();

            // Act
            var result = await _sut.UpdateMaintenanceRequestStatusAsync(1, "InProgress");

            // Assert
            Assert.That(result.IsSuccess, Is.True);
            Assert.That(request.Status, Is.EqualTo(MaintenanceStatus.InProgress));
            _mockRequestRepository.Verify(r => r.Update(It.Is<MaintenanceRequest>(mr => mr.Id == 1 && mr.Status == MaintenanceStatus.InProgress)), Times.Once);
            _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
        }
    }
}
