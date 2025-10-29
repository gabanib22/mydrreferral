
using Microsoft.AspNetCore.Http;
using MyDrReferral.Data.Models;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using System.Security.Claims;

namespace MyDrReferral.Service.Services
{
    public class ErrorLogService : IErrorLogService
    {
        #region ctor
        private readonly MyDrReferralContext _db;
        private readonly IHttpContextAccessor httpContextAccessor;

        public ErrorLogService(MyDrReferralContext db, IHttpContextAccessor _httpContextAccessor)
        {
            this._db = db;
            this.httpContextAccessor = _httpContextAccessor;
        }
        #endregion

        #region Methods
        public async Task<bool> AddErrorLog(ErrorLogModel _error)
        {
            bool result = false;            
            if (_error.Subject == null)
            {
                try
                {
                    _error.Subject = httpContextAccessor.HttpContext.Request.Path;
                }
                catch (Exception)
                {
                    _error.Subject = "";
                }
            }

            string currUserId = "";
            var currentUser = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUser != null)
            {
                currUserId = currentUser.Value;
            }

            //Convet to Db Set 
            var logs = new ErrorLog
            {
                Subject = _error.Subject,
                Description = _error.Description,
                Response = _error.Response,
                CreatedBy = currUserId,
                CreatedOn = DateTime.Now
            };

            result = true;
            _db.Add(logs);
            await _db.SaveChangesAsync();


            return result;
        }
        #endregion

    }
}
