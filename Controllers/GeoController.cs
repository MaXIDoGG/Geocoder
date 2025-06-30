using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GeoCoder.Models;
using Microsoft.EntityFrameworkCore;

namespace GeoCoder.Controllers;

// Controllers/MapPointsController.cs
[Route("api/[controller]")]
[ApiController]
public class MapPointsController : ControllerBase
{
	private readonly ApplicationDbContext _context;

	public MapPointsController(ApplicationDbContext context)
	{
		_context = context;
	}

	[HttpGet]
	public async Task<IActionResult> GetPoints()
	{
		return Ok(await _context.MapPoints.ToListAsync());
	}

	[HttpPost]
	public async Task<IActionResult> AddPoint([FromBody] MapPoint point)
	{
		_context.MapPoints.Add(point);
		await _context.SaveChangesAsync();
		return Ok(point);
	}

	[HttpDelete("{id}")]
	public async Task<IActionResult> DeletePoint(int id)
	{
		var point = await _context.MapPoints.FindAsync(id);
		if (point == null) return NotFound();

		_context.MapPoints.Remove(point);
		await _context.SaveChangesAsync();
		return NoContent();
	}
}