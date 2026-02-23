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
    DbSet<CcTotalParType> CcTotauxParType { get; }
    DbSet<ResortCredit> ResortCredits { get; }

    // Tables Prg_64 - Solde Easy Check Out
    DbSet<GmRecherche> GmRecherches { get; }
    DbSet<GmComplet> GmComplets { get; }
    DbSet<DepotGarantie> DepotGaranties { get; }
    DbSet<Initialisation> Initialisations { get; }
    DbSet<DateComptable> DatesComptables { get; }
    DbSet<Garantie> Garanties { get; }
    DbSet<Email> Emails { get; }

    // Tables Zooms - Phase 1
    DbSet<MoyenReglement> MoyensReglement { get; }
    DbSet<TableReference> TablesReference { get; }
    DbSet<DeviseZoom> DevisesZoom { get; }
    DbSet<DepotObjet> DepotsObjets { get; }
    DbSet<DepotDevise> DepotsDevises { get; }
    DbSet<Pays> Pays { get; }
    DbSet<TypeTauxChange> TypesTauxChange { get; }
    DbSet<CompteZoom> ComptesZoom { get; }
    // TypeTauxZoom removed - use TypeTauxChange instead
    // TypeObjetZoom removed - use DepotObjet instead
    // ModePaiementZoom removed - use MoyenReglement instead

    // Tables Member Lookup - Phase 2
    DbSet<Domain.Entities.EzCard> EzCards { get; }

    // Tables Solde - Phase 3
    DbSet<CompteGm> ComptesGm { get; }
    DbSet<CcTotal> CcTotaux { get; }
    DbSet<Mouvement> Mouvements { get; }
    DbSet<Village> Villages { get; }
    DbSet<MoyenPaiement> MoyensPaiement { get; }

    // Tables Ventes - Phase 4
    DbSet<TransactionBarEntete> TransactionsBarEntete { get; }
    DbSet<TransactionBarDetail> TransactionsBarDetail { get; }

    // Tables Change - Phase 7
    DbSet<TauxChange> TauxChanges { get; }

    // Tables Telephone - Phase 8
    DbSet<LigneTelephone> LignesTelephone { get; }
    DbSet<AppelTelephone> AppelsTelephone { get; }

    // Tables Zooms - Services Village (Prg_265)
    DbSet<ServiceVillage> ServicesVillage { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
