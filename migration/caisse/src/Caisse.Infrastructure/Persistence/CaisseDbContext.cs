using Caisse.Application.Common;
using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Infrastructure.Persistence;

public class CaisseDbContext : DbContext, ICaisseDbContext
{
    public CaisseDbContext(DbContextOptions<CaisseDbContext> options) : base(options) { }

    public DbSet<CaisseSession> Sessions => Set<CaisseSession>();
    public DbSet<CaisseSessionDetail> SessionDetails => Set<CaisseSessionDetail>();
    public DbSet<CaisseSessionArticle> SessionArticles => Set<CaisseSessionArticle>();
    public DbSet<CaisseSessionDevise> SessionDevises => Set<CaisseSessionDevise>();
    public DbSet<CaisseSessionCoffre2> SessionCoffres => Set<CaisseSessionCoffre2>();
    public DbSet<CaisseDevise> Devises => Set<CaisseDevise>();
    public DbSet<CaisseParametres> Parametres => Set<CaisseParametres>();
    public DbSet<DeviseReference> DeviseReferences => Set<DeviseReference>();
    public DbSet<CcTotalParType> CcTotauxParType => Set<CcTotalParType>();
    public DbSet<ResortCredit> ResortCredits => Set<ResortCredit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CaisseDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
