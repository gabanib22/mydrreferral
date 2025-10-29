using Microsoft.EntityFrameworkCore;
using MyDrReferral.Data.Models;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MyDrReferral.Service.Services
{
    public class RefferService : IRefferService
    {
        private readonly MyDrReferralContext _db;
        private readonly IErrorLogService _errorLogService;
        private readonly IUserService _userService;

        public RefferService(MyDrReferralContext db, IErrorLogService errorLogService,IUserService userService)
        {
            _db = db;
            _errorLogService = errorLogService;
            _userService = userService;
        }

        public async Task<ServiceResponse> AddNewReffer(Reffer reffer)
        {
            var res = new ServiceResponse();
            try
            {                
                if (reffer == null)
                {
                    res.Message.Add("Invalid Data");
                    return res;
                }

                var patientData = new Patient()
                {
                    Name = reffer.PatientName,
                    RrlfById = (await _userService.GetCurrentUser()).UserId,
                    //RrlfById = 1234,
                    CreatedDate = DateTime.UtcNow

                };
                _db.Add(patientData);
                await _db.SaveChangesAsync();

                var refferData = new TblReffer()
                {
                    ConnectioionId=reffer.ConnectionId,
                    PatientId=patientData.Id,
                    Notes=reffer.Notes,
                    RflAmount=reffer.RflAmount,
                    RrlfDate = DateTime.UtcNow,
                    AcceptedDate = DateTime.UtcNow,                   
                    Status=(int)Common.ConnectionStatusType.Initiated
                };
                _db.Add(refferData);
                await _db.SaveChangesAsync();
                res.IsSuccess = true;
                res.Message.Add("Reffer added sucessfully");
            }

            catch (Exception ex)
            {
                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(reffer)} ### Exception ### {ex.Message}",
                });
                return res;
            }
            return res;
        }

        public async Task<ServiceResponse> UpdateRefferStatus(Reffer reffer)
        {
            var res = new ServiceResponse();
            try
            {

                if (reffer == null || reffer.Id<=0)
                {
                    res.Message.Add("Invalid Data");
                    return res;
                }
                //check is status valid
                if (!Enum.IsDefined(typeof(Common.ConnectionStatusType),reffer.Status))
                {
                    res.Message.Add("Invalid Status");
                    return res;
                }
                var existReffer =await  _db.TblReffer.Where(x => x.Id == reffer.Id && x.IsDeleted == false).FirstOrDefaultAsync();
                if (existReffer != null)
                {
                    // status not reverse from 2->1
                    if (reffer.Status < existReffer.Status)
                    {
                        res.Message.Add("Invalid Status");
                        return res;
                    }
                    if ((int)Common.ConnectionStatusType.InProgress == reffer.Status)
                    {
                        existReffer.IsAccepted = true;
                        existReffer.AcceptedDate = DateTime.UtcNow;
                    }
                    existReffer.Status = reffer.Status;
                    await _db.SaveChangesAsync();
                    res.IsSuccess = true;
                    res.Message.Add("Status Updated successfull");
                    return res;
                }
                else
                {
                    res.Message.Add("Selected Reffer not found");
                    return res;
                }
            }
            catch (Exception ex)
            {
                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(reffer)} ### Exception ### {ex.Message}",
                });
                return res;
            }
            }
        }
}
