using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        // This constructor is required so EF Core can configure the context
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

       // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
       // {
       //     optionsBuilder.UseNpgsql("Host=database-1.cfg48kwk6vtl.us-east-2.rds.amazonaws.com;Port=5432;Database=postgres;Username=postgres;Password=ulBalYQ29Rbh3Zdi0CXU");
       // }
    }
}
