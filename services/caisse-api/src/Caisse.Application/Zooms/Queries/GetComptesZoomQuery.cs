using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get accounts by company (Prg_256)
/// Table: cafil050_dat (comptes____________compt)
/// </summary>
public record GetComptesZoomQuery(string Societe) : IRequest<List<CompteZoom>>;

public class GetComptesZoomQueryHandler : IRequestHandler<GetComptesZoomQuery, List<CompteZoom>>
{
    private readonly ICaisseDbContext _context;

    public GetComptesZoomQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompteZoom>> Handle(
        GetComptesZoomQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.ComptesZoom
            .Where(c => c.Societe == request.Societe)
            .OrderBy(c => c.Devise)
            .ThenBy(c => c.ModePaiement)
            .ToListAsync(cancellationToken);
    }
}
