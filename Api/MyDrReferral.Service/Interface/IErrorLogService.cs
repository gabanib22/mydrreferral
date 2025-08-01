using MyDrReferral.Service.Models;

namespace MyDrReferral.Service.Interface
{
    public interface IErrorLogService
    {
        public Task<bool> AddErrorLog(ErrorLogModel _error);
    }
}
