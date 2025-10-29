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
using MyDrReferral.Service.Services;
using System.Data;
using System.Security.Claims;
using System.Text.Json;
using System.Threading;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace MyDrReferral.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Require authentication for all endpoints in this controller
public class ConnectionController : Controller
{
    private readonly IUserService _userService;
    private readonly IConnectionService _connectionService;
    private readonly IMapper _mapper;
    private readonly MyDrReferralContext _db;
    private readonly IMediator _mediator;

    public ConnectionController(IUserService userService, IMapper mapper, IMediator mediator, MyDrReferralContext db, IConnectionService connectionService)
    {
        _userService = userService;
        _mapper = mapper;
        _mediator = mediator;
        _db = db;
        _connectionService = connectionService;
    }


    #region Connection

    [HttpPost("test")]
    public IActionResult Test()
    {
        Console.WriteLine("=== TEST ENDPOINT HIT ===");
        return Ok("Test endpoint working");
    }

    [Authorize]
    [HttpPost("connection-request")]
    public async Task<IActionResult> ConnectionRequest([FromBody] ConnectionModel connection)
    {
        Console.WriteLine("=== CONNECTION REQUEST ENDPOINT HIT ===");
        Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");
        Console.WriteLine($"ModelState errors: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");

        var responseModel = new ResponseModel();
        try
        {
            Console.WriteLine($"Received connection request: ReceiverId={connection?.ReceiverId}, Notes={connection?.Notes}");

            if (connection == null)
            {
                Console.WriteLine("Connection model is null");
                responseModel.Message.Add("Invalid request data");
                return BadRequest(responseModel);
            }

            if (!ModelState.IsValid)
            {
                Console.WriteLine("Model validation failed");
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                responseModel.Message.AddRange(errors);
                return BadRequest(responseModel);
            }

            if (connection.ReceiverId <= 0)
            {
                Console.WriteLine("Invalid Receiver ID");
                responseModel.Message.Add("Invalid Receiver");
                return BadRequest(responseModel);
            }

            // Get current user ID from JWT token
            var currentUserId = User.FindFirst("nameid")?.Value ??
                              User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                              User.FindFirst("userId")?.Value;

            var currentUserIdInt = await _db.Users.Where(x => x.Id == currentUserId)
                .Select(x => x.UserId.ToString())
                .FirstOrDefaultAsync();

            Console.WriteLine($"Current user ID from token: {currentUserIdInt}");

            if (string.IsNullOrEmpty(currentUserIdInt))
            {
                Console.WriteLine("User not authenticated - no user ID found");
                responseModel.Message.Add("User not authenticated");
                return Unauthorized(responseModel);
            }

            // Set the sender ID to current user
            connection.SenderId = int.Parse(currentUserIdInt);
            connection.CreatedBy = int.Parse(currentUserIdInt);
            connection.CreatedDate = DateTime.UtcNow.ToUniversalTime();
            connection.IsAccepted = false;
            connection.IsRejected = false;
            connection.IsDeleted = false;

            var model = _mapper.Map<Service.Models.Connection>(connection);
            responseModel = _mapper.Map<ResponseModel>(await _mediator.Send(new ConnectionRequest { Connection = model }));
            return Ok(responseModel);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ CONNECTION REQUEST EXCEPTION:");
            Console.WriteLine($"Exception Type: {ex.GetType().Name}");
            Console.WriteLine($"Exception Message: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
            Console.WriteLine($"Inner Exception Type: {ex.InnerException?.GetType().Name}");
            Console.WriteLine($"Inner Stack Trace: {ex.InnerException?.StackTrace}");

            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(connection)} ### Exception ### {ex.Message} ### Inner Exception ### {ex.InnerException?.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add($"Exception: {ex.Message}");
            if (ex.InnerException != null)
            {
                responseModel.Message.Add($"Inner Exception: {ex.InnerException.Message}");
            }
            return BadRequest(responseModel);
        }
    }

    /// <summary>
    /// This method is used to Get All Accepted or Rejected request sent by us
    /// </summary>
    /// <param name="isBlocked"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [Authorize]
    [HttpGet("getMyConnections")]
    public async Task<IActionResult> GetMyConnections(bool isBlocked, CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var connections = await (from user in _db.Users
                                         //join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                     join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                                     where connection.IsRejected == isBlocked && connection.SenderId == currentUser.UserId
                                     && connection.IsAccepted == true
                                     select new
                                     {
                                         mobile = user.PhoneNumber,
                                         email = user.Email,
                                         doctor_name = string.Concat(user.FirstName, " ", user.LastName),
                                         //TotalEarning = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.Completed)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         //TotalPendings = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.PendingPayment)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         total_earning = 0,
                                         total_pendings = 0,
                                         referral_amount = user.ReferralAmount ?? 0,
                                         //25-02-2024 Added By Rutvik Tejani
                                         Id = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate
                                     }).ToListAsync(cancellationToken);

            responseModel.IsSuccess = true;
            responseModel.Data = connections;
            responseModel.Message.Add("Connections retrieved successfully");
            return Ok(responseModel);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(isBlocked)} ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    /// <summary>
    /// This method is used to Get All Accepted AND Rejected (both) request sent by us
    /// </summary>
    /// <param name="isBlocked"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [Authorize]
    [HttpGet("getMyAllConnections")]
    public async Task<IActionResult> GetMyAllConnections(CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var connections = await (from user in _db.Users
                                         //join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                     join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                                     where connection.SenderId == currentUser.UserId
                                     select new
                                     {
                                         mobile = user.PhoneNumber,
                                         email = user.Email,
                                         doctor_name = string.Concat(user.FirstName, " ", user.LastName),
                                         //TotalEarning = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.Completed)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         //TotalPendings = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.PendingPayment)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         total_earning = 0,
                                         total_pendings = 0,
                                         referral_amount = user.ReferralAmount ?? 0,
                                         //25-02-2024 Added By Rutvik Tejani
                                         Id = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate
                                     }).ToListAsync(cancellationToken);

            responseModel.IsSuccess = true;
            responseModel.Data = connections;
            responseModel.Message.Add("Connections retrieved successfully");
            return Ok(responseModel);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data ::  ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    /// <summary>
    /// This method is used to Get All Accepted or Rejected request recieved to us
    /// </summary>
    /// <param name="isBlocked"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [Authorize]
    [HttpGet("getConnectionRequests")]
    public async Task<IActionResult> GetConnectionRequests(bool isBlocked, CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var connections = await (from user in _db.Users
                                         //join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                                     join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                     where connection.IsRejected == isBlocked && connection.ReceiverId == currentUser.UserId
                                     select new
                                     {
                                         mobile = user.PhoneNumber,
                                         email = user.Email,
                                         doctor_name = string.Concat(user.FirstName, " ", user.LastName),
                                         Id = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate,
                                         LastUpdateDate = connection.LastUpdateDate
                                     }).ToListAsync(cancellationToken);

            responseModel.IsSuccess = true;
            responseModel.Data = connections;
            responseModel.Message.Add("Connections retrieved successfully");
            return Ok(responseModel);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(isBlocked)} ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    /// <summary>
    /// This method is used to Get All Accepted AND Rejected (Both) request recieved to us
    /// </summary>
    /// <param name="isBlocked"></param>
    /// <param name="cancellationToken"></param>
    [Authorize]
    [HttpGet("getAllConnectionRequests")]
    public async Task<IActionResult> GetAllConnectionRequests(CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var connections = await (from user in _db.Users
                                         //join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                                     join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                     where connection.ReceiverId == currentUser.UserId
                                     select new
                                     {
                                         mobile = user.PhoneNumber,
                                         email = user.Email,
                                         doctor_name = string.Concat(user.FirstName, " ", user.LastName),
                                         Id = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate
                                     }).ToListAsync(cancellationToken);

            responseModel.IsSuccess = true;
            responseModel.Data = connections;
            responseModel.Message.Add("Connections retrieved successfully");
            return Ok(responseModel);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $" ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    [Authorize]
    [HttpPost("connectionResponse")]
    public async Task<IActionResult> ConnectionResponse(ConnectionResponseModel connection)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var con = _mapper.Map<ConnectionRequestResponse>(connection);
                var res = await _connectionService.ConnectionRequestResponse(con);
                return Ok(res);
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
                    Description = $"Data :: {JsonSerializer.Serialize(connection)} ### Exception ### {ex.Message}",
                }
            });

            var responseModel = new ResponseModel();

            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    [Authorize]
    [HttpPost("unblockConnection")]
    public async Task<IActionResult> UnblockConnection(int connectionId)
    {
        try
        {
            var res = await _connectionService.Unblock_Accept_Connection(connectionId);
            return Ok(res);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(connectionId)} ### Exception ### {ex.Message}",
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
