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
using System.Text.Json;
using System.Threading;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace MyDrReferral.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
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
    [Authorize]
    [HttpPost("connectionRequest")]
    public async Task<IActionResult> ConnectionRequest(ConnectionModel connection)
    {
        var responseModel = new ResponseModel();
        try
        {
            if (connection.ReceiverId <= 0)
            {
                responseModel.Message.Add("Invalid Receiver");
                return BadRequest(responseModel);
            }
            var model = _mapper.Map<Service.Models.Connection>(connection);
            //responseModel = _mapper.Map<ResponseModel>(await _mediator.Send(new ConnectionRequest { receiverId = receiverId }));
            responseModel = _mapper.Map<ResponseModel>(await _mediator.Send(new ConnectionRequest { Connection = model }));
            return Ok(responseModel);
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
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
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

            var connections =await (from user in _db.Users
                               //join connection in _db.TblConnections on user.UserId equals connection.SenderId
                               join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                               where connection.IsRejected == isBlocked && connection.SenderId == currentUser.UserId
                               select new
                               {
                                   Mobile = user.PhoneNumber,
                                   user.Email,
                                   DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                   //TotalEarning = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.Completed)
                                   //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                   //TotalPendings = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.PendingPayment)
                                   //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                   TotalEarning=0,
                                   TotalPendings=0,
                                   //25-02-2024 Added By Rutvik Tejani
                                   ConnectioionId=connection.Id,
                                   Status= (connection.IsRejected==false && connection.IsAccepted==false?"Pending": (connection.IsAccepted ==true?"Approve":"Blocked")),
                                   RequestDate=connection.CreatedDate
                               }).ToListAsync(cancellationToken);

            return Ok(connections);
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
                                         Mobile = user.PhoneNumber,
                                         user.Email,
                                         DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                         //TotalEarning = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.Completed)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         //TotalPendings = _db.TblReffer.Where(x => x.ConnectioionId == connection.Id && x.Status == (int)Common.ConnectionStatusType.PendingPayment)
                                         //                 .SumAsync(x => x.RflAmount, cancellationToken),
                                         TotalEarning = 0,
                                         TotalPendings = 0,
                                         //25-02-2024 Added By Rutvik Tejani
                                         ConnectioionId = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate
                                     }).ToListAsync(cancellationToken);

            return Ok(connections);
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
                                   Mobile = user.PhoneNumber,
                                   user.Email,
                                   DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                   ConnectioionId = connection.Id,
                                   Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                   RequestDate = connection.CreatedDate,
                                   LastUpdateDate=connection.LastUpdateDate
                               }).ToListAsync(cancellationToken);

            return Ok(connections);
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
                                     where  connection.ReceiverId == currentUser.UserId
                                     select new
                                     {
                                         Mobile = user.PhoneNumber,
                                         user.Email,
                                         DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                         ConnectioionId = connection.Id,
                                         Status = (connection.IsRejected == false && connection.IsAccepted == false ? "Pending" : (connection.IsAccepted == true ? "Approve" : "Blocked")),
                                         RequestDate = connection.CreatedDate
                                     }).ToListAsync(cancellationToken);

            return Ok(connections);
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
                var con=_mapper.Map<ConnectionRequestResponse>(connection);
                var res=await _connectionService.ConnectionRequestResponse(con);
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
