using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get countries/nationalities
/// Table: cafil097_dat (tables_pays_tel_)
/// </summary>
public record GetPaysQuery(string? CodeLangue = null) : IRequest<List<Pays>>;

public class GetPaysQueryHandler : IRequestHandler<GetPaysQuery, List<Pays>>
{
    private readonly ICaisseDbContext _context;

    public GetPaysQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<Pays>> Handle(
        GetPaysQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Pays.AsQueryable();

        if (!string.IsNullOrEmpty(request.CodeLangue))
        {
            query = query.Where(p => p.CodeLangue == request.CodeLangue);
        }

        return await query
            .OrderBy(p => p.Libelle)
            .ToListAsync(cancellationToken);
    }
}
