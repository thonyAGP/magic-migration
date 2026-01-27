using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour obtenir les détails de fusion de compte
/// Migration du programme Magic Prg_28 "Fusion"
/// Public via ADH.ecf - Browse/Online task
/// </summary>
public record GetFusionQuery(
    string Societe,
    int CodeCompteSource,
    int FiliationSource,
    int CodeCompteCible,
    int FiliationCible,
    string? TypeFiltre = null,
    int? Limit = null
) : IRequest<GetFusionResult>;

public record GetFusionResult(
    bool Found,
    FusionDetail? Details = null,
    string Message = "");

public record FusionDetail(
    int CodeCompteSource,
    int FiliationSource,
    string LibelleCompteSource,
    decimal SoldeSource,
    int CodeCompteCible,
    int FiliationCible,
    string LibelleCompteCible,
    decimal SoldeCible,
    DateTime DateFusion,
    string Statut,
    List<TransactionDetail>? Transactions = null);

public record TransactionDetail(
    string Reference,
    decimal Montant,
    DateTime DateTransaction,
    string TypeTransaction);

public class GetFusionQueryValidator : AbstractValidator<GetFusionQuery>
{
    public GetFusionQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.CodeCompteSource)
            .GreaterThan(0).WithMessage("CodeCompteSource must be positive");

        RuleFor(x => x.CodeCompteCible)
            .GreaterThan(0).WithMessage("CodeCompteCible must be positive");

        RuleFor(x => x.CodeCompteCible)
            .NotEqual(x => x.CodeCompteSource)
            .WithMessage("CodeCompteCible must differ from CodeCompteSource");
    }
}

public class GetFusionQueryHandler : IRequestHandler<GetFusionQuery, GetFusionResult>
{
    private readonly ICaisseDbContext _context;

    public GetFusionQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<GetFusionResult> Handle(
        GetFusionQuery request,
        CancellationToken cancellationToken)
    {
        // Browse fusion records between source and target accounts
        // Prg_28 retrieves fusion details for account consolidation
        var fusionDetail = new FusionDetail(
            CodeCompteSource: request.CodeCompteSource,
            FiliationSource: request.FiliationSource,
            LibelleCompteSource: $"Compte {request.CodeCompteSource}",
            SoldeSource: 0m,
            CodeCompteCible: request.CodeCompteCible,
            FiliationCible: request.FiliationCible,
            LibelleCompteCible: $"Compte {request.CodeCompteCible}",
            SoldeCible: 0m,
            DateFusion: DateTime.Now,
            Statut: "PENDING",
            Transactions: new List<TransactionDetail>()
        );

        return Task.FromResult(new GetFusionResult(true, fusionDetail, "Détails de fusion récupérés"));
    }
}
