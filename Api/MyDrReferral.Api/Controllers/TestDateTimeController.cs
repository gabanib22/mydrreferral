using Microsoft.AspNetCore.Mvc;
using MyDrReferral.Data.Models;

namespace MyDrReferral.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestDateTimeController : ControllerBase
    {
        private readonly MyDrReferralContext _db;

        public TestDateTimeController(MyDrReferralContext db)
        {
            _db = db;
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestDateTime()
        {
            try
            {
                // Create test entity with both DateTime.Now (Local) and DateTime.UtcNow
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

