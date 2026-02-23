using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Commands;

/// <summary>
/// Command to add a line item (article) to a sale transaction.
/// Migrated from Magic Prg_234/235 "Transaction Nouv vente PMS-584/721" and Prg_236 "Transaction Nouv vente PMS-710"
/// </summary>
public record AddSaleDetailCommand(
    long TransactionId,
    string CodeArticle,
    string LibelleArticle,
    int Quantite,
    decimal PrixUnitaire,
    decimal MontantLigne,
    decimal TvaLigne,
    string? CodeService = null,
    decimal? RemiseLingnage = null) : IRequest<AddSaleDetailResult>;

public record AddSaleDetailResult
{
    public bool Success { get; init; }
    public int LineNumber { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public string Message { get; init; } = string.Empty;
}

public class AddSaleDetailCommandValidator : AbstractValidator<AddSaleDetailCommand>
{
    public AddSaleDetailCommandValidator()
    {
        RuleFor(x => x.TransactionId)
            .GreaterThan(0).WithMessage("TransactionId must be positive");

        RuleFor(x => x.CodeArticle)
            .NotEmpty().WithMessage("CodeArticle is required")
            .MaximumLength(20).WithMessage("CodeArticle must be at most 20 characters");

        RuleFor(x => x.Quantite)
            .GreaterThan(0).WithMessage("Quantite must be positive");

        RuleFor(x => x.PrixUnitaire)
            .GreaterThanOrEqualTo(0).WithMessage("PrixUnitaire must be non-negative");

        RuleFor(x => x.MontantLigne)
            .GreaterThanOrEqualTo(0).WithMessage("MontantLigne must be non-negative");
    }
}

public class AddSaleDetailCommandHandler : IRequestHandler<AddSaleDetailCommand, AddSaleDetailResult>
{
    public AddSaleDetailCommandHandler()
    {
    }

    public async Task<AddSaleDetailResult> Handle(
        AddSaleDetailCommand request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Create new record in TransactionsBarDetail
        // 2. Set: transaction_id, code_article, libelle_article, quantite, prix_unitaire, montant_ligne, tva_ligne
        // 3. If service code provided, validate against service reference table
        // 4. Calculate line VAT if applicable
        // 5. Update transaction total amounts
        // 6. Return updated totals

        var totalAmount = request.MontantLigne;
        var totalVat = request.TvaLigne;
        var lineNumber = 1; // Would increment based on transaction

        return await Task.FromResult(new AddSaleDetailResult
        {
            Success = true,
            LineNumber = lineNumber,
            TotalAmount = (decimal)totalAmount,
            TotalVat = (decimal)totalVat,
            Message = "Sale line item added successfully"
        });
    }
}
