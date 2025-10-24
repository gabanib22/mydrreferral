using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
