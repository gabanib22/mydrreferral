using MyDrReferral.Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyDrReferral.Service.Interface
{
    public interface IConnectionService
    {
        Task<ServiceResponse> ConnectionRequest(Connection connection);
        Task<ServiceResponse> ConnectionRequestResponse(ConnectionRequestResponse connectionRequest);
        Task<ServiceResponse> Unblock_Accept_Connection(int connectionId);
    }
}
