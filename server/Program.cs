using Microsoft.EntityFrameworkCore;
using server.Data; // your DbContext namespace

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // frontend port
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add DbContext to DI container with connection string
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
var app = builder.Build();

app.UseCors("AllowReact"); // 👈 Add this before app.UseAuthorization

app.UseAuthorization();
app.MapControllers();
app.Run();
