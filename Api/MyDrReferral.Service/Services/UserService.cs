using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MyDrReferral.Data.Models;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using static MyDrReferral.Service.Common;

namespace MyDrReferral.Service.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;
        private readonly MyDrReferralContext _db;
        private readonly IErrorLogService _errorLogService;
        public UserService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailService emailService, MyDrReferralContext db, IErrorLogService errorLogService)
        {

            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
            _db = db;
            _errorLogService = errorLogService;
        }

        public async Task<IdentityResult> AddEditUser(ApplicationUser user, string password)
        {
            //Register user

            var result = await _userManager.CreateAsync(user, password);

            return result;
        }

        public async Task<string> Login(LoginModel model)
        {
            var result = await _signInManager.PasswordSignInAsync(model.UserName, model.Password, false, false);

            if (result.Succeeded)
            {
                var user = await _userManager.FindByEmailAsync(model.UserName);
                return Authenticate(model.UserName, model.Password, user.Id);
            }
            else
            {
                return null;
            }
        }

        public string Authenticate(string UserName, string Password, string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenKey = Encoding.UTF8.GetBytes(_configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key not found"));
            var issuer = _configuration["JWT:Issuer"] ?? throw new InvalidOperationException("JWT:Issuer not found");
            var audience = _configuration["JWT:Audience"] ?? throw new InvalidOperationException("JWT:Audience not found");
            var expiryMinutes = _configuration.GetValue<int>("JWT:ExpiryMinutes", 60);
            
            Console.WriteLine($"Generating JWT Token - Issuer: {issuer}, Audience: {audience}, Expiry: {expiryMinutes} minutes");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Name, UserName),
                    new Claim("userId", userId),
                    new Claim("userName", UserName)
                }),
                Expires = DateTime.UtcNow.ToUniversalTime().AddMinutes(expiryMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var generatedToken = tokenHandler.WriteToken(token);
            
            Console.WriteLine($"JWT Token generated successfully for user: {UserName}");
            return generatedToken;
        }

        public async void Logout()
        {
            await _signInManager.SignOutAsync();
        }

        public async Task<ServiceResponse> ChangePassword(ChangePassword model)
        {
            var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            //int x = 10;
            //int y = 0;
            //int resul = x / y;

            var res = new ServiceResponse();
            res.IsSuccess = false;
            if (userIdClaim == null)
            {
                res.Message = new List<string> { "User is not authenticated." };
                return res;
            }

            var userId = userIdClaim.Value;

            // Check if userId is null or empty
            if (string.IsNullOrEmpty(userId))
            {
                res.Message = new List<string> { "User ID is missing." };
                return res;
            }

            // Try to retrieve the user by ID
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                res.Message = new List<string> { "User not found." };
                return res;
            }

            var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);

            if (result.Succeeded)
            {
                res.IsSuccess = true;
                res.Message.Add("Password changed successfully");
            }
            else
            {
                foreach (var item in result.Errors)
                {
                    res.Message.Add(item.Description);
                }
            }

            return res;
        }

        public async Task<ServiceResponse> ResetPassword(ResetPassword resetPasswordword)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordword.Email);
            var res = new ServiceResponse();
            res.IsSuccess = false;
            if (user == null)
            {
                res.Message.Add("User not found");

                return res;
            }

            var resetPassResult = await _userManager.ResetPasswordAsync(user, resetPasswordword.Token, resetPasswordword.Password);

            if (resetPassResult.Succeeded)
            {
                res.IsSuccess = true;
                res.Message.Add("Password reset successfully");
                return res;
            }
            else
            {
                res.IsSuccess = false;

                foreach (var item in resetPassResult.Errors)
                {
                    res.Message.Add(item.Description);
                }
                return res;

            }
        }

        public async Task<ServiceResponse> ForgotPassword(ForgotPassword forgotPassword, string CallbackUrl)
        {
            var res = new ServiceResponse();
            res.IsSuccess = false;
            var user = await _userManager.FindByEmailAsync(forgotPassword.Email);
            if (user == null)
            {
                res.Message.Add("Invalid Username");
                return res;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var callback = CallbackUrl.Replace("TOKEN", token);
            //lin(nameof(ResetPassword), "User", new { token, email = user.Email }, Request.Scheme);
            var _to = user.Email;
            //var _to = "rutviktejani2405@gmail.com";
            var _cc = "";
            var _body = "Please click to reset password : " + callback;
            var _subject = "Forgot Password";
            var attachment = "";
            var isMailSend = await _emailService.SendMail(new List<string>(_to.Split(';')), new List<string>(_cc.Split(';')), _body, _subject, new List<string>(), 0);

            if (!isMailSend)
            {
                res.IsSuccess = false;
                res.Message.Add("Something went wrong while send mail");
                return res;
            }
            res.IsSuccess = true;
            res.Message.Add("We have successfully initiated the password reset process for your account. A password reset link has been sent to your registered email address. Please check your inbox, including the spam folder, if you don't see the email in your main inbox.");
            return res;
        }

        /// <summary>
        /// This service is used for insert bulk data (Excel data) into various tables AspNetUsers,AspNetUserRoles,
        /// tblAddress,tblPersonalDetail
        /// </summary>
        /// <param name="bulkUserData"></param>
        /// <returns></returns>
        public async Task<ServiceResponse> AddBulkUsers(List<BulkUserData> bulkUserData)
        {
            var res = new ServiceResponse();
            res.IsSuccess = false;

            if (bulkUserData == null || bulkUserData.Count == 0)
            {
                res.Message.Add("User Data Can't be Empty");
                return res;
            }

            foreach (var user in bulkUserData)
            {
                using (var transaction = await _db.Database.BeginTransactionAsync())
                {
                    try
                    {
                        //Add Identity User
                        var iuser = new ApplicationUser()
                        {
                            UserName = user.Email,
                            Email = user.Email,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PhoneNumber = user.PhoneNumber,
                            UserType = user.UserType
                        };
                        var userRes = await _userManager.CreateAsync(iuser, GenerateRandomPassword());
                        if (userRes.Succeeded)
                        {

                            //throw new Exception(userRes.Errors.Select(x=>x.Description).ToString());
                            var tst = userRes.Errors.Select(x => x.Description).ToList();
                            res.Message.AddRange(tst);

                            //Add User data to tblAddress
                            var userAddress = new TblAddress()
                            {
                                UserId = iuser.UserId,
                                FirmName = user.FirmName,
                                Address1 = user.Address1,
                                Address2 = user.Address2,
                                District = user.District,
                                City = user.City,
                                PostalCode = user.PostalCode,
                                State = user.State,
                                EstablishedOn = user.EstablishedOn,
                                Lat = user.Lat,
                                Long = user.Long,
                                IsHome = user.isHome,
                                IsActive = user.IsActive,
                                IsDelete = user.IsDelete
                            };
                            _db.Add(userAddress);
                            await _db.SaveChangesAsync();

                            //Add User data to tblPersonalDetail
                            var userPersonalDetails = new TblPersonalDetail()
                            {
                                UserId = iuser.UserId,
                                BirthDate = user.BirthDate,
                                Anniversary = user.Anniversary,
                                Degrees = user.Degrees,
                                Services = user.Services,
                                IsActive = user.IsActive,
                                IsDelete = user.IsDelete
                            };

                            _db.Add(userPersonalDetails);
                            await _db.SaveChangesAsync();

                            await transaction.CommitAsync();
                        }
                        else
                        {
                            res.Message.AddRange(userRes.Errors.Select(x => x.Description).ToList());
                            await _db.Database.RollbackTransactionAsync();
                        }

                    }
                    catch (Exception ex)
                    {

                        await _db.Database.RollbackTransactionAsync();
                        await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                        {
                            Subject = Common.GetErrorSubject(),
                            Description = $"Data :: {JsonSerializer.Serialize(user)} ### Exception ### {ex.Message}",
                        });
                        res.Message.Add(ex.Message.ToString());
                    }
                }
            }

            if (res.Message.Count > 0)
            {
                res.IsSuccess = false;
            }
            else
            {
                res.IsSuccess = true;
                res.Message.Add("User Data inserted Success fully...");
            };

            return res;
        }

        //Random Password generator
        public string GenerateRandomPassword()
        {
            string capitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string smallLetters = "abcdefghijklmnopqrstuvwxyz";
            string digits = "0123456789";
            string specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

            Random random = new Random();

            // Generating at least one character from each category
            char capital = capitalLetters[random.Next(capitalLetters.Length)];
            char small = smallLetters[random.Next(smallLetters.Length)];
            char digit = digits[random.Next(digits.Length)];
            char special = specialChars[random.Next(specialChars.Length)];

            // Generating the remaining characters
            string allChars = $"{capitalLetters}{smallLetters}{digits}{specialChars}";
            string restOfPassword = new string(
                Enumerable.Repeat(allChars, 4)
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());

            // Combining all characters and shuffling the password
            string password = new string(new[] { capital, small, digit, special }.Concat(restOfPassword).OrderBy(c => random.Next()).ToArray());
            return password;
        }

        public async Task<ServiceResponse> AddSingleUser(SingleUserData singleUserData)
        {
            var res = new ServiceResponse();
            res.IsSuccess = false;
            if (singleUserData == null)
            {
                res.Message.Add("User Data Can't be Empty");
                return res;
            }

            using (var transaction = await _db.Database.BeginTransactionAsync())
            {
                try
                {
                    //Add Identity User
                    var iuser = new ApplicationUser()
                    {
                        UserName = singleUserData.Email,
                        Email = singleUserData.Email,
                        FirstName = singleUserData.FirstName,
                        LastName = singleUserData.LastName,
                        PhoneNumber = singleUserData.PhoneNumber,
                        UserType = singleUserData.UserType
                    };
                    var userRes = await _userManager.CreateAsync(iuser, GenerateRandomPassword());
                    if (userRes.Succeeded)
                    {

                        //throw new Exception(userRes.Errors.Select(x=>x.Description).ToString());
                        var tst = userRes.Errors.Select(x => x.Description).ToList();
                        res.Message.AddRange(tst);

                        //Add User data to tblAddress
                        var userAddress = new TblAddress()
                        {
                            UserId = iuser.UserId,
                            FirmName = singleUserData.FirmName,
                            Address1 = singleUserData.Address1,
                            Address2 = singleUserData.Address2,
                            District = singleUserData.District,
                            City = singleUserData.City,
                            PostalCode = singleUserData.PostalCode,
                            State = singleUserData.State,
                            EstablishedOn = singleUserData.EstablishedOn,
                            Lat = singleUserData.Lat,
                            Long = singleUserData.Long,
                            IsHome = singleUserData.isHome,
                            IsActive = singleUserData.IsActive,
                            IsDelete = singleUserData.IsDelete
                        };
                        _db.Add(userAddress);
                        await _db.SaveChangesAsync();

                        //Add User data to tblPersonalDetail
                        var userPersonalDetails = new TblPersonalDetail()
                        {
                            UserId = iuser.UserId,
                            BirthDate = singleUserData.BirthDate,
                            Anniversary = singleUserData.Anniversary,
                            Degrees = singleUserData.Degrees,
                            Services = singleUserData.Services,
                            IsActive = singleUserData.IsActive,
                            IsDelete = singleUserData.IsDelete
                        };

                        _db.Add(userPersonalDetails);
                        await _db.SaveChangesAsync();

                        await transaction.CommitAsync();
                    }
                    else
                    {
                        res.Message.AddRange(userRes.Errors.Select(x => x.Description).ToList());
                        await _db.Database.RollbackTransactionAsync();
                    }

                }
                catch (Exception ex)
                {

                    await _db.Database.RollbackTransactionAsync();
                    await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(singleUserData)} ### Exception ### {ex.Message}",
                    });
                    res.Message.Add(ex.Message.ToString());
                }
            }

            if (res.Message.Count > 0)
            {
                res.IsSuccess = false;
            }
            else
            {
                res.IsSuccess = true;
                res.Message.Add("User Data inserted Successfully...");
            };

            return res;
        }

        public async Task<ServiceResponse> UpdateUser(UpdateUserData updateUserData)
        {
            var res = new ServiceResponse();
            res.IsSuccess = false;
            if (updateUserData == null)
            {
                res.Message.Add("User Data Can't be Empty");
                return res;
            }

            using (var transaction = await _db.Database.BeginTransactionAsync())
            {
                try
                {
                    //ApplicationUser aspNetUserUpdate = await _db.AspNetUsers.FirstOrDefaultAsync(temp => temp.UserId == updateUserData.UserId);

                    //aspNetUserUpdate.Email = updateUserData.Email;
                    //aspNetUserUpdate.FirstName = updateUserData.FirstName;
                    //aspNetUserUpdate.LastName = updateUserData.LastName;
                    //aspNetUserUpdate.PhoneNumber = updateUserData.PhoneNumber;

                    TblAddress? userAddUpdate = await _db.TblAddress.Where(temp => temp.UserId == updateUserData!.UserId).FirstOrDefaultAsync();

                    if (userAddUpdate != null)
                    {
                        //Add User data to tblAddress
                        userAddUpdate.FirmName = updateUserData.FirmName;
                        userAddUpdate.Address1 = updateUserData.Address1;
                        userAddUpdate.Address2 = updateUserData.Address2;
                        userAddUpdate.FirmName = updateUserData.District;
                        userAddUpdate.City = updateUserData.City;
                        userAddUpdate.PostalCode = updateUserData.PostalCode;
                        userAddUpdate.State = updateUserData.State;
                        userAddUpdate.EstablishedOn = updateUserData.EstablishedOn;
                        userAddUpdate.Lat = updateUserData.Lat;
                        userAddUpdate.Long = updateUserData.Long;
                        userAddUpdate.IsHome = updateUserData.isHome;
                        userAddUpdate.IsActive = updateUserData.IsActive;
                    }

                    //Add User data to tblPersonalDetail
                    TblPersonalDetail? userPersonalUpdate = await _db.TblPersonalDetail.FirstOrDefaultAsync(temp => temp.UserId == updateUserData.UserId);

                    if (userPersonalUpdate != null)
                    {
                        userPersonalUpdate.BirthDate = updateUserData.BirthDate;
                        userPersonalUpdate.Anniversary = updateUserData.Anniversary;
                        userPersonalUpdate.Degrees = updateUserData.Degrees;
                        userPersonalUpdate.Services = updateUserData.Services;
                        userPersonalUpdate.IsActive = updateUserData.IsActive;
                    }


                    await _db.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception ex)
                {

                    await _db.Database.RollbackTransactionAsync();
                    await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(updateUserData)} ### Exception ### {ex.Message}",
                    });
                    res.Message.Add(ex.Message.ToString());
                }
            }

            if (res.Message.Count > 0)
            {
                res.IsSuccess = false;
            }
            else
            {
                res.IsSuccess = true;
                res.Message.Add("User Data Updated Successfully...");
            };

            return res;
        }

        public async Task<List<SearchDDLResponse>> FilterDoctorDataByText(string searchText)
        {
            var response = new List<SearchDDLResponse>();
            try
            {
                List<int> excludedUserTypes = new List<int> { (int)UserType.Admin, (int)UserType.Agent };

                response = (from usr in _db.Users
                            join addr in _db.TblAddress on usr.UserId equals addr.UserId
                            where usr.IsActive == true && usr.IsDelete == false
                            && addr.IsActive == true && addr.IsDelete == false
                            && !excludedUserTypes.Contains(usr.UserType) && (usr.FirstName.Contains(searchText) || usr.LastName.Contains(searchText)
                            || usr.PhoneNumber.Contains(searchText) || usr.Email.Contains(searchText)
                            || addr.FirmName.Contains(searchText))                            
                            orderby usr.CreatedOn descending
                            select new SearchDDLResponse
                            {
                                Id = usr.UserId,
                                Data = new
                                {
                                    FirstName = usr.FirstName,
                                    LastName = usr.LastName,
                                    FirmName = addr.FirmName,
                                    Address1 = addr.Address1,
                                    Address2 = addr.Address2,
                                    District = addr.District,
                                    City = addr.City,
                                    PostalCode = addr.PostalCode,
                                    State = addr.State
                                }
                            }).Take(10).ToList();

                return response;

            }
            catch (Exception ex)
            {
                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(searchText)} ### Exception ### {ex.Message}",
                });
                return response;
            }
        }

        public async Task<ApplicationUser> GetCurrentUser()
        {
            var currUser = new ApplicationUser();
            var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return currUser;
            }

            var userId = userIdClaim.Value;

            // Check if userId is null or empty
            if (string.IsNullOrEmpty(userId))
            {
                return currUser;
            }
            currUser = await _userManager.FindByIdAsync(userId);

            return currUser;
        }

    }
}
