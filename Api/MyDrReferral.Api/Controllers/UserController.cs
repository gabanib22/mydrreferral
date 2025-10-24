using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyDrReferral.Api.MediatR.Handlers;
using MyDrReferral.Api.Model;
using MyDrReferral.Data.Models;
using MyDrReferral.Service;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using System.Security.Claims;
using System.Text.Json;

namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints in this controller
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly MyDrReferralContext _db;
        private readonly IMediator _mediator;

        public UserController(IUserService userService, IMapper mapper, IMediator mediator, MyDrReferralContext db)
        {
            _userService = userService;
            _mapper = mapper;
            _mediator = mediator;
            _db = db;
        }

        #region User Authentication

        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="model">User registration data</param>
        /// <returns>Registration result</returns>
        [HttpPost("register")]
        [AllowAnonymous] // Allow anonymous access for registration
        public async Task<IActionResult> Register(UserRegistrationRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var user = new ApplicationUser
                    {
                        UserName = model.Email,
                        Email = model.Email,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        PhoneNumber = model.PhoneNumber,
                        UserType = model.UserType
                    };

                    var result = await _mediator.Send(new RegistrationRequest { User = user, Password = model.Password });

                    if (result.Succeeded)
                    {
                        return Ok(new ResponseModel
                        {
                            IsSuccess = true,
                            Message = new List<string> { "User registered successfully" }
                        });
                    }
                    else
                    {
                        return BadRequest(new ResponseModel
                        {
                            IsSuccess = false,
                            Message = result.Errors.Select(e => e.Description).ToList()
                        });
                    }
                }
                else
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Register ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// User login
        /// </summary>
        /// <param name="model">Login credentials</param>
        /// <returns>Login result with JWT token</returns>
        [HttpPost("login")]
        [AllowAnonymous] // Allow anonymous access for login
        public async Task<IActionResult> Login(UserLoginRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var loginModel = _mapper.Map<LoginModel>(model);
                    var token = await _mediator.Send(new LoginRequest { LoginModel = loginModel });

                    if (!string.IsNullOrEmpty(token))
                    {
                        var response = new ResponseModel
                        {
                            IsSuccess = true,
                            Message = new List<string> { "Login successful" },
                            Data = new { Token = token }
                        };
                        Console.WriteLine($"Login successful - Token: {token.Substring(0, Math.Min(20, token.Length))}...");
                        Console.WriteLine($"Response: {JsonSerializer.Serialize(response)}");
                        return Ok(response);
                    }
                    else
                    {
                        return Unauthorized(new ResponseModel
                        {
                            IsSuccess = false,
                            Message = new List<string> { "Invalid credentials" }
                        });
                    }
                }
                else
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Login ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        #endregion

        #region Password Management

        /// <summary>
        /// Change user password
        /// </summary>
        /// <param name="model">Password change data</param>
        /// <returns>Password change result</returns>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(UserChangePasswordRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var changePassword = _mapper.Map<ChangePassword>(model);
                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ChangePasswordRequest { ChangePassword = changePassword }));

                    return Ok(response);
                }
                else
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"ChangePassword ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Reset user password
        /// </summary>
        /// <param name="model">Password reset data</param>
        /// <returns>Password reset result</returns>
        [HttpPost("reset-password")]
        [AllowAnonymous] // Allow anonymous access for reset password
        public async Task<IActionResult> ResetPassword(UserResetPasswordRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var resetPassword = _mapper.Map<ResetPassword>(model);
                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ResetPasswordRequest { ResetPassword = resetPassword }));

                    return Ok(response);
                }
                else
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"ResetPassword ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Forgot password - send reset email
        /// </summary>
        /// <param name="model">Forgot password data</param>
        /// <returns>Forgot password result</returns>
        [HttpPost("forgot-password")]
        [AllowAnonymous] // Allow anonymous access for forgot password
        public async Task<IActionResult> ForgotPassword(UserForgotPasswordRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var forgotPassword = _mapper.Map<ForgotPassword>(model);
                    var callback = $"{Request.Scheme}://{Request.Host}/reset-password";
                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ForgotPasswordRequest { ForgotPassword = forgotPassword, CallbackUrl = callback }));

                    return Ok(response);
                }
                else
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"ForgotPassword ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        #endregion

        #region User Profile Management

        /// <summary>
        /// Get current user's profile information
        /// </summary>
        /// <returns>User profile data</returns>
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                // Debug: Log all claims
                Console.WriteLine("=== JWT Claims Debug ===");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
                }
                Console.WriteLine("=== End JWT Claims Debug ===");

                // Get current user ID from JWT token - try multiple claim types
                var currentUserId = User.FindFirst("nameid")?.Value ?? 
                                  User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                                  User.FindFirst("userId")?.Value;
                Console.WriteLine($"Current User ID from token: {currentUserId}");
                
                if (string.IsNullOrEmpty(currentUserId))
                {
                    Console.WriteLine("No user ID found in token");
                    return Unauthorized(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = new List<string> { "User not authenticated" }
                    });
                }

                // Get user from database with related data
                Console.WriteLine($"Looking for user with ID: {currentUserId}");
                var user = await _db.Users
                    .Where(u => u.Id == currentUserId && u.IsActive == true && u.IsDelete == false)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    Console.WriteLine("User not found in database");
                    return NotFound(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = new List<string> { "User not found" }
                    });
                }

                // Get personal details
                var personalDetail = await _db.TblPersonalDetail
                    .FirstOrDefaultAsync(p => p.UserId == user.UserId);

                // Get address details
                var addressDetail = await _db.TblAddress
                    .FirstOrDefaultAsync(a => a.UserId == user.UserId);

                // Create response model
                var userProfile = new UserProfileResponseModel
                {
                    Id = user.Id,
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    UserType = user.UserType,
                    IsActive = user.IsActive,
                    CreatedOn = user.CreatedOn,
                    ReferralAmount = user.ReferralAmount,
                    // Map from personal details
                    PhotoUrl = personalDetail?.PhotoUrl,
                    BirthDate = personalDetail?.BirthDate,
                    Qualification = personalDetail?.Degrees,
                    Specialization = personalDetail?.Services,
                    Bio = personalDetail?.Bio,
                    Experience = personalDetail?.Experience,
                    // Map from address details
                    ClinicName = addressDetail?.FirmName,
                    ClinicAddress = addressDetail?.Address1,
                    Address2 = addressDetail?.Address2,
                    City = addressDetail?.City,
                    State = addressDetail?.State,
                    Pincode = addressDetail?.PostalCode
                };

                Console.WriteLine($"User found: {user != null}");
                if (user != null)
                {
                    Console.WriteLine($"User details: {user.FirstName} {user.LastName} ({user.Email})");
                }

                return Ok(new ResponseModel
                {
                    IsSuccess = true,
                    Data = userProfile,
                    Message = new List<string> { "User profile retrieved successfully" }
                });
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"GetUserProfile ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Update current user's profile information
        /// </summary>
        /// <param name="model">User profile data</param>
        /// <returns>Updated user profile</returns>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateUserProfile(UserProfileRequestModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList()
                    });
                }

                // Get current user ID from JWT token
                var currentUserId = User.FindFirst("nameid")?.Value ??
                                  User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                                  User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = new List<string> { "User not authenticated" }
                    });
                }

                // Get user from database
                var user = await _db.Users
                    .Where(u => u.Id == currentUserId && u.IsActive == true && u.IsDelete == false)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = new List<string> { "User not found" }
                    });
                }

                // Update user properties
                user.FirstName = model.FirstName;
                user.LastName = model.LastName;
                user.Email = model.Email;
                user.UserName = model.Email; // Update username to match email
                user.PhoneNumber = model.PhoneNumber;
                user.UserType = model.UserType;
                user.ReferralAmount = model.ReferralAmount;

                // Update or create personal details
                var personalDetail = await _db.TblPersonalDetail
                    .FirstOrDefaultAsync(p => p.UserId == user.UserId);

                if (personalDetail == null)
                {
                    personalDetail = new TblPersonalDetail
                    {
                        UserId = user.UserId,
                        IsActive = true,
                        IsDelete = false,
                        CreatedBy = user.UserId
                    };
                    _db.TblPersonalDetail.Add(personalDetail);
                }

                personalDetail.PhotoUrl = model.PhotoUrl;
                personalDetail.BirthDate = model.BirthDate;
                personalDetail.Degrees = model.Qualification; // Map qualification to degrees
                personalDetail.Services = model.Specialization; // Map specialization to services
                personalDetail.Bio = model.Bio;
                personalDetail.Experience = model.Experience;

                // Update or create address details
                var addressDetail = await _db.TblAddress
                    .FirstOrDefaultAsync(a => a.UserId == user.UserId);

                if (addressDetail == null)
                {
                    addressDetail = new TblAddress
                    {
                        UserId = user.UserId,
                        IsActive = true,
                        IsDelete = false
                    };
                    _db.TblAddress.Add(addressDetail);
                }

                addressDetail.FirmName = model.ClinicName; // Map clinic name to firm name
                addressDetail.Address1 = model.ClinicAddress; // Map clinic address to address1
                addressDetail.Address2 = model.Address2;
                addressDetail.City = model.City;
                addressDetail.State = model.State;
                addressDetail.PostalCode = model.Pincode; // Map pincode to postal code

                // Save changes
                await _db.SaveChangesAsync();

                // Return updated user profile
                var updatedUser = new UserProfileResponseModel
                {
                    Id = user.Id,
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    UserType = user.UserType,
                    IsActive = user.IsActive,
                    CreatedOn = user.CreatedOn,
                    ReferralAmount = user.ReferralAmount,
                    // Map from personal details
                    PhotoUrl = personalDetail?.PhotoUrl,
                    BirthDate = personalDetail?.BirthDate,
                    Qualification = personalDetail?.Degrees,
                    Specialization = personalDetail?.Services,
                    Bio = personalDetail?.Bio,
                    Experience = personalDetail?.Experience,
                    // Map from address details
                    ClinicName = addressDetail?.FirmName,
                    ClinicAddress = addressDetail?.Address1,
                    Address2 = addressDetail?.Address2,
                    City = addressDetail?.City,
                    State = addressDetail?.State,
                    Pincode = addressDetail?.PostalCode
                };

                return Ok(new ResponseModel
                {
                    IsSuccess = true,
                    Data = updatedUser,
                    Message = new List<string> { "User profile updated successfully" }
                });
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"UpdateUserProfile ### Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { ex.Message }
                });
            }
        }

        #endregion
    }
}
