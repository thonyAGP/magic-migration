using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Devises.Queries;

public record GetSessionDevisesQuery(
    string Utilisateur,
    double ChronoSession,
    string? Quand = null) : IRequest<List<SessionDeviseDto>>;

public record SessionDeviseDto(
    int ChronoDetail,
    string Type,
    string Quand,
    string CodeDevise,
    string ModePaiement,
    double Quantite,
    string Date,
    string Heure);

public class GetSessionDevisesQueryHandler : IRequestHandler<GetSessionDevisesQuery, List<SessionDeviseDto>>
{
    private readonly ICaisseDbContext _context;

    public GetSessionDevisesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionDeviseDto>> Handle(
        GetSessionDevisesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.SessionDevises
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession);

        if (!string.IsNullOrEmpty(request.Quand))
        {
            query = query.Where(d => d.Quand == request.Quand);
        }

        return await query
            .OrderBy(d => d.ChronoDetail)
            .Select(d => new SessionDeviseDto(
                d.ChronoDetail,
                d.Type,
                d.Quand,
                d.CodeDevise,
                d.ModePaiement,
                d.Quantite,
                d.Date,
                d.Heure))
            .ToListAsync(cancellationToken);
    }
}
