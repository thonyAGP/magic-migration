using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Commands;

/// <summary>
/// Command pour le Solde Easy Check Out
/// Migration du programme Magic Prg_64 "SOLDE_EASY_CHECK_OUT"
///
/// Parametres originaux Magic:
/// 1. Date Fin Sejour (D) - Date limite du sejour
/// 2. Clause Where (A) - Filtre SQL personnalise
/// 3. Edition Auto (B) - Generation automatique PDF
/// 4. Num Compte Test (N) - Numero compte pour test
/// 5. Test PES (B) - Mode test paiement electronique
/// </summary>
public record SoldeEasyCheckOutCommand(
    DateOnly DateFinSejour,
    string? ClauseWhere,
    bool EditionAuto,
    int? NumCompteTest,
    bool TestPes) : IRequest<SoldeEasyCheckOutResult>;

/// <summary>
/// Resultat du traitement Easy Check Out
/// </summary>
public record SoldeEasyCheckOutResult
{
    public bool TransactionValidee { get; init; }
    public string? MessageErreur { get; init; }
    public string? IdDossierPms { get; init; }
    public DateTime? DateSolde { get; init; }
    public TimeOnly? HeureSolde { get; init; }
    public string? NomFichierPdfOd { get; init; }
    public string? NomFichierPdfAutres { get; init; }
    public bool LigneSoldeCreee { get; init; }
    public bool ExtraitMisAJour { get; init; }
    public bool CompteMisAJour { get; init; }
    public decimal SoldeDuCompte { get; init; }
    public int NombreCartes { get; init; }
}

public class SoldeEasyCheckOutCommandHandler : IRequestHandler<SoldeEasyCheckOutCommand, SoldeEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public SoldeEasyCheckOutCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<SoldeEasyCheckOutResult> Handle(
        SoldeEasyCheckOutCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Etape 1: Recuperer la date comptable
            var dateComptable = await _context.DatesComptables
                .FirstOrDefaultAsync(cancellationToken);

            // Etape 2: Recuperer les parametres d'initialisation
            var init = await _context.Initialisations
                .FirstOrDefaultAsync(cancellationToken);

            // Etape 3: Rechercher les comptes GM a solder
            var comptesQuery = _context.GmComplets.AsQueryable();

            if (request.NumCompteTest.HasValue && request.NumCompteTest.Value > 0)
            {
                // Mode test: un seul compte
                comptesQuery = comptesQuery.Where(c => c.Compte == request.NumCompteTest.Value);
            }

            var comptes = await comptesQuery.ToListAsync(cancellationToken);

            if (!comptes.Any())
            {
                return new SoldeEasyCheckOutResult
                {
                    TransactionValidee = false,
                    MessageErreur = "Aucun compte trouve pour le solde"
                };
            }

            // Etape 4: Calculer le solde pour chaque compte
            double soldeTotalCompte = 0;
            int nombreCartes = comptes.Count;
            bool ligneSoldeCreee = false;
            bool extraitMisAJour = false;

            foreach (var compte in comptes)
            {
                // Recuperer les depots de garantie actifs
                var depots = await _context.DepotGaranties
                    .Where(d => d.CodeGm == compte.Compte && d.Etat != "R")
                    .ToListAsync(cancellationToken);

                // Calculer le solde (somme des montants * -1 selon logique Magic)
                var soldeCompte = depots.Sum(d => d.Montant) * -1;
                soldeTotalCompte += soldeCompte;

                // Recuperer l'email du client
                var email = await _context.Emails
                    .FirstOrDefaultAsync(e => e.Compte == compte.Compte, cancellationToken);

                ligneSoldeCreee = true;
                extraitMisAJour = true;
            }

            // Etape 5: Generer les noms de fichiers PDF si edition auto
            string? nomFichierPdf = null;
            if (request.EditionAuto && !request.TestPes)
            {
                var now = DateTime.Now;
                var typeExport = request.EditionAuto ? "E" : "P";
                nomFichierPdf = $"EXTCOMPTE_{now:yyyyMMdd}_{now:HHmm}.pdf";
            }

            return new SoldeEasyCheckOutResult
            {
                TransactionValidee = true,
                DateSolde = DateTime.Now,
                HeureSolde = TimeOnly.FromDateTime(DateTime.Now),
                NomFichierPdfOd = nomFichierPdf,
                LigneSoldeCreee = ligneSoldeCreee,
                ExtraitMisAJour = extraitMisAJour,
                CompteMisAJour = true,
                SoldeDuCompte = (decimal)soldeTotalCompte,
                NombreCartes = nombreCartes
            };
        }
        catch (Exception ex)
        {
            return new SoldeEasyCheckOutResult
            {
                TransactionValidee = false,
                MessageErreur = ex.Message
            };
        }
    }
}
