using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Sessions.Queries;

public record GetSessionsQuery(string? Utilisateur = null, int Limit = 10) : IRequest<List<SessionDto>>;

public record SessionDto(
    string Utilisateur,
    double Chrono,
    string DateDebut,
    string HeureDebut,
    string DateFin,
    string HeureFin,
    string DateComptable,
    bool Pointage,
    bool EstOuverte);

public class GetSessionsQueryHandler : IRequestHandler<GetSessionsQuery, List<SessionDto>>
{
    private readonly ICaisseDbContext _context;

    public GetSessionsQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionDto>> Handle(GetSessionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Sessions.AsQueryable();

        if (!string.IsNullOrEmpty(request.Utilisateur))
        {
            query = query.Where(s => s.Utilisateur == request.Utilisateur);
        }

        return await query
            .OrderByDescending(s => s.Chrono)
            .Take(request.Limit)
            .Select(s => new SessionDto(
                s.Utilisateur,
                s.Chrono,
                s.DateDebutSession,
                s.HeureDebutSession,
                s.DateFinSession,
                s.HeureFinSession,
                s.DateComptable,
                s.Pointage,
                s.DateFinSession == "00000000"))
            .ToListAsync(cancellationToken);
    }
}
