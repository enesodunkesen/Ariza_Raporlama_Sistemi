using Ariza.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace Ariza.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DbContext _context;
        private readonly ConcurrentDictionary<string, object> _repositories = new();
        private bool _disposed;

        public UnitOfWork(DbContext context)
        {
            _context = context;
        }

        public IGenericRepository<T> Repository<T>() where T : class
        {
            var key = typeof(T).FullName ?? typeof(T).Name;

            if (_repositories.TryGetValue(key, out var repository))
            {
                return (IGenericRepository<T>)repository;
            }

            var newRepository = new GenericRepository<T>(_context);
            _repositories[key] = newRepository;
            return newRepository;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed)
            {
                return;
            }

            if (disposing)
            {
                _context.Dispose();
            }

            _disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
