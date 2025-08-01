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
using System.Text.Json;

namespace MyDrReferral.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RefferController : Controller
{
    private readonly IUserService _userService;
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;
    private readonly MyDrReferralContext _db;
    private readonly IRefferService _refferService;
    public RefferController(MyDrReferralContext db, IUserService userService, IMediator mediator, IRefferService refferService, IMapper mapper)
    {
        _db = db;
        _userService = userService;
        _mediator = mediator;
        _refferService = refferService;
        _mapper = mapper;
    }

    [Authorize]
    [HttpGet("getSentReferrals")]
    public async Task<IActionResult> GetSentReferrals(CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var sentReferrals = (from user in _db.Users
                                 join connection in _db.TblConnections on user.UserId equals connection.ReceiverId
                                 join reffer in _db.TblReffer on connection.Id equals reffer.ConnectioionId
                                 where connection.SenderId == currentUser.UserId
                                 select new
                                 {
                                     Mobile = user.PhoneNumber,
                                     user.Email,
                                     DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                     Amount = reffer.RflAmount,
                                     reffer.Notes
                                 }).ToListAsync(cancellationToken);

            return Ok(sentReferrals.Result);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize("GetSentReferrals")} ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    [Authorize]
    [HttpGet("getReceivedReferrals")]
    public async Task<IActionResult> GetReceivedReferrals(CancellationToken cancellationToken)
    {
        var responseModel = new ResponseModel();
        try
        {
            var currentUser = await _userService.GetCurrentUser();

            var receivedReferrals = (from user in _db.Users
                                 join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                 join reffer in _db.TblReffer on connection.Id equals reffer.ConnectioionId
                                 where connection.ReceiverId == currentUser.UserId
                                 select new
                                 {
                                     Mobile = user.PhoneNumber,
                                     user.Email,
                                     DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                     Amount = reffer.RflAmount,
                                     reffer.Notes
                                 }).ToListAsync(cancellationToken);

            return Ok(receivedReferrals.Result);
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize("GetReceivedReferrals")} ### Exception ### {ex.Message}",
                }
            });
            responseModel.IsSuccess = false;
            responseModel.Message.Add(ex.Message);
            return BadRequest(responseModel);
        }
    }

    [Authorize]
    [HttpPost("addNewReffer")]
    public async Task<IActionResult> AddNewReferral(RefferModel reffer)
    {
        var res = new ResponseModel();
        try
        {
            if (ModelState.IsValid)
            {                
                var refRes = await _refferService.AddNewReffer(_mapper.Map<Reffer>(reffer));

                return Ok(_mapper.Map<ResponseModel>(refRes));
            }
            else
            {
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
                    Description = $"Data :: {JsonSerializer.Serialize("GetSentReferrals")} ### Exception ### {ex.Message}",
                }
            });
            res.IsSuccess = false;
            res.Message.Add(ex.Message);
            return BadRequest(res);
        }
    }

    [Authorize]
    [HttpPost("updateRefferStatus")]
    public async Task<IActionResult> UpdateRefferStatus(UpdateRefferStatusModel reffer)
    {
        var res = new ResponseModel();
        try
        {
            var refdata=_mapper.Map<Reffer>(reffer);

            return Ok(await _refferService.UpdateRefferStatus(refdata));
        }
        catch (Exception ex)
        {
            await _mediator.Send(new ErrorRequest
            {
                ErrorLogModel = new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(reffer)} ### Exception ### {ex.Message}",
                }
            });
            res.IsSuccess = false;
            res.Message.Add(ex.Message);
            return BadRequest(res);
        }
    }
    }
