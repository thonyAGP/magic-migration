using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get payment methods by company
/// Table: cafil028_dat (moyens_reglement_mor)
/// </summary>
public record GetMoyensReglementQuery(string Societe) : IRequest<List<MoyenReglement>>;

public class GetMoyensReglementQueryHandler : IRequestHandler<GetMoyensReglementQuery, List<MoyenReglement>>
{
    private readonly ICaisseDbContext _context;

    public GetMoyensReglementQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<MoyenReglement>> Handle(
        GetMoyensReglementQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.MoyensReglement
            .Where(m => m.Societe == request.Societe && m.Accepte == "O")
            .OrderBy(m => m.Devise)
            .ThenBy(m => m.Mop)
            .ToListAsync(cancellationToken);
    }
}
