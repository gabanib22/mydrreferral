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
    public class ConnectionService : IConnectionService
    {
        private readonly MyDrReferralContext _db;
        private readonly IErrorLogService _errorLogService;
        private readonly IUserService _userService;

        public ConnectionService(MyDrReferralContext db, IErrorLogService errorLogService, IUserService userService)
        {
            _db = db;
            _errorLogService = errorLogService;
            _userService = userService;
        }


        public async Task<ServiceResponse> ConnectionRequest(Connection connection)
        {
            var res = new ServiceResponse();
            try
            {
                if (connection.ReceiverId <= 0)
                {
                    res.Message.Add("Invalid Receiver");
                    return res;
                }
                var curreUser = await _userService.GetCurrentUser();
                if (curreUser == null || curreUser.UserId <= 0)
                {
                    res.Message.Add("Invalid Sender");
                    return res;
                }

                if (await _db.TblConnections
                    .AnyAsync(x => x.SenderId == curreUser.UserId && x.ReceiverId == connection.ReceiverId && x.IsDeleted == false))
                {
                    res.Message.Add("Connection Request already sent to selected user");
                    return res;
                }

                //Insert Record to tblConnection
                var conn = new TblConnection()
                {
                    SenderId = curreUser.UserId,
                    ReceiverId = connection.ReceiverId,
                    Notes = connection.Notes,
                    CreatedBy = curreUser.UserId,
                    CreatedDate = DateTime.Now,
                    LastUpdateDate = DateTime.Now
                };

                _db.Add(conn);
                await _db.SaveChangesAsync();
                res.IsSuccess = true;
                res.Message.Add("Connection Request is send successfully");

            }
            catch (Exception ex)
            {
                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(connection)} ### Exception ### {ex.Message}",
                });
                res.Message.Add(ex.Message.ToString());
            }
            return res;
        }

        public async Task<ServiceResponse> ConnectionRequestResponse(ConnectionRequestResponse connectionRequest)
        {
            var res = new ServiceResponse();
            try
            {
                var currusr = await _userService.GetCurrentUser();
                if (currusr == null || currusr.UserId <= 0)
                {
                    res.Message.Add("Invalid Sender");
                    return res;
                }

                TblConnection? connection = await _db.TblConnections.Where(x => x.Id == connectionRequest.ConnectionId && x.IsDeleted == false && x.ReceiverId == currusr.UserId).FirstOrDefaultAsync();

                if (connection != null)
                {
                    connection.IsAccepted = connectionRequest.IsAccepted;
                    connection.IsRejected = connectionRequest.IsAccepted ? false : true;
                    connection.LastUpdateDate = DateTime.Now;
                    await _db.SaveChangesAsync();
                    res.IsSuccess = true;
                    res.Message.Add("Connection request " + (connection.IsAccepted == true ? "Accepted" : "Rejected") + " successfully");
                }
                else
                {
                    res.Message.Add("Selected Connection not found");
                    return res;
                }
            }
            catch (Exception ex)
            {

                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(connectionRequest)} ### Exception ### {ex.Message}",
                });
                res.Message.Add(ex.Message.ToString());
            }
            return res;
        }

        public async Task<ServiceResponse> Unblock_Accept_Connection(int connectionId)
        {
            var res = new ServiceResponse();
            try
            {
                var currusr = await _userService.GetCurrentUser();
                if (currusr == null || currusr.UserId <= 0)
                {
                    res.Message.Add("Invalid Sender");
                    return res;
                }

                TblConnection? connection = await _db.TblConnections.Where(x => x.Id == connectionId && x.IsDeleted == false && x.ReceiverId == currusr.UserId).FirstOrDefaultAsync();

                if (connection != null)
                {
                    connection.IsAccepted = true;
                    connection.IsRejected = false;
                    connection.LastUpdateDate = DateTime.Now;
                    await _db.SaveChangesAsync();
                    res.IsSuccess = true;
                    res.Message.Add("Connection request Accepted successfully");
                }
                else
                {
                    res.Message.Add("Selected Connection not found");
                    return res;
                }
            }
            catch (Exception ex)
            {

                await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                {
                    Subject = Common.GetErrorSubject(),
                    Description = $"Data :: {JsonSerializer.Serialize(connectionId)} ### Exception ### {ex.Message}",
                });
                res.Message.Add(ex.Message.ToString());
            }
            return res;
        }
    }
}
