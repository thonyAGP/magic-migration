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

    // Tables Prg_64 - Solde Easy Check Out
    public DbSet<GmRecherche> GmRecherches => Set<GmRecherche>();
    public DbSet<GmComplet> GmComplets => Set<GmComplet>();
    public DbSet<DepotGarantie> DepotGaranties => Set<DepotGarantie>();
    public DbSet<Initialisation> Initialisations => Set<Initialisation>();
    public DbSet<DateComptable> DatesComptables => Set<DateComptable>();
    public DbSet<Garantie> Garanties => Set<Garantie>();
    public DbSet<Email> Emails => Set<Email>();

    // Tables Zooms - Phase 1
    public DbSet<MoyenReglement> MoyensReglement => Set<MoyenReglement>();
    public DbSet<TableReference> TablesReference => Set<TableReference>();
    public DbSet<DeviseZoom> DevisesZoom => Set<DeviseZoom>();
    public DbSet<DepotObjet> DepotsObjets => Set<DepotObjet>();
    public DbSet<DepotDevise> DepotsDevises => Set<DepotDevise>();
    public DbSet<Pays> Pays => Set<Pays>();
    public DbSet<TypeTauxChange> TypesTauxChange => Set<TypeTauxChange>();
    public DbSet<CompteZoom> ComptesZoom => Set<CompteZoom>();
    // TypeTauxZoom removed - use TypeTauxChange instead (same table cafil102_dat)
    // TypeObjetZoom removed - use DepotObjet instead (same table cafil077_dat)
    // ModePaiementZoom removed - use MoyenReglement instead (same table cafil028_dat)

    // Tables Member Lookup - Phase 2
    public DbSet<EzCard> EzCards => Set<EzCard>();

    // Tables Solde - Phase 3
    public DbSet<CompteGm> ComptesGm => Set<CompteGm>();
    public DbSet<CcTotal> CcTotaux => Set<CcTotal>();
    public DbSet<Mouvement> Mouvements => Set<Mouvement>();
    public DbSet<Village> Villages => Set<Village>();
    public DbSet<MoyenPaiement> MoyensPaiement => Set<MoyenPaiement>();

    // Tables Ventes - Phase 4
    public DbSet<TransactionBarEntete> TransactionsBarEntete => Set<TransactionBarEntete>();
    public DbSet<TransactionBarDetail> TransactionsBarDetail => Set<TransactionBarDetail>();

    // Tables Change - Phase 7
    public DbSet<TauxChange> TauxChanges => Set<TauxChange>();

    // Tables Telephone - Phase 8
    public DbSet<LigneTelephone> LignesTelephone => Set<LigneTelephone>();
    public DbSet<AppelTelephone> AppelsTelephone => Set<AppelTelephone>();

    // Tables Zooms - Services Village (Prg_265)
    public DbSet<ServiceVillage> ServicesVillage => Set<ServiceVillage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CaisseDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
