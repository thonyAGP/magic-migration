using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get deposit currencies by company
/// Table: cafil078_dat (depot_devise_____ddv)
/// </summary>
public record GetDepotsDevisesQuery(string Societe) : IRequest<List<DepotDevise>>;

public class GetDepotsDevisesQueryHandler : IRequestHandler<GetDepotsDevisesQuery, List<DepotDevise>>
{
    private readonly ICaisseDbContext _context;

    public GetDepotsDevisesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepotDevise>> Handle(
        GetDepotsDevisesQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.DepotsDevises
            .Where(d => d.Societe == request.Societe)
            .OrderBy(d => d.MoyenPaiement)
            .ToListAsync(cancellationToken);
    }
}
