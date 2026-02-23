using Caisse.Application.Common;
using MediatR;

namespace Caisse.Application.Menus.Queries;

/// <summary>
/// Query for Prg_1: Menu Principal
/// Retrieves the main menu structure and available options
/// </summary>
public record GetMenuPrincipalQuery : IRequest<MenuPrincipalDto>;

public record MenuPrincipalDto(
    string NomMenu,
    List<MenuOptionDto> Options,
    bool CanAccessCaisse,
    bool CanAccessAdmin,
    bool CanAccessReports);

public record MenuOptionDto(
    int Id,
    string Code,
    string Label,
    string Description,
    bool IsEnabled);

public class GetMenuPrincipalQueryHandler : IRequestHandler<GetMenuPrincipalQuery, MenuPrincipalDto>
{
    private readonly ICaisseDbContext _context;

    public GetMenuPrincipalQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<MenuPrincipalDto> Handle(GetMenuPrincipalQuery request, CancellationToken cancellationToken)
    {
        // Get user rights from context (would be set from session/claims)
        var options = new List<MenuOptionDto>
        {
            new(1, "CAISSE", "Caisse", "Acces au module caisse", true),
            new(2, "ADMIN", "Administration", "Acces aux parametres", true),
            new(3, "REPORTS", "Etats", "Acces aux rapports", true),
            new(4, "IDENTIFICATION", "Identification", "Identification client", true),
            new(5, "GARANTIES", "Garanties", "Gestion des garanties", true)
        };

        return await Task.FromResult(new MenuPrincipalDto(
            "Menu Principal",
            options,
            true,
            true,
            true));
    }
}
