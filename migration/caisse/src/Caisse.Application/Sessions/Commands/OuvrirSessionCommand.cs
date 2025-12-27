using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;

namespace Caisse.Application.Sessions.Commands;

public record OuvrirSessionCommand(
    string Utilisateur,
    string Terminal,
    string DateComptable) : IRequest<OuvrirSessionResult>;

public record OuvrirSessionResult(
    bool Success,
    double? ChronoSession = null,
    string? Error = null);

public class OuvrirSessionCommandHandler : IRequestHandler<OuvrirSessionCommand, OuvrirSessionResult>
{
    private readonly ICaisseDbContext _context;

    public OuvrirSessionCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<OuvrirSessionResult> Handle(
        OuvrirSessionCommand request,
        CancellationToken cancellationToken)
    {
        // Generate new chrono (in Magic this uses a counter)
        var maxChrono = _context.Sessions
            .Where(s => s.Utilisateur == request.Utilisateur)
            .Select(s => (double?)s.Chrono)
            .Max() ?? 0;

        var newChrono = maxChrono + 1;

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        var session = CaisseSession.Create(
            request.Utilisateur,
            newChrono,
            dateStr,
            heureStr,
            request.DateComptable);

        _context.Sessions.Add(session);

        // Create opening detail - Type "O" for Ouverture, Quand "D" for Debut
        var detail = CaisseSessionDetail.Create(
            request.Utilisateur,
            newChrono,
            1,
            "O", // Ouverture (1 char)
            "D", // Debut (1 char)
            dateStr,
            heureStr);

        _context.SessionDetails.Add(detail);

        await _context.SaveChangesAsync(cancellationToken);

        return new OuvrirSessionResult(true, newChrono);
    }
}
