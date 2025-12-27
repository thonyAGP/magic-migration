using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Coffre.Commands;

public record AddCoffreCommand(
    string Utilisateur,
    double Chrono) : IRequest<AddCoffreResult>;

public record AddCoffreResult(
    bool Success,
    string? Error = null);

public class AddCoffreCommandHandler : IRequestHandler<AddCoffreCommand, AddCoffreResult>
{
    private readonly ICaisseDbContext _context;

    public AddCoffreCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<AddCoffreResult> Handle(
        AddCoffreCommand request,
        CancellationToken cancellationToken)
    {
        // Check if already exists
        var exists = await _context.SessionCoffres
            .AnyAsync(c => c.Utilisateur == request.Utilisateur
                        && c.Chrono == request.Chrono,
                cancellationToken);

        if (exists)
            return new AddCoffreResult(false, Error: "Coffre deja enregistre pour cette session");

        // Verify session exists
        var sessionExists = await _context.Sessions
            .AnyAsync(s => s.Utilisateur == request.Utilisateur
                        && s.Chrono == request.Chrono,
                cancellationToken);

        if (!sessionExists)
            return new AddCoffreResult(false, Error: "Session non trouvee");

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        var coffre = CaisseSessionCoffre2.Create(
            request.Utilisateur,
            request.Chrono,
            dateStr,
            heureStr);

        _context.SessionCoffres.Add(coffre);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddCoffreResult(true);
    }
}
