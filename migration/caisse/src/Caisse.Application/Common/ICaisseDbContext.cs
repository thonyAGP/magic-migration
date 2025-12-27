using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Common;

public interface ICaisseDbContext
{
    DbSet<CaisseSession> Sessions { get; }
    DbSet<CaisseSessionDetail> SessionDetails { get; }
    DbSet<CaisseSessionArticle> SessionArticles { get; }
    DbSet<CaisseSessionDevise> SessionDevises { get; }
    DbSet<CaisseSessionCoffre2> SessionCoffres { get; }
    DbSet<CaisseDevise> Devises { get; }
    DbSet<CaisseParametres> Parametres { get; }
    DbSet<DeviseReference> DeviseReferences { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
