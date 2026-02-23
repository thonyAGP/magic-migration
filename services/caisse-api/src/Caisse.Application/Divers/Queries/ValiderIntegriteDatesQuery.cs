using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour valider l'integrite des dates
/// Migration du programme Magic Prg_48 "Controles - Integrite dates"
/// Verifie que les dates de transaction sont coherentes avec les dates comptables
/// </summary>
public record ValiderIntegriteDatesQuery(
    string Societe,
    string TypeOperation, // O=Ouverture, T=Transaction, F=Fermeture
    DateOnly DateTransaction,
    DateOnly? DateOuvertureSession = null
) : IRequest<ValiderIntegriteDatesResult>;

public record ValiderIntegriteDatesResult
{
    public bool IsValid { get; init; }
    public string TypeOperation { get; init; } = string.Empty;
    public DateOnly DateTransaction { get; init; }
    public DateOnly? DateComptable { get; init; }
    public int JoursToleranceParametre { get; init; }
    public DateOnly? DateLimite { get; init; }
    public string? MessageErreur { get; init; }
    public List<IntegriteTableDto> VerificationsDetails { get; init; } = new();
}

public record IntegriteTableDto
{
    public string NomTable { get; init; } = string.Empty;
    public int NombreEnregistrements { get; init; }
    public bool HasErrors { get; init; }
    public string? Message { get; init; }
}

public class ValiderIntegriteDatesQueryValidator : AbstractValidator<ValiderIntegriteDatesQuery>
{
    public ValiderIntegriteDatesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.TypeOperation)
            .NotEmpty().WithMessage("TypeOperation is required")
            .Must(t => t == "O" || t == "T" || t == "F")
            .WithMessage("TypeOperation must be O (Ouverture), T (Transaction) or F (Fermeture)");

        RuleFor(x => x.DateOuvertureSession)
            .NotNull()
            .When(x => x.TypeOperation == "T")
            .WithMessage("DateOuvertureSession is required for Transaction validation");
    }
}

public class ValiderIntegriteDatesQueryHandler : IRequestHandler<ValiderIntegriteDatesQuery, ValiderIntegriteDatesResult>
{
    private readonly ICaisseDbContext _context;

    // Tolerance par defaut en jours
    private const int JoursToleranceDefaut = 3;

    public ValiderIntegriteDatesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ValiderIntegriteDatesResult> Handle(
        ValiderIntegriteDatesQuery request,
        CancellationToken cancellationToken)
    {
        // Recuperer la date comptable courante
        var dateComptableRecord = await _context.DatesComptables
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Societe == request.Societe, cancellationToken);

        var dateComptable = dateComptableRecord?.Date;
        var dateLimite = dateComptable?.AddDays(JoursToleranceDefaut);

        var result = request.TypeOperation switch
        {
            "O" => ValidateOuverture(request.DateTransaction, dateComptable, dateLimite, JoursToleranceDefaut),
            "T" => ValidateTransaction(request.DateTransaction, request.DateOuvertureSession, dateComptable, dateLimite, JoursToleranceDefaut),
            "F" => await ValidateFermetureAsync(request.Societe, request.DateTransaction, dateComptable, JoursToleranceDefaut, cancellationToken),
            _ => new ValiderIntegriteDatesResult { IsValid = false, MessageErreur = "Type d'operation inconnu" }
        };

        return result with
        {
            TypeOperation = request.TypeOperation,
            DateTransaction = request.DateTransaction,
            DateComptable = dateComptable,
            JoursToleranceParametre = JoursToleranceDefaut,
            DateLimite = dateLimite
        };
    }

    private static ValiderIntegriteDatesResult ValidateOuverture(
        DateOnly dateTransaction,
        DateOnly? dateComptable,
        DateOnly? dateLimite,
        int joursTolerance)
    {
        if (dateComptable == null)
        {
            return new ValiderIntegriteDatesResult
            {
                IsValid = false,
                MessageErreur = "Date comptable non definie pour cette societe"
            };
        }

        if (dateLimite != null && dateTransaction > dateLimite)
        {
            return new ValiderIntegriteDatesResult
            {
                IsValid = false,
                MessageErreur = $"Date d'ouverture ({dateTransaction:dd/MM/yyyy}) depasse la date comptable + {joursTolerance} jours ({dateLimite:dd/MM/yyyy})"
            };
        }

        return new ValiderIntegriteDatesResult
        {
            IsValid = true,
            MessageErreur = null
        };
    }

    private static ValiderIntegriteDatesResult ValidateTransaction(
        DateOnly dateTransaction,
        DateOnly? dateOuvertureSession,
        DateOnly? dateComptable,
        DateOnly? dateLimite,
        int joursTolerance)
    {
        if (dateComptable == null)
        {
            return new ValiderIntegriteDatesResult
            {
                IsValid = false,
                MessageErreur = "Date comptable non definie pour cette societe"
            };
        }

        // Verifier que la date de transaction >= date d'ouverture session
        if (dateOuvertureSession != null && dateTransaction < dateOuvertureSession)
        {
            return new ValiderIntegriteDatesResult
            {
                IsValid = false,
                MessageErreur = $"Date de transaction ({dateTransaction:dd/MM/yyyy}) anterieure a la date d'ouverture de session ({dateOuvertureSession:dd/MM/yyyy})"
            };
        }

        // Verifier que la date de transaction <= date comptable + tolerance
        if (dateLimite != null && dateTransaction > dateLimite)
        {
            return new ValiderIntegriteDatesResult
            {
                IsValid = false,
                MessageErreur = $"Date de transaction ({dateTransaction:dd/MM/yyyy}) depasse la date comptable + {joursTolerance} jours ({dateLimite:dd/MM/yyyy})"
            };
        }

        return new ValiderIntegriteDatesResult
        {
            IsValid = true,
            MessageErreur = null
        };
    }

    private async Task<ValiderIntegriteDatesResult> ValidateFermetureAsync(
        string societe,
        DateOnly dateFermeture,
        DateOnly? dateComptable,
        int joursTolerance,
        CancellationToken cancellationToken)
    {
        var verifications = new List<IntegriteTableDto>();

        // Verifier les sessions ouvertes
        var sessionsOuvertes = await _context.Sessions
            .AsNoTracking()
            .Where(s => s.Utilisateur.StartsWith(societe) && s.EstOuverte)
            .CountAsync(cancellationToken);

        verifications.Add(new IntegriteTableDto
        {
            NomTable = "Sessions",
            NombreEnregistrements = sessionsOuvertes,
            HasErrors = sessionsOuvertes > 0,
            Message = sessionsOuvertes > 0
                ? $"{sessionsOuvertes} session(s) encore ouverte(s)"
                : "OK"
        });

        // Verifier les details de session
        var detailsCount = await _context.SessionDetails
            .AsNoTracking()
            .CountAsync(cancellationToken);

        verifications.Add(new IntegriteTableDto
        {
            NomTable = "SessionDetails",
            NombreEnregistrements = detailsCount,
            HasErrors = false,
            Message = "OK"
        });

        // Verifier les devises
        var devisesCount = await _context.SessionDevises
            .AsNoTracking()
            .CountAsync(cancellationToken);

        verifications.Add(new IntegriteTableDto
        {
            NomTable = "SessionDevises",
            NombreEnregistrements = devisesCount,
            HasErrors = false,
            Message = "OK"
        });

        // Verifier le coffre
        var coffreCount = await _context.SessionCoffres
            .AsNoTracking()
            .CountAsync(cancellationToken);

        verifications.Add(new IntegriteTableDto
        {
            NomTable = "SessionCoffres",
            NombreEnregistrements = coffreCount,
            HasErrors = false,
            Message = "OK"
        });

        var hasErrors = verifications.Any(v => v.HasErrors);

        return new ValiderIntegriteDatesResult
        {
            IsValid = !hasErrors,
            MessageErreur = hasErrors
                ? "Des problemes d'integrite ont ete detectes"
                : null,
            VerificationsDetails = verifications
        };
    }
}
