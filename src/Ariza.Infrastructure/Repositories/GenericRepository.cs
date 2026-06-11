using Ariza.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ariza.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly DbContext Context;
        protected readonly DbSet<T> DbSet;

        public GenericRepository(DbContext context)
        {
            Context = context;
            DbSet = context.Set<T>();
        }

        public virtual async Task AddAsync(T entity)
        {
            await DbSet.AddAsync(entity);
        }

        public virtual IQueryable<T> Query()
        {
            return DbSet.AsQueryable();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await DbSet.ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await DbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await DbSet.Where(predicate).ToListAsync();
        }

        public virtual void Remove(T entity)
        {
            DbSet.Remove(entity);
        }

        public virtual void Update(T entity)
        {
            DbSet.Update(entity);
        }
    }
}
