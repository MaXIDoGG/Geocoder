using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using GeoCoder.Models;

namespace GeoCoder.Controllers
{
    public class MapPointsController : Controller
    {
        private readonly ApplicationContext _context;

        public MapPointsController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: MapPoints
        public async Task<ActionResult<IEnumerable<MapPoint>>> Index()
        {
            return await _context.Points.ToListAsync();
        }

        // POST: MapPoints/Create
        [HttpPost]
        public async Task<ActionResult<MapPoint>> Create([FromBody] MapPoint mapPoint)
        {
            if (ModelState.IsValid)
            {
                _context.Add(mapPoint);
                await _context.SaveChangesAsync();
            }
            await _context.Entry(mapPoint).ReloadAsync();

            return Ok(mapPoint);
        }


        // POST: MapPoints/Edit/5
        [HttpPost]
        public async Task<ActionResult<MapPoint>> Edit([FromBody] MapPoint mapPoint)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(mapPoint);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MapPointExists(mapPoint.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            return mapPoint;
        }

        // POST: MapPoints/Delete/5
        [HttpPost, ActionName("Delete")]
        public async Task<ActionResult<MapPoint>> Delete(int id)
        {
            var mapPoint = await _context.Points.FindAsync(id);
            if (mapPoint != null)
            {
                _context.Points.Remove(mapPoint);
            }
            else
            {
                return NotFound();
            }

            await _context.SaveChangesAsync();
            return mapPoint;
        }

        private bool MapPointExists(int id)
        {
            return _context.Points.Any(e => e.Id == id);
        }
    }
}
