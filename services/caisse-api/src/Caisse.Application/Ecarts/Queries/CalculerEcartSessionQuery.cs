using Caisse.Application.Common;
using Caisse.Domain.Services;
using Caisse.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Ecarts.Queries;

/// <summary>
/// Query to calculate the complete écart for a session.
/// Returns detailed breakdown of expected vs counted amounts.
/// </summary>
public record CalculerEcartSessionQuery(
    string Utilisateur,
    double ChronoSession) : IRequest<EcartSessionResult>;

/// <summary>
/// Result DTO for écart calculation.
/// </summary>
public record EcartSessionResult
{
    public string Utilisateur { get; init; } = string.Empty;
    public double ChronoSession { get; init; }
    public bool SessionExiste { get; init; }
    public bool SessionFermee { get; init; }
    public EcartMontantsDto Attendu { get; init; } = new();
    public EcartMontantsDto Compte { get; init; } = new();
    public EcartMontantsDto Ecart { get; init; } = new();
    public bool EstEquilibre { get; init; }
    public string? Commentaire { get; init; }
    public List<EcartDeviseDto> EcartsDevises { get; init; } = [];
    public EcartStatut Statut { get; init; }
}

public record EcartMontantsDto
{
    public double Total { get; init; }
    public double Monnaie { get; init; }
    public double Produits { get; init; }
    public double Cartes { get; init; }
    public double Cheques { get; init; }
    public double Od { get; init; }
    public double Libre1 { get; init; }
    public double Libre2 { get; init; }
    public double Libre3 { get; init; }
}

public record EcartDeviseDto
{
    public string CodeDevise { get; init; } = string.Empty;
    public string ModePaiement { get; init; } = string.Empty;
    public double Attendu { get; init; }
    public double Compte { get; init; }
    public double Ecart { get; init; }
    public bool EstEquilibre { get; init; }
}

public enum EcartStatut
{
    SessionInexistante,
    SessionOuverte,
    Equilibre,
    EcartPositif,   // More money than expected (surplus)
    EcartNegatif    // Less money than expected (shortage)
}

public class CalculerEcartSessionQueryHandler : IRequestHandler<CalculerEcartSessionQuery, EcartSessionResult>
{
    private readonly ICaisseDbContext _context;
    private readonly IEcartCalculator _calculator;

    public CalculerEcartSessionQueryHandler(
        ICaisseDbContext context,
        IEcartCalculator calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    public async Task<EcartSessionResult> Handle(
        CalculerEcartSessionQuery request,
        CancellationToken cancellationToken)
    {
        // Get session
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s =>
                s.Utilisateur == request.Utilisateur &&
                s.Chrono == request.ChronoSession,
                cancellationToken);

        if (session == null)
        {
            return new EcartSessionResult
            {
                Utilisateur = request.Utilisateur,
                ChronoSession = request.ChronoSession,
                SessionExiste = false,
                Statut = EcartStatut.SessionInexistante
            };
        }

        var sessionFermee = !session.EstOuverte;

        // Get details and devises
        var details = await _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        var devises = await _context.SessionDevises
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        // Calculate écart
        var ecart = _calculator.Calculer(details, devises);

        // Determine status
        var statut = DetermineStatut(session.EstOuverte, ecart);

        return new EcartSessionResult
        {
            Utilisateur = request.Utilisateur,
            ChronoSession = request.ChronoSession,
            SessionExiste = true,
            SessionFermee = sessionFermee,
            Attendu = ToDto(ecart.Attendu),
            Compte = ToDto(ecart.Compte),
            Ecart = ToDto(ecart.Ecart),
            EstEquilibre = ecart.EstEquilibre,
            Commentaire = ecart.Commentaire,
            EcartsDevises = ecart.EcartsDevises.Select(ToDto).ToList(),
            Statut = statut
        };
    }

    private static EcartStatut DetermineStatut(bool estOuverte, EcartSession ecart)
    {
        if (estOuverte) return EcartStatut.SessionOuverte;
        if (ecart.EstEquilibre) return EcartStatut.Equilibre;
        return ecart.Ecart.Total > 0 ? EcartStatut.EcartPositif : EcartStatut.EcartNegatif;
    }

    private static EcartMontantsDto ToDto(EcartMontants m) => new()
    {
        Total = m.Total,
        Monnaie = m.Monnaie,
        Produits = m.Produits,
        Cartes = m.Cartes,
        Cheques = m.Cheques,
        Od = m.Od,
        Libre1 = m.Libre1,
        Libre2 = m.Libre2,
        Libre3 = m.Libre3
    };

    private static EcartDeviseDto ToDto(EcartDevise d) => new()
    {
        CodeDevise = d.CodeDevise,
        ModePaiement = d.ModePaiement,
        Attendu = d.Attendu,
        Compte = d.Compte,
        Ecart = d.Ecart,
        EstEquilibre = d.EstEquilibre
    };
}
