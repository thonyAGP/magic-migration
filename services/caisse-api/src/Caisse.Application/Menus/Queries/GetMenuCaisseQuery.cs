using Caisse.Application.Common;
using MediatR;

namespace Caisse.Application.Menus.Queries;

/// <summary>
/// Query for Prg_2: Menu Caisse
/// Retrieves caisse-specific menu options and operations
/// </summary>
public record GetMenuCaisseQuery : IRequest<MenuCaisseDto>;

public record MenuCaisseDto(
    string NomMenu,
    List<MenuOperationDto> Operations,
    bool CanOpenCaisse,
    bool CanCloseCaisse,
    bool CanPerformOperations);

public record MenuOperationDto(
    int Id,
    string Code,
    string Label,
    string Description,
    bool IsAvailable);

public class GetMenuCaisseQueryHandler : IRequestHandler<GetMenuCaisseQuery, MenuCaisseDto>
{
    private readonly ICaisseDbContext _context;

    public GetMenuCaisseQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<MenuCaisseDto> Handle(GetMenuCaisseQuery request, CancellationToken cancellationToken)
    {
        var operations = new List<MenuOperationDto>
        {
            new(1, "OUVERTURE", "Ouverture Caisse", "Ouvrir une nouvelle session caisse", true),
            new(2, "VENTES", "Gestion Ventes", "Enregistrer et gerer les ventes", true),
            new(3, "ENCAISSER", "Encaisser", "Traiter les paiements", true),
            new(4, "CHANGE", "Change", "Operations de change de devises", true),
            new(5, "REMISE", "Remises", "Gerer les remises et promotions", true),
            new(6, "CLOTURE", "Cloture Caisse", "Fermer une session caisse", true),
            new(7, "ARTICLES", "Gestion Articles", "Consulter et gerer les articles", true),
            new(8, "CLIENTS", "Gestion Clients", "Rechercher et gerer les clients", true)
        };

        return await Task.FromResult(new MenuCaisseDto(
            "Menu Caisse",
            operations,
            true,
            true,
            true));
    }
}
