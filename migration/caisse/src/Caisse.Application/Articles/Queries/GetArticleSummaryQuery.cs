using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Articles.Queries;

public record GetArticleSummaryQuery(
    string Utilisateur,
    double ChronoSession) : IRequest<ArticleSummaryResult>;

public record ArticleSummaryResult(
    int NombreArticles,
    int QuantiteTotale,
    double MontantTotal,
    List<ArticleSummaryLine> ParArticle);

public record ArticleSummaryLine(
    int CodeArticle,
    string LibelleArticle,
    int Quantite,
    double Montant);

public class GetArticleSummaryQueryHandler : IRequestHandler<GetArticleSummaryQuery, ArticleSummaryResult>
{
    private readonly ICaisseDbContext _context;

    public GetArticleSummaryQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ArticleSummaryResult> Handle(
        GetArticleSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var articles = await _context.SessionArticles
            .Where(a => a.Utilisateur == request.Utilisateur
                     && a.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        var grouped = articles
            .GroupBy(a => new { a.CodeArticle, a.LibelleArticle })
            .Select(g => new ArticleSummaryLine(
                g.Key.CodeArticle,
                g.Key.LibelleArticle,
                g.Sum(a => a.Quantite),
                g.Sum(a => a.Montant)))
            .OrderByDescending(a => a.Montant)
            .ToList();

        return new ArticleSummaryResult(
            articles.Count,
            articles.Sum(a => a.Quantite),
            articles.Sum(a => a.Montant),
            grouped);
    }
}
