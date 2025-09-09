using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        // This constructor is required so EF Core can configure the context
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
    }
}
