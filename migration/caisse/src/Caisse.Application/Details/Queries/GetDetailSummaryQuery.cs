using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Details.Queries;

public record GetDetailSummaryQuery(
    string Utilisateur,
    double ChronoSession) : IRequest<DetailSummaryResult>;

public record DetailSummaryResult(
    MontantSummary Ouverture,
    MontantSummary Fermeture,
    MontantSummary Ecart,
    List<DetailByType> ParType);

public record MontantSummary(
    double Total,
    double Monnaie,
    double Produits,
    double Cartes,
    double Cheques,
    double Od);

public record DetailByType(
    string Type,
    string Quand,
    double? Montant,
    double? MontantMonnaie,
    double? MontantProduits,
    double? MontantCartes,
    double? MontantCheques,
    double? MontantOd);

public class GetDetailSummaryQueryHandler : IRequestHandler<GetDetailSummaryQuery, DetailSummaryResult>
{
    private readonly ICaisseDbContext _context;

    public GetDetailSummaryQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DetailSummaryResult> Handle(
        GetDetailSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var details = await _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        var ouverture = details.Where(d => d.Quand == "O").ToList();
        var fermeture = details.Where(d => d.Quand == "F").ToList();

        var ouvertureSummary = new MontantSummary(
            ouverture.Sum(d => d.Montant ?? 0),
            ouverture.Sum(d => d.MontantMonnaie ?? 0),
            ouverture.Sum(d => d.MontantProduits ?? 0),
            ouverture.Sum(d => d.MontantCartes ?? 0),
            ouverture.Sum(d => d.MontantCheques ?? 0),
            ouverture.Sum(d => d.MontantOd ?? 0));

        var fermetureSummary = new MontantSummary(
            fermeture.Sum(d => d.Montant ?? 0),
            fermeture.Sum(d => d.MontantMonnaie ?? 0),
            fermeture.Sum(d => d.MontantProduits ?? 0),
            fermeture.Sum(d => d.MontantCartes ?? 0),
            fermeture.Sum(d => d.MontantCheques ?? 0),
            fermeture.Sum(d => d.MontantOd ?? 0));

        var ecartSummary = new MontantSummary(
            fermetureSummary.Total - ouvertureSummary.Total,
            fermetureSummary.Monnaie - ouvertureSummary.Monnaie,
            fermetureSummary.Produits - ouvertureSummary.Produits,
            fermetureSummary.Cartes - ouvertureSummary.Cartes,
            fermetureSummary.Cheques - ouvertureSummary.Cheques,
            fermetureSummary.Od - ouvertureSummary.Od);

        var parType = details
            .Select(d => new DetailByType(
                d.Type,
                d.Quand,
                d.Montant,
                d.MontantMonnaie,
                d.MontantProduits,
                d.MontantCartes,
                d.MontantCheques,
                d.MontantOd))
            .ToList();

        return new DetailSummaryResult(
            ouvertureSummary,
            fermetureSummary,
            ecartSummary,
            parType);
    }
}
