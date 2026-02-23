using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Telephone.Queries;

/// <summary>
/// Query pour récupérer les lignes téléphoniques d'un compte
/// Migration du programme Magic Prg_202 "Lecture Autocom"
/// </summary>
public record GetLigneTelephoneQuery(
    string Societe,
    int CodeGm,
    int Filiation
) : IRequest<GetLigneTelephoneResult>;

public record GetLigneTelephoneResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public int NombreLignes { get; init; }
    public List<LigneTelephoneDto> Lignes { get; init; } = new();
}

public record LigneTelephoneDto
{
    public string NumeroPoste { get; init; } = string.Empty;
    public string NumeroLigne { get; init; } = string.Empty;
    public string CodeAutocom { get; init; } = string.Empty;
    public string Etat { get; init; } = string.Empty;
    public string EtatLibelle { get; init; } = string.Empty;
    public DateOnly? DateOuverture { get; init; }
    public TimeOnly? HeureOuverture { get; init; }
    public DateOnly? DateFermeture { get; init; }
    public string NumChambre { get; init; } = string.Empty;
    public bool IsOpen { get; init; }
}

public class GetLigneTelephoneQueryValidator : AbstractValidator<GetLigneTelephoneQuery>
{
    public GetLigneTelephoneQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");
    }
}

public class GetLigneTelephoneQueryHandler : IRequestHandler<GetLigneTelephoneQuery, GetLigneTelephoneResult>
{
    private readonly ICaisseDbContext _context;

    public GetLigneTelephoneQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetLigneTelephoneResult> Handle(
        GetLigneTelephoneQuery request,
        CancellationToken cancellationToken)
    {
        var lignes = await _context.LignesTelephone
            .AsNoTracking()
            .Where(l =>
                l.Societe == request.Societe &&
                l.CodeGm == request.CodeGm &&
                l.Filiation == request.Filiation)
            .OrderBy(l => l.NumeroPoste)
            .Select(l => new LigneTelephoneDto
            {
                NumeroPoste = l.NumeroPoste,
                NumeroLigne = l.NumeroLigne,
                CodeAutocom = l.CodeAutocom,
                Etat = l.Etat,
                EtatLibelle = l.Etat == "O" ? "Ouvert" :
                              l.Etat == "F" ? "Fermé" :
                              l.Etat == "B" ? "Bloqué" : "Inconnu",
                DateOuverture = l.DateOuverture,
                HeureOuverture = l.HeureOuverture,
                DateFermeture = l.DateFermeture,
                NumChambre = l.NumChambre,
                IsOpen = l.Etat == "O"
            })
            .ToListAsync(cancellationToken);

        return new GetLigneTelephoneResult
        {
            Found = lignes.Count > 0,
            Societe = request.Societe,
            CodeGm = request.CodeGm,
            Filiation = request.Filiation,
            NombreLignes = lignes.Count,
            Lignes = lignes
        };
    }
}
