using MyDrReferral.Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyDrReferral.Service.Interface
{
    public interface IRefferService
    {
        Task<ServiceResponse> AddNewReffer(Reffer reffer);
        Task<ServiceResponse> UpdateRefferStatus(Reffer reffer);
    }
}
