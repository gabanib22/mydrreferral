using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyDrReferral.Api.Model;
using MyDrReferral.Data.Models;
using System.Security.Claims;
using System.Text.Json;

namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints in this controller
    public class DoctorController : ControllerBase
    {
        private readonly MyDrReferralContext _db;

        public DoctorController(MyDrReferralContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Search for doctors by name or email
        /// </summary>
        /// <param name="searchText">Search term</param>
        /// <returns>List of matching doctors</returns>
        [HttpGet("search/{searchText}")]
        public async Task<IActionResult> SearchDoctors(string searchText)
        {
            try
            {
                Console.WriteLine($"Searching for doctors with term: {searchText}");

                if (string.IsNullOrWhiteSpace(searchText) || searchText.Length < 2)
                {
                    return Ok(new ResponseModel
                    {
                        IsSuccess = true,
                        Message = new List<string> { "Search term must be at least 2 characters" },
                        Data = new List<object>()
                    });
                }

                // Search for doctors (users with UserType = 0) with comprehensive search
                var searchTerm = searchText.ToLower(); // Case-insensitive search
                var currentUserId = User.FindFirst("nameid")?.Value ??
                                  User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                                  User.FindFirst("userId")?.Value;
                var doctors = await _db.Users
                    .Where(u => u.UserType == 0 && // Doctor type
                                u.Id != currentUserId && // Exclude current user
                               u.IsActive == true && 
                               u.IsDelete == false &&
                               (u.FirstName.ToLower().Contains(searchTerm) || 
                                u.LastName.ToLower().Contains(searchTerm) || 
                                u.Email.ToLower().Contains(searchTerm) ||
                                (u.FirstName + " " + u.LastName).ToLower().Contains(searchTerm) ||
                                (u.PhoneNumber != null && u.PhoneNumber.Contains(searchText)) ||
                                (u.UserName != null && u.UserName.ToLower().Contains(searchTerm))))
                    .Select(u => new
                    {
                        id = u.UserId, // Use UserId (integer) instead of Id (UUID)
                        userId = u.UserId,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email,
                        phoneNumber = u.PhoneNumber,
                        userName = u.UserName,
                        userType = u.UserType,
                        isActive = u.IsActive,
                        createdOn = u.CreatedOn,
                        // Add display name for easier frontend handling
                        displayName = u.FirstName + " " + u.LastName,
                        referralAmount = u.ReferralAmount ?? 0,
                        // Add searchable text for frontend filtering
                        searchText = (u.FirstName + " " + u.LastName + " " + u.Email + " " + (u.PhoneNumber ?? "")).ToLower()
                    })
                    .Take(20) // Increased limit for better search results
                    .ToListAsync();

                Console.WriteLine($"Found {doctors.Count} doctors matching '{searchText}'");

                return Ok(new ResponseModel
                {
                    IsSuccess = true,
                    Message = new List<string> { "Doctors found successfully" },
                    Data = doctors
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching doctors: {ex.Message}");
                return StatusCode(500, new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "An error occurred while searching for doctors." }
                });
            }
        }

        /// <summary>
        /// Advanced search for doctors with multiple criteria
        /// </summary>
        /// <param name="searchText">Search term</param>
        /// <param name="userType">Optional user type filter</param>
        /// <returns>List of matching doctors</returns>
        [HttpGet("search-advanced")]
        public async Task<IActionResult> AdvancedSearchDoctors([FromQuery] string searchText, [FromQuery] int? userType = null)
        {
            try
            {
                Console.WriteLine($"Advanced search for doctors with term: {searchText}, userType: {userType}");

                if (string.IsNullOrWhiteSpace(searchText) || searchText.Length < 2)
                {
                    return Ok(new ResponseModel
                    {
                        IsSuccess = true,
                        Message = new List<string> { "Search term must be at least 2 characters" },
                        Data = new List<object>()
                    });
                }

                var searchTerm = searchText.ToLower();
                
                var query = _db.Users
                    .Where(u => u.IsActive == true && u.IsDelete == false);

                // Apply user type filter if provided
                if (userType.HasValue)
                {
                    query = query.Where(u => u.UserType == userType.Value);
                }

                // Apply search criteria
                query = query.Where(u => 
                    u.FirstName.ToLower().Contains(searchTerm) || 
                    u.LastName.ToLower().Contains(searchTerm) || 
                    u.Email.ToLower().Contains(searchTerm) ||
                    (u.FirstName + " " + u.LastName).ToLower().Contains(searchTerm) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(searchText)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(searchTerm)));

                var doctors = await query
                    .Select(u => new
                    {
                        id = u.UserId, // Use UserId (integer) instead of Id (UUID)
                        userId = u.UserId,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email,
                        phoneNumber = u.PhoneNumber,
                        userName = u.UserName,
                        userType = u.UserType,
                        isActive = u.IsActive,
                        createdOn = u.CreatedOn,
                        displayName = u.FirstName + " " + u.LastName,
                        searchText = (u.FirstName + " " + u.LastName + " " + u.Email + " " + (u.PhoneNumber ?? "")).ToLower()
                    })
                    .Take(20)
                    .ToListAsync();

                Console.WriteLine($"Found {doctors.Count} users matching '{searchText}'");

                return Ok(new ResponseModel
                {
                    IsSuccess = true,
                    Message = new List<string> { "Search completed successfully" },
                    Data = doctors
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in advanced search: {ex.Message}");
                return StatusCode(500, new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "An error occurred while performing advanced search." }
                });
            }
        }

        /// <summary>
        /// Get all doctors (for admin purposes)
        /// </summary>
        /// <returns>List of all doctors</returns>
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDoctors()
        {
            try
            {
                var doctors = await _db.Users
                    .Where(u => u.UserType == 0 && u.IsActive == true && u.IsDelete == false)
                    .Select(u => new
                    {
                        id = u.UserId, // Use UserId (integer) instead of Id (UUID)
                        userId = u.UserId,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email,
                        phoneNumber = u.PhoneNumber,
                        userType = u.UserType,
                        isActive = u.IsActive,
                        createdOn = u.CreatedOn
                    })
                    .ToListAsync();

                return Ok(new ResponseModel
                {
                    IsSuccess = true,
                    Message = new List<string> { "Doctors retrieved successfully" },
                    Data = doctors
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting all doctors: {ex.Message}");
                return StatusCode(500, new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "An error occurred while retrieving doctors." }
                });
            }
        }
    }
}
