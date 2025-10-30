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
using System.Text.Json;
using MyDrReferral.Service.Models;
using MyDrReferral.Service.Services;

namespace MyDrReferral.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Require authentication for all endpoints in this controller
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
                                 join patient in _db.Patient on reffer.PatientId equals patient.Id
                                 where connection.SenderId == currentUser.UserId
                                 select new
                                 {
                                     // Patient information
                                     PatientName = patient.Name,
                                     PatientId = patient.Id,
                                     PatientPhone = patient.Phone,
                                     PatientEmail = patient.Email,
                                     PatientAddress = patient.Address,
                                     
                                     // Receiving doctor information
                                     DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                     DoctorEmail = user.Email,
                                     DoctorPhone = user.PhoneNumber,
                                     
                                     // Referral information
                                     Amount = reffer.RflAmount,
                                     Notes = reffer.Notes,
                                     Status = reffer.IsPaid ? "Paid" :
                                             reffer.PaymentDate.HasValue ? "Payment Pending" :
                                             reffer.PatientVisitedDate.HasValue ? "Patient Visited" :
                                             reffer.IsAccepted ? "Received" :
                                             reffer.IsDeleted ? "Rejected" : "Sent",
                                     CreatedDate = reffer.RrlfDate,
                                     AcceptedDate = reffer.AcceptedDate,
                                     PatientVisitedDate = reffer.PatientVisitedDate,
                                     PaymentDate = reffer.PaymentDate
                                 }).ToListAsync(cancellationToken);

            responseModel.IsSuccess = true;
            responseModel.Data = sentReferrals.Result;
            responseModel.Message.Add("Sent referrals retrieved successfully");
            return Ok(responseModel);
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
            Console.WriteLine($"Current user ID: {currentUser.UserId}");

            // Debug: Check if there are any connections for this user
            var userConnections = await _db.TblConnections
                .Where(c => c.ReceiverId == currentUser.UserId)
                .ToListAsync();
            Console.WriteLine($"Found {userConnections.Count} connections for user {currentUser.UserId}");

            // Debug: Check if there are any referrals
            var allReferrals = await _db.TblReffer.ToListAsync();
            Console.WriteLine($"Found {allReferrals.Count} total referrals in database");

            // Debug: Check if there are any patients
            var allPatients = await _db.Patient.ToListAsync();
            Console.WriteLine($"Found {allPatients.Count} total patients in database");

            var receivedReferrals = (from user in _db.Users
                                 join connection in _db.TblConnections on user.UserId equals connection.SenderId
                                 join reffer in _db.TblReffer on connection.Id equals reffer.ConnectioionId
                                 join patient in _db.Patient on reffer.PatientId equals patient.Id
                                 where connection.ReceiverId == currentUser.UserId
                                 select new
                                 {
                                     // Patient information
                                     PatientName = patient.Name,
                                     PatientId = patient.Id,
                                     PatientPhone = patient.Phone,
                                     PatientEmail = patient.Email,
                                     PatientAddress = patient.Address,
                                     
                                     // Referring doctor information
                                     DoctorName = string.Concat(user.FirstName, " ", user.LastName),
                                     DoctorEmail = user.Email,
                                     DoctorPhone = user.PhoneNumber,
                                     
                                     // Referral information
                                     Amount = reffer.RflAmount,
                                     Notes = reffer.Notes,
                                     Status = reffer.IsPaid ? "Paid" :
                                             reffer.PaymentDate.HasValue ? "Payment Pending" :
                                             reffer.PatientVisitedDate.HasValue ? "Patient Visited" :
                                             reffer.IsAccepted ? "Received" :
                                             reffer.IsDeleted ? "Rejected" : "Sent",
                                     CreatedDate = reffer.RrlfDate,
                                     AcceptedDate = reffer.AcceptedDate,
                                     PatientVisitedDate = reffer.PatientVisitedDate,
                                     PaymentDate = reffer.PaymentDate
                                 }).ToListAsync(cancellationToken);

            Console.WriteLine($"Found {receivedReferrals.Result.Count} received referrals for user {currentUser.UserId}");
            
            // Debug: Log the actual data being returned
            if (receivedReferrals.Result.Count > 0)
            {
                Console.WriteLine("Sample referral data:");
                var sample = receivedReferrals.Result.First();
                Console.WriteLine($"PatientName: {sample.PatientName}");
                Console.WriteLine($"DoctorName: {sample.DoctorName}");
                Console.WriteLine($"Amount: {sample.Amount}");
                Console.WriteLine($"Status: {sample.Status}");
            }
            else
            {
                Console.WriteLine("No referrals found - this could be because:");
                Console.WriteLine("1. No connections exist for this user");
                Console.WriteLine("2. No referrals exist in the database");
                Console.WriteLine("3. No patients exist in the database");
                Console.WriteLine("4. The relationships between tables are not set up correctly");
            }
            
            responseModel.IsSuccess = true;
            responseModel.Data = receivedReferrals.Result;
            responseModel.Message.Add("Received referrals retrieved successfully");
            return Ok(responseModel);
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

    [HttpPut("updateStatus")]
    public async Task<IActionResult> UpdateReferralStatus([FromBody] UpdateReferralStatusRequest request)
    {
        try
        {
            Console.WriteLine($"UpdateReferralStatus called");
            Console.WriteLine($"Request object: {JsonSerializer.Serialize(request)}");
            Console.WriteLine($"ReferralId: '{request.ReferralId}', Status: '{request.Status}'");
            Console.WriteLine($"ReferralId is null or empty: {string.IsNullOrEmpty(request.ReferralId)}");
            Console.WriteLine($"Status is null or empty: {string.IsNullOrEmpty(request.Status)}");
            
            // Check if the request is valid
            if (string.IsNullOrEmpty(request.ReferralId) || string.IsNullOrEmpty(request.Status))
            {
                Console.WriteLine("Request validation failed - missing required fields");
                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "ReferralId and Status are required" }
                });
            }
            
            var referral = await _db.TblReffer
                .FirstOrDefaultAsync(r => r.Id.ToString() == request.ReferralId);

            Console.WriteLine($"Found referral: {referral != null}");
            if (referral != null)
            {
                Console.WriteLine($"Referral ID: {referral.Id}, Current status: IsAccepted={referral.IsAccepted}, IsDeleted={referral.IsDeleted}");
            }

            if (referral == null)
            {
                Console.WriteLine("Referral not found in database");
                return NotFound(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "Referral not found" }
                });
            }

            // Update status based on the new status
            Console.WriteLine($"Processing status update: {request.Status.ToLower()}");
            switch (request.Status.ToLower())
            {
                case "patient_visited":
                    Console.WriteLine("Setting PatientVisitedDate to current time");
                    referral.PatientVisitedDate = DateTime.UtcNow;
                    break;
                case "payment_pending":
                    Console.WriteLine("Payment pending - no changes needed");
                    // Patient visited date should already be set
                    break;
                case "paid":
                    Console.WriteLine("Setting PaymentDate and IsPaid");
                    referral.PaymentDate = DateTime.UtcNow;
                    referral.IsPaid = true;
                    break;
                case "rejected":
                    Console.WriteLine("Setting IsDeleted to true");
                    referral.IsDeleted = true;
                    break;
                default:
                    Console.WriteLine($"Unknown status: {request.Status.ToLower()}");
                    break;
            }

            await _db.SaveChangesAsync();

            return Ok(new ResponseModel
            {
                IsSuccess = true,
                Message = new List<string> { "Referral status updated successfully" }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ResponseModel
            {
                IsSuccess = false,
                Message = new List<string> { ex.Message }
            });
        }
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        Console.WriteLine("Test endpoint called");
        return Ok(new { message = "Test endpoint working", timestamp = DateTime.UtcNow });
    }

    [HttpPut("updateStatusSimple")]
    public async Task<IActionResult> UpdateReferralStatusSimple([FromBody] JsonElement request)
    {
        try
        {
            Console.WriteLine($"UpdateReferralStatusSimple called");
            Console.WriteLine($"Request: {JsonSerializer.Serialize(request)}");
            
            // Extract values from JsonElement
            string referralId = "";
            string status = "";
            
            if (request.TryGetProperty("referral_id", out var referralIdElement))
            {
                Console.WriteLine($"referral_id element type: {referralIdElement.ValueKind}");
                if (referralIdElement.ValueKind == JsonValueKind.String)
                {
                    referralId = referralIdElement.GetString() ?? "";
                }
                else if (referralIdElement.ValueKind == JsonValueKind.Number)
                {
                    referralId = referralIdElement.GetInt32().ToString();
                }
            }
            else if (request.TryGetProperty("ReferralId", out var referralIdElement2))
            {
                if (referralIdElement2.ValueKind == JsonValueKind.String)
                {
                    referralId = referralIdElement2.GetString() ?? "";
                }
                else if (referralIdElement2.ValueKind == JsonValueKind.Number)
                {
                    referralId = referralIdElement2.GetInt32().ToString();
                }
            }
            
            if (request.TryGetProperty("status", out var statusElement))
            {
                status = statusElement.GetString() ?? "";
            }
            else if (request.TryGetProperty("Status", out var statusElement2))
            {
                status = statusElement2.GetString() ?? "";
            }
            
            Console.WriteLine($"Extracted - ReferralId: '{referralId}', Status: '{status}'");
            
            if (string.IsNullOrEmpty(referralId) || string.IsNullOrEmpty(status))
            {
                return BadRequest(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "ReferralId and Status are required" }
                });
            }
            
            var referral = await _db.TblReffer
                .FirstOrDefaultAsync(r => r.Id.ToString() == referralId);

            if (referral == null)
            {
                return NotFound(new ResponseModel
                {
                    IsSuccess = false,
                    Message = new List<string> { "Referral not found" }
                });
            }

            // Update status based on the new status
            switch (status.ToLower())
            {
                case "patient_visited":
                    referral.PatientVisitedDate = DateTime.UtcNow;
                    break;
                case "payment_pending":
                    break;
                case "paid":
                    referral.PaymentDate = DateTime.UtcNow;
                    referral.IsPaid = true;
                    break;
                case "rejected":
                    referral.IsDeleted = true;
                    break;
            }

            await _db.SaveChangesAsync();

            return Ok(new ResponseModel
            {
                IsSuccess = true,
                Message = new List<string> { "Referral status updated successfully" }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in UpdateReferralStatusSimple: {ex.Message}");
            return BadRequest(new ResponseModel
            {
                IsSuccess = false,
                Message = new List<string> { ex.Message }
            });
        }
    }
}
