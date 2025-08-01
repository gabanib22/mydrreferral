using Microsoft.AspNetCore.Identity;
using MyDrReferral.Data.Models;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Service.Interface
{
    public interface IUserService
    {
        Task<IdentityResult> AddEditUser(ApplicationUser User, string password);
        Task<string> Login(LoginModel model);
        string Authenticate(string UserName, string Password, string userId);

        void Logout();

        Task<ServiceResponse> ChangePassword(ChangePassword changePassword);
        Task<ServiceResponse> ResetPassword(ResetPassword resetPassword);
        Task<ServiceResponse> ForgotPassword(ForgotPassword forgotPassword,string CallbackUrl);
        //24-11-2023
        Task<ServiceResponse> AddBulkUsers(List<BulkUserData> bulkUserData);

        Task<ServiceResponse> AddSingleUser(SingleUserData singleUserData);

        Task<ServiceResponse> UpdateUser(UpdateUserData updateUserData);

        Task<List<SearchDDLResponse>> FilterDoctorDataByText(string searchText);        
        Task<ApplicationUser> GetCurrentUser();
    }
}
