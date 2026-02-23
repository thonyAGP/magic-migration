using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get guarantee types by company
/// Table: cafil069_dat (garantie)
/// </summary>
public record GetGarantiesQuery(string Societe) : IRequest<List<Garantie>>;

public class GetGarantiesQueryHandler : IRequestHandler<GetGarantiesQuery, List<Garantie>>
{
    private readonly ICaisseDbContext _context;

    public GetGarantiesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<Garantie>> Handle(
        GetGarantiesQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Garanties
            .Where(g => g.Societe == request.Societe)
            .OrderBy(g => g.CodeGarantie)
            .ToListAsync(cancellationToken);
    }
}
