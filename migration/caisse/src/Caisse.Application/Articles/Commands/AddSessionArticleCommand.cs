using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Articles.Commands;

public record AddSessionArticleCommand(
    string Utilisateur,
    double ChronoSession,
    int CodeArticle,
    string LibelleArticle,
    double PrixUnitaire,
    int Quantite) : IRequest<AddSessionArticleResult>;

public record AddSessionArticleResult(
    bool Success,
    int? ChronoDetail = null,
    double? Montant = null,
    string? Error = null);

public class AddSessionArticleCommandHandler : IRequestHandler<AddSessionArticleCommand, AddSessionArticleResult>
{
    private readonly ICaisseDbContext _context;

    public AddSessionArticleCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<AddSessionArticleResult> Handle(
        AddSessionArticleCommand request,
        CancellationToken cancellationToken)
    {
        // Verify session exists and is open
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Utilisateur == request.Utilisateur
                        && s.Chrono == request.ChronoSession,
                cancellationToken);

        if (session == null)
            return new AddSessionArticleResult(false, Error: "Session non trouvee");

        if (!session.EstOuverte)
            return new AddSessionArticleResult(false, Error: "Session fermee");

        // Get next chrono_detail
        var maxDetail = await _context.SessionArticles
            .Where(a => a.Utilisateur == request.Utilisateur
                     && a.ChronoSession == request.ChronoSession)
            .Select(a => (int?)a.ChronoDetail)
            .MaxAsync(cancellationToken) ?? 0;

        var newDetail = maxDetail + 1;

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        var article = CaisseSessionArticle.Create(
            request.Utilisateur,
            request.ChronoSession,
            newDetail,
            request.CodeArticle,
            request.LibelleArticle,
            request.PrixUnitaire,
            request.Quantite,
            dateStr,
            heureStr);

        _context.SessionArticles.Add(article);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddSessionArticleResult(true, newDetail, request.PrixUnitaire * request.Quantite);
    }
}
