using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get deposit object types by company
/// Table: cafil077_dat (depot_objet______obj)
/// </summary>
public record GetDepotsObjetsQuery(string Societe) : IRequest<List<DepotObjet>>;

public class GetDepotsObjetsQueryHandler : IRequestHandler<GetDepotsObjetsQuery, List<DepotObjet>>
{
    private readonly ICaisseDbContext _context;

    public GetDepotsObjetsQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepotObjet>> Handle(
        GetDepotsObjetsQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.DepotsObjets
            .Where(d => d.Societe == request.Societe)
            .OrderBy(d => d.CodeObjet)
            .ToListAsync(cancellationToken);
    }
}
