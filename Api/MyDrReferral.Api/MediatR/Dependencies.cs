using MediatR;
namespace MyDrReferral.Api.MediatR
{
    public static class Dependencies
    {
        public static IServiceCollection RegisterRequestHandlers(
            this IServiceCollection services)
        {
            return services
                .AddMediatR(mdr=>mdr.RegisterServicesFromAssemblies(typeof(Dependencies).Assembly));
                //.AddMediatR(typeof(Dependencies).Assembly);
        }
    }
}
