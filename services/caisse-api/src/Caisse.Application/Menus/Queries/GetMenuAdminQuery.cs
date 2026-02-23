using Caisse.Application.Common;
using MediatR;

namespace Caisse.Application.Menus.Queries;

/// <summary>
/// Query for Prg_3: Menu Administration
/// Retrieves administration menu options and system management features
/// </summary>
public record GetMenuAdminQuery : IRequest<MenuAdminDto>;

public record MenuAdminDto(
    string NomMenu,
    List<MenuAdminOptionDto> Options,
    bool CanManageUsers,
    bool CanManageRights,
    bool CanManageSystemConfig);

public record MenuAdminOptionDto(
    int Id,
    string Code,
    string Label,
    string Description,
    bool IsAccessible);

public class GetMenuAdminQueryHandler : IRequestHandler<GetMenuAdminQuery, MenuAdminDto>
{
    private readonly ICaisseDbContext _context;

    public GetMenuAdminQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<MenuAdminDto> Handle(GetMenuAdminQuery request, CancellationToken cancellationToken)
    {
        var options = new List<MenuAdminOptionDto>
        {
            new(1, "PARAMETRES", "Parametres", "Configuration systeme", true),
            new(2, "UTILISATEURS", "Gestion Utilisateurs", "Creer et gerer les utilisateurs", true),
            new(3, "DROITS", "Gestion Droits", "Configurer les droits d'acces", true),
            new(4, "DEVISES", "Gestion Devises", "Configuration des devises acceptees", true),
            new(5, "ARTICLES", "Gestion Articles", "Maintenir la base articles", true),
            new(6, "CLIENTS", "Gestion Clients", "Maintenir la base clients", true),
            new(7, "COMPTABILITE", "Configuration Comptabilite", "Parametres comptables", true),
            new(8, "SAUVEGARDES", "Sauvegardes", "Gerer les sauvegardes", true),
            new(9, "RAPPORTS", "Rapports", "Generer les rapports systemme", true),
            new(10, "AUDIT", "Audit", "Consulter les logs d'audit", true)
        };

        return await Task.FromResult(new MenuAdminDto(
            "Menu Administration",
            options,
            true,
            true,
            true));
    }
}
