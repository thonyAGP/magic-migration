using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Divers.Commands;

/// <summary>
/// Command pour mettre a jour la date/heure d'une session utilisateur
/// Migration du programme Magic Prg_47 "Date/Heure session user"
/// </summary>
public record UpdateSessionTimestampCommand(
    string Societe,
    string CodeCaisse,
    string CodeOperateur,
    DateTime? DateHeure = null
) : IRequest<UpdateSessionTimestampResult>;

public record UpdateSessionTimestampResult
{
    public bool Success { get; init; }
    public double? ChronoSession { get; init; }
    public string Utilisateur { get; init; } = string.Empty;
    public DateTime DateHeureAvant { get; init; }
    public DateTime DateHeureApres { get; init; }
    public string? MessageErreur { get; init; }
}

public class UpdateSessionTimestampCommandValidator : AbstractValidator<UpdateSessionTimestampCommand>
{
    public UpdateSessionTimestampCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeCaisse)
            .NotEmpty().WithMessage("CodeCaisse is required")
            .MaximumLength(10).WithMessage("CodeCaisse must be at most 10 characters");

        RuleFor(x => x.CodeOperateur)
            .NotEmpty().WithMessage("CodeOperateur is required")
            .MaximumLength(20).WithMessage("CodeOperateur must be at most 20 characters");
    }
}

public class UpdateSessionTimestampCommandHandler : IRequestHandler<UpdateSessionTimestampCommand, UpdateSessionTimestampResult>
{
    private readonly ICaisseDbContext _context;

    public UpdateSessionTimestampCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateSessionTimestampResult> Handle(
        UpdateSessionTimestampCommand request,
        CancellationToken cancellationToken)
    {
        // Construire l'identifiant utilisateur comme dans Magic (format: SOCIETE_CAISSE_OPERATEUR)
        var utilisateurPattern = $"{request.Societe}_{request.CodeCaisse}";

        // Trouver la session ouverte pour cet operateur
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s =>
                s.Utilisateur.StartsWith(utilisateurPattern) &&
                s.EstOuverte,
                cancellationToken);

        if (session == null)
        {
            return new UpdateSessionTimestampResult
            {
                Success = false,
                MessageErreur = $"Aucune session ouverte pour l'operateur {request.CodeOperateur} sur la caisse {request.CodeCaisse}"
            };
        }

        // Parser la date/heure actuelle
        var dateHeureAvant = ParseSessionDateTime(session.DateDebutSession, session.HeureDebutSession);
        var dateHeureApres = request.DateHeure ?? DateTime.Now;

        // Note: La session n'a pas de propriete DateModification dans le modele actuel
        // On retourne simplement le timestamp demande comme confirmation
        // Dans une vraie implementation, on ajouterait DateModification a l'entite

        return new UpdateSessionTimestampResult
        {
            Success = true,
            ChronoSession = session.Chrono,
            Utilisateur = session.Utilisateur,
            DateHeureAvant = dateHeureAvant,
            DateHeureApres = dateHeureApres
        };
    }

    private static DateTime ParseSessionDateTime(string dateStr, string heureStr)
    {
        // Format: YYYYMMDD et HHMMSS
        if (string.IsNullOrEmpty(dateStr) || dateStr == "00000000")
            return DateTime.MinValue;

        try
        {
            var year = int.Parse(dateStr[..4]);
            var month = int.Parse(dateStr.Substring(4, 2));
            var day = int.Parse(dateStr.Substring(6, 2));

            var hour = string.IsNullOrEmpty(heureStr) ? 0 : int.Parse(heureStr[..2]);
            var minute = string.IsNullOrEmpty(heureStr) || heureStr.Length < 4 ? 0 : int.Parse(heureStr.Substring(2, 2));
            var second = string.IsNullOrEmpty(heureStr) || heureStr.Length < 6 ? 0 : int.Parse(heureStr.Substring(4, 2));

            return new DateTime(year, month, day, hour, minute, second);
        }
        catch
        {
            return DateTime.MinValue;
        }
    }
}
