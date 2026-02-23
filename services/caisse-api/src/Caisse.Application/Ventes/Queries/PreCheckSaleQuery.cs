using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Pre-check before sale: verify reseau_cloture + test compte_gm.
/// Used by ADH Web Lot 2 facade: GET /api/transactions/pre-check
/// </summary>
public record PreCheckSaleQuery : IRequest<PreCheckSaleResult>;

public record PreCheckSaleResult
{
    public bool CanSell { get; init; }
    public string? Reason { get; init; }
}

public class PreCheckSaleQueryHandler : IRequestHandler<PreCheckSaleQuery, PreCheckSaleResult>
{
    public async Task<PreCheckSaleResult> Handle(
        PreCheckSaleQuery request,
        CancellationToken cancellationToken)
    {
        // TODO: Implement actual checks:
        // 1. Verify reseau_cloture (network not closed)
        // 2. Test compte_gm availability
        // For now, always allow sales (stub)
        return await Task.FromResult(new PreCheckSaleResult
        {
            CanSell = true,
            Reason = null
        });
    }
}
