using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Identification.Queries;

/// <summary>
/// Query pour vérifier l'identification d'un opérateur
/// Migration du programme Magic Prg_158 "Selection Identification"
/// </summary>
public record VerifierOperateurQuery(
    string Societe,
    string CodeOperateur,
    string MotDePasse
) : IRequest<VerifierOperateurResult>;

public record VerifierOperateurResult
{
    public bool Authentifie { get; init; }
    public string CodeOperateur { get; init; } = string.Empty;
    public string NomOperateur { get; init; } = string.Empty;
    public string? Message { get; init; }
    public List<string> Droits { get; init; } = new();
    public bool PeutOuvrirCaisse { get; init; }
    public bool PeutFermerCaisse { get; init; }
    public bool PeutAnnuler { get; init; }
    public bool PeutConsulter { get; init; }
}

public class VerifierOperateurQueryValidator : AbstractValidator<VerifierOperateurQuery>
{
    public VerifierOperateurQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeOperateur)
            .NotEmpty().WithMessage("CodeOperateur is required")
            .MaximumLength(10).WithMessage("CodeOperateur must be at most 10 characters");

        RuleFor(x => x.MotDePasse)
            .NotEmpty().WithMessage("MotDePasse is required")
            .MaximumLength(50).WithMessage("MotDePasse must be at most 50 characters");
    }
}

public class VerifierOperateurQueryHandler : IRequestHandler<VerifierOperateurQuery, VerifierOperateurResult>
{
    private readonly ICaisseDbContext _context;

    public VerifierOperateurQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<VerifierOperateurResult> Handle(
        VerifierOperateurQuery request,
        CancellationToken cancellationToken)
    {
        // Note: Dans une implémentation réelle, on vérifierait l'opérateur dans une table users
        // Pour l'instant, on retourne un résultat simple

        // Vérifier si l'opérateur a une session ouverte
        var sessionActive = await _context.Sessions
            .AsNoTracking()
            .AnyAsync(s =>
                s.Utilisateur == request.CodeOperateur &&
                s.EstOuverte,
                cancellationToken);

        // Simuler une vérification (dans la réalité, on vérifierait le mot de passe haché)
        var estValide = !string.IsNullOrEmpty(request.MotDePasse);

        if (!estValide)
        {
            return new VerifierOperateurResult
            {
                Authentifie = false,
                CodeOperateur = request.CodeOperateur,
                Message = "Identifiants invalides"
            };
        }

        return new VerifierOperateurResult
        {
            Authentifie = true,
            CodeOperateur = request.CodeOperateur,
            NomOperateur = request.CodeOperateur, // Serait récupéré de la table users
            Droits = new List<string> { "CAISSE", "VENTES", "CONSULTATION" },
            PeutOuvrirCaisse = true,
            PeutFermerCaisse = true,
            PeutAnnuler = true,
            PeutConsulter = true
        };
    }
}
