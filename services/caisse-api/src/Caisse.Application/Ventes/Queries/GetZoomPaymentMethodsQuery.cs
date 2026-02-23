using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve payment methods and modes (zoom/lookup).
/// Migrated from Magic Prg_254 "Zoom mode paiement change GM" and Prg_255 "Zoom modes de paiement"
/// </summary>
public record GetZoomPaymentMethodsQuery(
    string Societe,
    int? CodeGm = null,
    string? SearchTerm = null,
    int Limit = 100) : IRequest<GetZoomPaymentMethodsResult>;

public record GetZoomPaymentMethodsResult
{
    public bool Found { get; init; }
    public int TotalCount { get; init; }
    public List<PaymentMethodZoomDto> PaymentMethods { get; init; } = new();
}

public record PaymentMethodZoomDto
{
    public string CodePaiement { get; init; } = string.Empty;
    public string LibellePaiement { get; init; } = string.Empty;
    public string DescriptionPaiement { get; init; } = string.Empty;
    public bool Actif { get; init; }
    public bool RequiresChange { get; init; } // Whether change calculation is needed
    public string TypePaiement { get; init; } = string.Empty; // CASH, CARD, CHECK, etc.
}

public class GetZoomPaymentMethodsQueryValidator : AbstractValidator<GetZoomPaymentMethodsQuery>
{
    public GetZoomPaymentMethodsQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).When(x => x.CodeGm.HasValue).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 500).WithMessage("Limit must be between 1 and 500");
    }
}

public class GetZoomPaymentMethodsQueryHandler : IRequestHandler<GetZoomPaymentMethodsQuery, GetZoomPaymentMethodsResult>
{
    public GetZoomPaymentMethodsQueryHandler()
    {
    }

    public async Task<GetZoomPaymentMethodsResult> Handle(
        GetZoomPaymentMethodsQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query payment methods from reference table filtered by societe
        // 2. If CodeGm provided, filter by GM-specific payment method restrictions
        // 3. Apply search filter if provided
        // 4. Filter for active methods only
        // 5. Sort by code_paiement
        // 6. Include whether change calculation is required
        // 7. Limit results
        // 8. Return for payment method selection

        // Placeholder implementation
        return await Task.FromResult(new GetZoomPaymentMethodsResult
        {
            Found = false,
            TotalCount = 0,
            PaymentMethods = new()
        });
    }
}
