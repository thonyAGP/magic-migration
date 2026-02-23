using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Change.Queries;

/// <summary>
/// Query pour récupérer la devise locale
/// Migration du programme Magic Prg_21 "Récupère devise local"
/// </summary>
public record GetDeviseLocaleQuery(string Societe) : IRequest<GetDeviseLocaleResult>;

public record GetDeviseLocaleResult
{
    public bool Found { get; init; }
    public string CodeDevise { get; init; } = string.Empty;
    public string LibelleDevise { get; init; } = string.Empty;
    public int NbDecimales { get; init; }
    public string Symbole { get; init; } = string.Empty;
}

public class GetDeviseLocaleQueryValidator : AbstractValidator<GetDeviseLocaleQuery>
{
    public GetDeviseLocaleQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");
    }
}

public class GetDeviseLocaleQueryHandler : IRequestHandler<GetDeviseLocaleQuery, GetDeviseLocaleResult>
{
    private readonly ICaisseDbContext _context;

    public GetDeviseLocaleQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetDeviseLocaleResult> Handle(
        GetDeviseLocaleQuery request,
        CancellationToken cancellationToken)
    {
        // Récupérer la devise locale depuis les paramètres ou la première devise
        var deviseLocale = await _context.DevisesZoom
            .AsNoTracking()
            .Where(d => d.Societe == request.Societe)
            .OrderBy(d => d.Numero)
            .FirstOrDefaultAsync(cancellationToken);

        if (deviseLocale == null)
        {
            return new GetDeviseLocaleResult { Found = false };
        }

        // Chercher les détails dans la table de référence
        var deviseRef = await _context.DeviseReferences
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.CodeDevise == deviseLocale.CodeDevise, cancellationToken);

        return new GetDeviseLocaleResult
        {
            Found = true,
            CodeDevise = deviseLocale.CodeDevise,
            LibelleDevise = deviseRef?.Libelle ?? deviseLocale.Libelle,
            NbDecimales = deviseRef?.NombreDeDecimales ?? 2,
            Symbole = deviseLocale.CodeDevise // Fallback to code as symbol
        };
    }
}
