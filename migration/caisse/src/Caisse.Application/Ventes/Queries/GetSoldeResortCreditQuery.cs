using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to get Resort Credit balance for a client/service.
/// Migrated from Magic Prg_250 "Solde Resort Credit"
/// Calculation: IF(attribue > utilise, attribue - utilise, 0)
/// </summary>
public record GetSoldeResortCreditQuery(
    string Societe,
    int Compte,
    int Filiation,
    string Service) : IRequest<SoldeResortCreditResult>;

public record SoldeResortCreditResult
{
    public string Societe { get; init; } = string.Empty;
    public int Compte { get; init; }
    public int Filiation { get; init; }
    public string Service { get; init; } = string.Empty;
    public double MontantAttribue { get; init; }
    public double MontantUtilise { get; init; }
    public double SoldeResortCredit { get; init; }
    public bool Found { get; init; }
}

public class GetSoldeResortCreditQueryHandler : IRequestHandler<GetSoldeResortCreditQuery, SoldeResortCreditResult>
{
    private readonly ICaisseDbContext _context;

    public GetSoldeResortCreditQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<SoldeResortCreditResult> Handle(
        GetSoldeResortCreditQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic: lookup by societe, compte, filiation, service
        var record = await _context.ResortCredits
            .FirstOrDefaultAsync(r =>
                r.Societe == request.Societe &&
                r.NumCompte == request.Compte &&
                r.Filiation == request.Filiation &&
                r.Service == request.Service,
                cancellationToken);

        if (record == null)
        {
            return new SoldeResortCreditResult
            {
                Societe = request.Societe,
                Compte = request.Compte,
                Filiation = request.Filiation,
                Service = request.Service,
                Found = false
            };
        }

        // Magic expression: IF(attribue > utilise, attribue - utilise, 0)
        var solde = record.Solde;

        return new SoldeResortCreditResult
        {
            Societe = request.Societe,
            Compte = request.Compte,
            Filiation = request.Filiation,
            Service = request.Service,
            MontantAttribue = record.MontantAttribue,
            MontantUtilise = record.MontantUtilise,
            SoldeResortCredit = solde,
            Found = true
        };
    }
}
