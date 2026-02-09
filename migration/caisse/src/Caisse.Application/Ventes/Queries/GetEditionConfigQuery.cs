using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to get edition/print configuration for the current terminal.
/// Used by ADH Web Lot 2 facade: GET /api/terminal/edition-config
/// </summary>
public record GetEditionConfigQuery : IRequest<EditionConfigResult>;

public record EditionConfigResult
{
    public string Format { get; init; } = "PMS28";
    public int PrinterId { get; init; }
    public string PrinterName { get; init; } = string.Empty;
}

public class GetEditionConfigQueryHandler : IRequestHandler<GetEditionConfigQuery, EditionConfigResult>
{
    public async Task<EditionConfigResult> Handle(
        GetEditionConfigQuery request,
        CancellationToken cancellationToken)
    {
        // TODO: Read from terminal configuration (parametres table or appsettings)
        // Stub: return default PMS28 config
        return await Task.FromResult(new EditionConfigResult
        {
            Format = "PMS28",
            PrinterId = 1,
            PrinterName = "Default Printer"
        });
    }
}
