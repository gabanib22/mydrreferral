using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using MyDrReferral.Data.Models;

namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Allow anonymous access for health checks
    public class HealthCheckController : Controller
    {
        [HttpGet("success")]
        public IActionResult Index()
        {
            return Ok("Success");
        }

        // Explicit absolute routes to avoid any ambiguity
        [HttpGet("test")]
        [HttpGet("/api/healthcheck/test")]
        [HttpPost("test")]
        [HttpPost("/api/healthcheck/test")]
        public async Task<IActionResult> TestDateTime()
        {
            try
            {
                // Get DbContext from HttpContext - always available
                var db = HttpContext.RequestServices.GetRequiredService<MyDrReferralContext>();

                // Create test entity with DateTime.Now (Local) to reproduce the issue
                var testEntity = new TestDateTime
                {
                    TestName = $"Test_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    CreatedDate = DateTime.Now,  // This will be Local - the problem!
                    NullableDate = DateTime.Now  // This will be Local - the problem!
                };

                db.TestDateTime.Add(testEntity);
                await db.SaveChangesAsync();

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
                    innerStackTrace = ex.InnerException?.StackTrace,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // Simple ping endpoint to verify routing
        [HttpGet("test2")]
        [HttpGet("/api/healthcheck/test2")]
        public IActionResult TestRoute()
        {
            return Ok("Test2 OK");
        }
    }
}
