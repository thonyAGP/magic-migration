using Caisse.Application.Common;
using MediatR;

namespace Caisse.Application.Menus.Queries;

/// <summary>
/// Query for Prg_216: Menu Telephone
/// Retrieves telephone-specific menu options and operations
/// </summary>
public record GetMenuTelephoneQuery : IRequest<MenuTelephoneDto>;

public record MenuTelephoneDto(
    string NomMenu,
    List<MenuTelephoneOperationDto> Operations,
    bool CanAffectCode,
    bool CanOpposition,
    bool CanViewDetails);

public record MenuTelephoneOperationDto(
    int Id,
    string Code,
    string Label,
    string Description,
    bool IsAvailable);

public class GetMenuTelephoneQueryHandler : IRequestHandler<GetMenuTelephoneQuery, MenuTelephoneDto>
{
    private readonly ICaisseDbContext _context;

    public GetMenuTelephoneQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<MenuTelephoneDto> Handle(GetMenuTelephoneQuery request, CancellationToken cancellationToken)
    {
        // Prg_216: Menu telephone operations
        var operations = new List<MenuTelephoneOperationDto>
        {
            new(1, "LECTURE", "Lecture Autocom", "Lire le code autocom d'un compte", true),
            new(2, "AFFECTATION", "Affectation Code", "Affecter un code autocom a un compte", true),
            new(3, "OPPOSITION", "Mise en Opposition", "Mettre un code autocom en opposition", true),
            new(4, "DETAIL", "Detail Appels", "Consulter le detail des appels", true),
            new(5, "FACTURATION", "Facturation", "Facturer les appels telephoniques", true)
        };

        return await Task.FromResult(new MenuTelephoneDto(
            "Menu Telephone",
            operations,
            true,
            true,
            true));
    }
}
