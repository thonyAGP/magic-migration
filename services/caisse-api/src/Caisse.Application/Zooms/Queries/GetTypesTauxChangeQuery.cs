using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get exchange rate types by company
/// Table: cafil102_dat (type_taux_change)
/// </summary>
public record GetTypesTauxChangeQuery(string Societe) : IRequest<List<TypeTauxChange>>;

public class GetTypesTauxChangeQueryHandler : IRequestHandler<GetTypesTauxChangeQuery, List<TypeTauxChange>>
{
    private readonly ICaisseDbContext _context;

    public GetTypesTauxChangeQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<TypeTauxChange>> Handle(
        GetTypesTauxChangeQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.TypesTauxChange
            .Where(t => t.Societe == request.Societe && t.Utilise == "O")
            .OrderBy(t => t.Code)
            .ToListAsync(cancellationToken);
    }
}
