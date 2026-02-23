using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Identification.Commands;

/// <summary>
/// Command pour effectuer une sélection/identification avec filtres complexes
/// Migration du programme Magic Prg_158 "Selection Identification"
/// Effectue une recherche filtrée de Great Members avec critères multiples
/// </summary>
public record SelectIdentificationCommand(
    string Societe,
    string? Nom = null,
    string? Prenom = null,
    int? CodeGm = null,
    int? Filiation = null,
    string? NumClub = null,
    string? TypeClient = null,
    string? Sexe = null
) : IRequest<SelectIdentificationResult>;

public record SelectIdentificationResult
{
    public bool Success { get; init; }
    public List<IdentifiedMember> Members { get; init; } = new();
    public int Total { get; init; }
    public string? Message { get; init; }
}

public record IdentifiedMember
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string Nom { get; init; } = string.Empty;
    public string Prenom { get; init; } = string.Empty;
    public string Sexe { get; init; } = string.Empty;
    public string TypeClient { get; init; } = string.Empty;
    public int NumClub { get; init; }
    public string Qualite { get; init; } = string.Empty;
    public string LangueParlee { get; init; } = string.Empty;
}

public class SelectIdentificationCommandValidator : AbstractValidator<SelectIdentificationCommand>
{
    public SelectIdentificationCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Nom)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Nom))
            .WithMessage("Nom must be at most 100 characters");

        RuleFor(x => x.Prenom)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Prenom))
            .WithMessage("Prenom must be at most 100 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).When(x => x.CodeGm.HasValue)
            .WithMessage("CodeGm must be greater than 0");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).When(x => x.Filiation.HasValue)
            .WithMessage("Filiation must be greater than or equal to 0");

        RuleFor(x => x.TypeClient)
            .MaximumLength(1).When(x => !string.IsNullOrEmpty(x.TypeClient))
            .WithMessage("TypeClient must be at most 1 character");

        RuleFor(x => x.Sexe)
            .MaximumLength(1).When(x => !string.IsNullOrEmpty(x.Sexe))
            .WithMessage("Sexe must be at most 1 character");
    }
}

public class SelectIdentificationCommandHandler : IRequestHandler<SelectIdentificationCommand, SelectIdentificationResult>
{
    private readonly ICaisseDbContext _context;

    public SelectIdentificationCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<SelectIdentificationResult> Handle(
        SelectIdentificationCommand request,
        CancellationToken cancellationToken)
    {
        // Construire la requête avec filtres multiples
        var query = _context.GmRecherches
            .AsNoTracking()
            .Where(g => g.Societe == request.Societe);

        // Appliquer les filtres optionnels
        if (!string.IsNullOrEmpty(request.Nom))
        {
            query = query.Where(g => g.Nom.Contains(request.Nom));
        }

        if (!string.IsNullOrEmpty(request.Prenom))
        {
            query = query.Where(g => g.Prenom.Contains(request.Prenom));
        }

        if (request.CodeGm.HasValue && request.CodeGm.Value > 0)
        {
            query = query.Where(g => g.CodeGm == request.CodeGm.Value);
        }

        if (request.Filiation.HasValue && request.Filiation.Value >= 0)
        {
            query = query.Where(g => g.FiliationVillag == request.Filiation.Value);
        }

        if (!string.IsNullOrEmpty(request.NumClub))
        {
            if (int.TryParse(request.NumClub, out int numClub))
            {
                query = query.Where(g => g.NumClub == numClub);
            }
        }

        if (!string.IsNullOrEmpty(request.TypeClient))
        {
            query = query.Where(g => g.TypeDeClient == request.TypeClient);
        }

        if (!string.IsNullOrEmpty(request.Sexe))
        {
            query = query.Where(g => g.Sexe == request.Sexe);
        }

        // Exécuter la requête
        var members = await query
            .OrderBy(g => g.Nom)
            .ThenBy(g => g.Prenom)
            .ToListAsync(cancellationToken);

        if (!members.Any())
        {
            return new SelectIdentificationResult
            {
                Success = true,
                Total = 0,
                Message = "No members found matching the criteria"
            };
        }

        // Construire les résultats
        var identifiedMembers = members.Select(gm => new IdentifiedMember
        {
            Societe = gm.Societe,
            CodeGm = gm.CodeGm,
            Filiation = gm.FiliationVillag,
            Nom = gm.Nom,
            Prenom = gm.Prenom,
            Sexe = gm.Sexe,
            TypeClient = gm.TypeDeClient,
            NumClub = gm.NumClub,
            Qualite = gm.Qualite,
            LangueParlee = gm.LangueParlee
        }).ToList();

        return new SelectIdentificationResult
        {
            Success = true,
            Members = identifiedMembers,
            Total = identifiedMembers.Count
        };
    }
}
