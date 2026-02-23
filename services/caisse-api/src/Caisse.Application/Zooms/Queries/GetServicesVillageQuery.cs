using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query for Prg_265: Zoom Services Village
/// Retrieves available services at the village/resort
/// Table: caisse_ref_simp_service (services simplifiés)
/// </summary>
public record GetServicesVillageQuery : IRequest<List<ServiceVillageDto>>;

public record ServiceVillageDto(
    string CodeService,
    int SousImputation);

public class GetServicesVillageQueryHandler : IRequestHandler<GetServicesVillageQuery, List<ServiceVillageDto>>
{
    private readonly ICaisseDbContext _context;

    public GetServicesVillageQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceVillageDto>> Handle(
        GetServicesVillageQuery request,
        CancellationToken cancellationToken)
    {
        var services = await _context.ServicesVillage
            .OrderBy(s => s.SousImputation)
            .ThenBy(s => s.CodeService)
            .Select(s => new ServiceVillageDto(
                s.CodeService,
                s.SousImputation))
            .ToListAsync(cancellationToken);

        return services;
    }
}
