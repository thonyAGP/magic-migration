using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Identification.Queries;

/// <summary>
/// Query pour vérifier si une session caisse est ouverte
/// Migration du programme Magic Prg_328 "Verif session caisse ouverte"
/// </summary>
public record VerifierSessionCaisseQuery(
    string Societe,
    string CodeOperateur
) : IRequest<VerifierSessionCaisseResult>;

public record VerifierSessionCaisseResult
{
    public bool SessionOuverte { get; init; }
    public string CodeOperateur { get; init; } = string.Empty;
    public double? ChronoSession { get; init; }
    public DateOnly? DateOuverture { get; init; }
    public TimeOnly? HeureOuverture { get; init; }
    public string? NumCaisse { get; init; }
    public string? Message { get; init; }
}

public class VerifierSessionCaisseQueryValidator : AbstractValidator<VerifierSessionCaisseQuery>
{
    public VerifierSessionCaisseQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeOperateur)
            .NotEmpty().WithMessage("CodeOperateur is required")
            .MaximumLength(10).WithMessage("CodeOperateur must be at most 10 characters");
    }
}

public class VerifierSessionCaisseQueryHandler : IRequestHandler<VerifierSessionCaisseQuery, VerifierSessionCaisseResult>
{
    private readonly ICaisseDbContext _context;

    public VerifierSessionCaisseQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<VerifierSessionCaisseResult> Handle(
        VerifierSessionCaisseQuery request,
        CancellationToken cancellationToken)
    {
        // Chercher une session ouverte pour cet opérateur
        var session = await _context.Sessions
            .AsNoTracking()
            .Where(s =>
                s.Utilisateur == request.CodeOperateur &&
                s.EstOuverte)
            .OrderByDescending(s => s.Chrono)
            .FirstOrDefaultAsync(cancellationToken);

        if (session == null)
        {
            return new VerifierSessionCaisseResult
            {
                SessionOuverte = false,
                CodeOperateur = request.CodeOperateur,
                Message = "Aucune session caisse ouverte"
            };
        }

        // Parse date and time from string format
        DateOnly? dateOuverture = null;
        TimeOnly? heureOuverture = null;

        if (session.DateDebutSession.Length == 8 && session.DateDebutSession != "00000000")
        {
            if (int.TryParse(session.DateDebutSession.Substring(0, 4), out int year) &&
                int.TryParse(session.DateDebutSession.Substring(4, 2), out int month) &&
                int.TryParse(session.DateDebutSession.Substring(6, 2), out int day))
            {
                dateOuverture = new DateOnly(year, month, day);
            }
        }

        if (session.HeureDebutSession.Length == 6)
        {
            if (int.TryParse(session.HeureDebutSession.Substring(0, 2), out int hour) &&
                int.TryParse(session.HeureDebutSession.Substring(2, 2), out int minute) &&
                int.TryParse(session.HeureDebutSession.Substring(4, 2), out int second))
            {
                heureOuverture = new TimeOnly(hour, minute, second);
            }
        }

        return new VerifierSessionCaisseResult
        {
            SessionOuverte = true,
            CodeOperateur = request.CodeOperateur,
            ChronoSession = session.Chrono,
            DateOuverture = dateOuverture,
            HeureOuverture = heureOuverture,
            NumCaisse = session.Utilisateur // Using Utilisateur as reference
        };
    }
}
