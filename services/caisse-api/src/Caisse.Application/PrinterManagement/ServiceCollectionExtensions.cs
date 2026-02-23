using Microsoft.Extensions.DependencyInjection;

namespace Caisse.Application.PrinterManagement;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPrinterManagement(this IServiceCollection services)
    {
        // Register all MediatR handlers automatically via FluentValidation
        // Pattern already established in ApplicationServiceCollectionExtensions
        return services;
    }
}
