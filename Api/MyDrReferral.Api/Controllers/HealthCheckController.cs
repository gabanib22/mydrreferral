using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyDrReferral.Data.Models;

namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Allow anonymous access for health checks
    public class HealthCheckController : Controller
    {
        private readonly MyDrReferralContext _db;

        public HealthCheckController(MyDrReferralContext db)
        {
            _db = db;
        }

        [HttpGet("success")]
        public IActionResult Index()
        {
            return Ok("Success");
        }

        [HttpGet("test-datetime")]
        [HttpPost("test-datetime")]
        public async Task<IActionResult> TestDateTime()
        {
            try
            {
                // Create test entity with DateTime.Now (Local) to reproduce the issue
                var testEntity = new TestDateTime
                {
                    TestName = $"Test_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    CreatedDate = DateTime.Now,  // This will be Local - the problem!
                    NullableDate = DateTime.Now  // This will be Local - the problem!
                };

                _db.TestDateTime.Add(testEntity);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Test DateTime saved successfully",
                    id = testEntity.Id,
                    createdDate = testEntity.CreatedDate,
                    createdDateKind = testEntity.CreatedDate.Kind.ToString(),
                    nullableDate = testEntity.NullableDate,
                    nullableDateKind = testEntity.NullableDate?.Kind.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
