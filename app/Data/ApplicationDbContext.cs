using Microsoft.EntityFrameworkCore;
using GeoCoder.Models;

public class ApplicationDbContext : DbContext
{
	public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options) { }

	public DbSet<MapPoint> MapPoints { get; set; }
}
