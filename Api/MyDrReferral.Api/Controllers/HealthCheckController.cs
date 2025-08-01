using Microsoft.AspNetCore.Mvc;

namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthCheckController : Controller
    {
        [HttpGet("success")]
        public IActionResult Index()
        {
            return Ok("Success");
        }
    }
}
