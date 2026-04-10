using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using RPS.Commons.RequestHandlers.Project;
using RPS.Commons.Validators.Project;

namespace RPS.Commons.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers MediatR handlers + FluentValidation validators + ValidationBehavior pipeline.
    /// Call this from Program.cs: builder.Services.AddCommonsServices()
    /// </summary>
    public static IServiceCollection AddCommonsServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(GetProjectDetailRequestHandler).Assembly));

        services.AddValidatorsFromAssembly(typeof(UpdateProjectRequestValidator).Assembly);

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
