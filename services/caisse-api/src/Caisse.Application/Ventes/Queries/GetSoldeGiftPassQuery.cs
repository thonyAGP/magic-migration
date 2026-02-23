using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to get total Gift Pass balance for a client.
/// Migrated from Magic Prg_237 "Solde Gift Pass"
/// </summary>
public record GetSoldeGiftPassQuery(
    string Societe,
    int Compte,
    int Filiation) : IRequest<SoldeGiftPassResult>;

public record SoldeGiftPassResult
{
    public string Societe { get; init; } = string.Empty;
    public int Compte { get; init; }
    public int Filiation { get; init; }
    public double SoldeCreditConso { get; init; }
    public int NombreEnregistrements { get; init; }
}

public class GetSoldeGiftPassQueryHandler : IRequestHandler<GetSoldeGiftPassQuery, SoldeGiftPassResult>
{
    private readonly ICaisseDbContext _context;

    public GetSoldeGiftPassQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<SoldeGiftPassResult> Handle(
        GetSoldeGiftPassQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Range on societe, code_8chiffres, filiation
        // 2. Sum solde_credit_conso for all matching records
        var records = await _context.CcTotauxParType
            .Where(t => t.Societe == request.Societe
                     && t.Code8Chiffres == request.Compte
                     && t.Filiation == request.Filiation)
            .ToListAsync(cancellationToken);

        var totalSolde = records.Sum(r => r.SoldeCreditConso);

        return new SoldeGiftPassResult
        {
            Societe = request.Societe,
            Compte = request.Compte,
            Filiation = request.Filiation,
            SoldeCreditConso = totalSolde,
            NombreEnregistrements = records.Count
        };
    }
}
