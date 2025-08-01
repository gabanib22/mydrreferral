using AutoMapper;

using MyDrReferral.Api.Model;
using MyDrReferral.Data.Models;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<UserRegistrationRequest, ApplicationUser>();
            //.ForMember(usr=>usr.Id,opt=>opt.MapFrom(src=>Guid.NewGuid().ToString()));

            CreateMap<UserLoginRequest, LoginModel>();

            //Convert Service Model to Db type
            //CreateMap<ErrorLogModel, ErrorLogs>();

            CreateMap<UserChangePasswordRequest, ChangePassword>();

            CreateMap<ServiceResponse, ResponseModel>();

            CreateMap<UserResetPasswordRequest, ResetPassword>();

            CreateMap<UserForgotPasswordRequest, ForgotPassword>();

            CreateMap<BulkUserDataRequestModel, BulkUserData>();

            CreateMap<SingleUserDataRequestModel, SingleUserData>();

            CreateMap<UpdateUserRequestModel, UpdateUserData>();
            CreateMap<ConnectionResponseModel, ConnectionRequestResponse>();
            CreateMap<RefferModel, Reffer>();
            CreateMap<UpdateRefferStatusModel, Reffer>();
            CreateMap<ConnectionModel, Connection>();


        }
    }
}
