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
using System.Text.Json;


namespace MyDrReferral.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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

        [HttpPost("register")]
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

                    //var result = await _userService.AddEditUser(user, model.Password);

                    var result = await _mediator.Send(new RegistrationRequest { User = user, Password = model.Password });

                    if (result.Succeeded)
                    {
                        return Ok(new ResponseModel { IsSuccess = true });
                    }
                    else
                    {
                        return BadRequest(new ResponseModel { IsSuccess = false, Message = result.Errors.Select(x => x.Description).ToList() });
                    }
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                //await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                // Add a message to the Message list
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }
        }


        #region User Login
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginRequest model)
        {
            try
            {
                //int x = 10;
                //int y = 0;
                //int result = x / y;

                var logindata = _mapper.Map<LoginModel>(model);
                //var token = await _userService.Login(logindata);
                var token = await _mediator.Send(new LoginRequest { LoginModel = logindata });
                if (token == null)
                {
                    return Unauthorized(new ResponseModel
                    {
                        IsSuccess = false,
                        Message = new List<string> { "Invalid Username or Password" }
                    });
                }
                return Ok(new { AccessToken = token });
            }
            catch (Exception ex)
            {
                //await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                //{
                //    Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                //});

                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });



                var responseModel = new ResponseModel
                {
                    IsSuccess = false,
                };

                // Add a message to the Message list
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }
        }
        #endregion


        #region Logout User

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            _userService.Logout();
            return Ok();
        }
        #endregion


        #region Change Password
        /// <summary>
        /// Created By : Rutvik Tejani
        /// Created On : 24-10-2023
        /// Desc       : Used For Change Password of Valid User
        /// </summary>
        /// <returns></returns>        
        [HttpPost("changepassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(UserChangePasswordRequest model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var data = _mapper.Map<ChangePassword>(model);

                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ChangePasswordRequest { ChangePassword = data }));


                    //response = _mapper.Map<ResponseModel>(response);
                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                // Add a message to the Message list
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }
        }
        #endregion


        #region Reset Password
        /// <summary>
        /// Created On : 31-10-2023
        /// Created By : Rutvik Tejani
        /// Desc       : Reset Password is Used for reset password to valid user with valid token and token
        /// time is limited for 30minutes only
        /// </summary>
        /// <param name="token">Comes from User's email</param>
        /// <param name="email"></param>
        /// <returns></returns>

        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(UserResetPasswordRequest model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }


                var resetPwdData = _mapper.Map<ResetPassword>(model);

                var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ResetPasswordRequest { ResetPassword = resetPwdData }));

                return Ok(response);



            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }
        }
        #endregion


        #region Forgot Password          
        [HttpPost("forgotpassword")]
        public async Task<IActionResult> ForgotPassword(UserForgotPasswordRequest model)
        {
            try
            {

                if (!ModelState.IsValid)
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }

                var forgotPwdData = _mapper.Map<ForgotPassword>(model);
                var Token = "TOKEN";
                var callback = Url.Action(nameof(ResetPassword), "User", new { Token, email = model.Email }, Request.Scheme);
                var response = _mapper.Map<ResponseModel>(await _mediator.Send(new ForgotPasswordRequest { ForgotPassword = forgotPwdData, CallbackUrl = callback }));

                return Ok(response);

            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);

            }
        }
        #endregion


        #region User CRUD
        //[Authorize]
        [HttpPost("bulkusers")]
        public async Task<IActionResult> BulkUsersData(List<BulkUserDataRequestModel> model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var data = _mapper.Map<List<BulkUserData>>(model);

                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new BulkUserDataRequest { BulkUserData = data }));

                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }


        [HttpPost("singleuser")]
        public async Task<IActionResult> SingleUsersData(SingleUserDataRequestModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var data = _mapper.Map<SingleUserData>(model);

                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new SingleUserDataRequest { SingleUserData = data }));

                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }


        [HttpPut("updateuser")]
        public async Task<IActionResult> UpdateUser(UpdateUserRequestModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    var data = _mapper.Map<UpdateUserData>(model);

                    var response = _mapper.Map<ResponseModel>(await _mediator.Send(new UpdateUserDataRequest { UpdateUserData = data }));

                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = ModelState.Values.SelectMany(v => v.Errors).Select(err => err.ErrorMessage).ToList();
                    return BadRequest(res);
                }
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(model)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }

        [HttpGet("getUserByID/{userId}")]
        public async Task<IActionResult> getUserByID(int userId, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _db.TblPersonalDetail
                    .Where(x => x.IsActive == true && x.IsDelete == false && x.UserId == userId)
                    .Select(x => new GetUserDataResponseModel
                    {
                        UserId = x.UserId,
                        Anniversary = x.Anniversary,
                        BirthDate = x.BirthDate,
                        Degrees = x.Degrees,
                        Services = x.Services,
                        PhotoUrl = x.PhotoUrl
                    })
                    .FirstOrDefaultAsync(cancellationToken);
                if (response != null)
                {
                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = new List<string> { "User not found! " };
                    return BadRequest(res);
                }

            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(userId)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }

        [HttpGet("getUserListByCreatedUser/{userId}")]
        // For agents
        public async Task<IActionResult> getUserListByCreatedUser(int userId, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _db.TblPersonalDetail
                    .Where(x => x.IsActive == true && x.IsDelete == false && (x.CreatedBy == userId))
                    .Select(x => new GetUserDataListByCreatedUserResponseModel
                    {
                        UserId = x.UserId,
                        Anniversary = x.Anniversary,
                        BirthDate = x.BirthDate,
                        Degrees = x.Degrees,
                        Services = x.Services,
                        PhotoUrl = x.PhotoUrl
                    })
                    .ToListAsync(cancellationToken);
                if (response != null)
                {
                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = new List<string> { "User not found! " };
                    return BadRequest(res);
                }

            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(userId)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }

        [HttpGet("getUserListForAdmin/{userId}")]
        public async Task<IActionResult> getUserListForAdmin(CancellationToken cancellationToken)
        {
            try
            {
                var response = await _db.TblPersonalDetail
                    .Where(x => x.IsActive == true && x.IsDelete == false)
                    .Select(x => new GetUserDataListForAdminResponseModel
                    {
                        UserId = x.UserId,
                        Anniversary = x.Anniversary,
                        BirthDate = x.BirthDate,
                        Degrees = x.Degrees,
                        Services = x.Services,
                        PhotoUrl = x.PhotoUrl
                    })
                    .ToListAsync(cancellationToken);
                if (response != null)
                {
                    return Ok(response);
                }
                else
                {
                    var res = new ResponseModel();
                    res.IsSuccess = false;
                    res.Message = new List<string> { "User not found! " };
                    return BadRequest(res);
                }

            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: Admin ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }

        [HttpDelete("deleteUserById/{userId}")]
        public async Task<IActionResult> deleteUserById(int userId, CancellationToken cancellationToken)
        {
            try
            {
                var res = new ResponseModel();
                res.IsSuccess = false;
                var personalDetail = _db.TblPersonalDetail
                    .Where(x => x.UserId == userId && x.IsActive == true && x.IsDelete == false)
                    .FirstOrDefault();

                if (personalDetail != null)
                {
                    personalDetail.IsActive = false;
                    personalDetail.IsDelete = true;
                    await _db.SaveChangesAsync(cancellationToken);
                    res.IsSuccess = true;
                    res.Message = new List<string> { "Successfully deleted User!" };
                    return Ok(res);
                }
                else
                {
                    res.Message = new List<string> { "User not found for deletion! " };
                    return BadRequest(res);
                }

            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(userId)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }
        #endregion

        #region FilterDoctor Data By Text

        [HttpGet("filterDoctorDataByText/{searchText}")]
        public async Task<IActionResult> FilterDoctorDataByText(string searchText, CancellationToken cancellationToken)
        {
            try
            {                
                return Ok(await _mediator.Send(new FilterDoctorDataRequest() { SearchText = searchText }));
            }
            catch (Exception ex)
            {
                await _mediator.Send(new ErrorRequest
                {
                    ErrorLogModel = new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: {JsonSerializer.Serialize(searchText)} ### Exception ### {ex.Message}",
                    }
                });

                var responseModel = new ResponseModel();

                responseModel.IsSuccess = false;
                responseModel.Message.Add(ex.Message);
                return BadRequest(responseModel);
            }

        }
        #endregion

    }
}
