using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Board> Boards { get; set; }

        public DbSet<TaskList> TaskLists { get; set; }
        public DbSet<server.Models.Task> Tasks { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        // This constructor is required so EF Core can configure the context
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Board -> TaskLists
            modelBuilder.Entity<TaskList>()
                .HasOne(tl => tl.Board)
                .WithMany(b => b.TaskLists)
                .HasForeignKey(tl => tl.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskList -> Tasks
            modelBuilder.Entity<server.Models.Task>()
                .HasOne(t => t.TaskList)
                .WithMany(tl => tl.Tasks)
                .HasForeignKey(t => t.TaskListId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }


}
