using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Queries;

/// <summary>
/// Query pour récupérer les types de garantie avec zoom
/// Migration du programme Magic Prg_113 "Zoom Garantie Type"
/// </summary>
public record GetGarantieTypesQuery(
    string Societe,
    string? CodeClasse = null) : IRequest<GetGarantieTypesResult>;

public record GetGarantieTypesResult
{
    public List<TypeGarantieDetailDto> Types { get; init; } = new();
    public int Total { get; init; }
    public List<string> ClassesDisponibles { get; init; } = new();
}

public record TypeGarantieDetailDto
{
    public string CodeGarantie { get; init; } = string.Empty;
    public string Libelle { get; init; } = string.Empty;
    public string CodeClasse { get; init; } = string.Empty;
    public double MontantDefaut { get; init; }
    public string CodeModif { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public class GetGarantieTypesQueryValidator : AbstractValidator<GetGarantieTypesQuery>
{
    public GetGarantieTypesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");
    }
}

public class GetGarantieTypesQueryHandler : IRequestHandler<GetGarantieTypesQuery, GetGarantieTypesResult>
{
    private readonly ICaisseDbContext _context;

    public GetGarantieTypesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetGarantieTypesResult> Handle(
        GetGarantieTypesQuery request,
        CancellationToken cancellationToken)
    {
        // Recuperer tous les types de garantie
        var query = _context.Garanties
            .AsNoTracking()
            .Where(g => g.Societe == request.Societe);

        if (!string.IsNullOrEmpty(request.CodeClasse))
        {
            query = query.Where(g => g.CodeClasse == request.CodeClasse);
        }

        var types = await query
            .OrderBy(g => g.CodeClasse)
            .ThenBy(g => g.CodeGarantie)
            .Select(g => new TypeGarantieDetailDto
            {
                CodeGarantie = g.CodeGarantie,
                Libelle = g.Libelle,
                CodeClasse = g.CodeClasse,
                MontantDefaut = g.Montant,
                CodeModif = g.CodeModif,
                IsActive = true // To be refined based on business logic
            })
            .ToListAsync(cancellationToken);

        // Recuperer les classes disponibles
        var classesDisponibles = await _context.Garanties
            .AsNoTracking()
            .Where(g => g.Societe == request.Societe)
            .Select(g => g.CodeClasse)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return new GetGarantieTypesResult
        {
            Types = types,
            Total = types.Count,
            ClassesDisponibles = classesDisponibles
        };
    }
}
