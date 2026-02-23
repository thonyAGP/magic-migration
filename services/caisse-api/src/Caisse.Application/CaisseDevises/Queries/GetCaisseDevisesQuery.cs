using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.CaisseDevises.Queries;

public record GetCaisseDevisesQuery(
    string? Utilisateur = null,
    string? CodeDevise = null,
    string? ModePaiement = null) : IRequest<List<CaisseDeviseDto>>;

public record CaisseDeviseDto(
    string Utilisateur,
    string CodeDevise,
    string ModePaiement,
    string Quand,
    string Type,
    double Quantite);

public class GetCaisseDevisesQueryHandler : IRequestHandler<GetCaisseDevisesQuery, List<CaisseDeviseDto>>
{
    private readonly ICaisseDbContext _context;

    public GetCaisseDevisesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<CaisseDeviseDto>> Handle(
        GetCaisseDevisesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Devises.AsQueryable();

        if (!string.IsNullOrEmpty(request.Utilisateur))
            query = query.Where(d => d.Utilisateur == request.Utilisateur);

        if (!string.IsNullOrEmpty(request.CodeDevise))
            query = query.Where(d => d.CodeDevise == request.CodeDevise);

        if (!string.IsNullOrEmpty(request.ModePaiement))
            query = query.Where(d => d.ModePaiement == request.ModePaiement);

        return await query
            .OrderBy(d => d.Utilisateur)
            .ThenBy(d => d.CodeDevise)
            .Select(d => new CaisseDeviseDto(
                d.Utilisateur,
                d.CodeDevise,
                d.ModePaiement,
                d.Quand,
                d.Type,
                d.Quantite))
            .ToListAsync(cancellationToken);
    }
}
