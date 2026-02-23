using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get currencies by company
/// Table: cafil068_dat (devises__________dev)
/// </summary>
public record GetDevisesZoomQuery(string Societe) : IRequest<List<DeviseZoom>>;

public class GetDevisesZoomQueryHandler : IRequestHandler<GetDevisesZoomQuery, List<DeviseZoom>>
{
    private readonly ICaisseDbContext _context;

    public GetDevisesZoomQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeviseZoom>> Handle(
        GetDevisesZoomQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.DevisesZoom
            .Where(d => d.Societe == request.Societe && d.CodeEnCours == "O")
            .OrderBy(d => d.Numero)
            .ToListAsync(cancellationToken);
    }
}
