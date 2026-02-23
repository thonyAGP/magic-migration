using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Devises.Queries;

/// <summary>
/// Get summary of devises for a session (total by devise/mode)
/// </summary>
public record GetDeviseSummaryQuery(
    string Utilisateur,
    double ChronoSession) : IRequest<DeviseSummaryResult>;

public record DeviseSummaryResult(
    double TotalOuverture,
    double TotalFermeture,
    double Ecart,
    List<DeviseSummaryLine> Details);

public record DeviseSummaryLine(
    string CodeDevise,
    string ModePaiement,
    double QuantiteOuverture,
    double QuantiteFermeture,
    double Ecart);

public class GetDeviseSummaryQueryHandler : IRequestHandler<GetDeviseSummaryQuery, DeviseSummaryResult>
{
    private readonly ICaisseDbContext _context;

    public GetDeviseSummaryQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DeviseSummaryResult> Handle(
        GetDeviseSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var devises = await _context.SessionDevises
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        var grouped = devises
            .GroupBy(d => new { d.CodeDevise, d.ModePaiement })
            .Select(g => new DeviseSummaryLine(
                g.Key.CodeDevise,
                g.Key.ModePaiement,
                g.Where(d => d.Quand == "O").Sum(d => d.Quantite),
                g.Where(d => d.Quand == "F").Sum(d => d.Quantite),
                g.Where(d => d.Quand == "F").Sum(d => d.Quantite) -
                g.Where(d => d.Quand == "O").Sum(d => d.Quantite)))
            .ToList();

        var totalOuverture = grouped.Sum(g => g.QuantiteOuverture);
        var totalFermeture = grouped.Sum(g => g.QuantiteFermeture);

        return new DeviseSummaryResult(
            totalOuverture,
            totalFermeture,
            totalFermeture - totalOuverture,
            grouped);
    }
}
