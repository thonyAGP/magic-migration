using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Articles.Queries;

public record GetSessionArticlesQuery(
    string Utilisateur,
    double ChronoSession) : IRequest<List<SessionArticleDto>>;

public record SessionArticleDto(
    int ChronoDetail,
    int CodeArticle,
    string LibelleArticle,
    double PrixUnitaire,
    int Quantite,
    double Montant,
    string Date,
    string Heure);

public class GetSessionArticlesQueryHandler : IRequestHandler<GetSessionArticlesQuery, List<SessionArticleDto>>
{
    private readonly ICaisseDbContext _context;

    public GetSessionArticlesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionArticleDto>> Handle(
        GetSessionArticlesQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.SessionArticles
            .Where(a => a.Utilisateur == request.Utilisateur
                     && a.ChronoSession == request.ChronoSession)
            .OrderBy(a => a.ChronoDetail)
            .Select(a => new SessionArticleDto(
                a.ChronoDetail,
                a.CodeArticle,
                a.LibelleArticle,
                a.PrixUnitaire,
                a.Quantite,
                a.Montant,
                a.Date,
                a.Heure))
            .ToListAsync(cancellationToken);
    }
}
