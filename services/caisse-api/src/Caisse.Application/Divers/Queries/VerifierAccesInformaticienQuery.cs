using FluentValidation;
using MediatR;

namespace Caisse.Application.Divers.Queries;

/// <summary>
/// Query pour verifier l'acces informaticien
/// Migration du programme Magic Prg_42 "Controle Login Informaticien"
/// Note: Version simplifiee utilisant une liste interne (pas de table Parametres generiques)
/// </summary>
public record VerifierAccesInformaticienQuery(
    string Societe,
    string CodeUtilisateur,
    bool SupprimerMessages = false
) : IRequest<VerifierAccesInformaticienResult>;

public record VerifierAccesInformaticienResult
{
    public bool EstAutorise { get; init; }
    public string CodeUtilisateur { get; init; } = string.Empty;
    public string? MessageErreur { get; init; }
    public string? RoleUtilisateur { get; init; }
}

public class VerifierAccesInformaticienQueryValidator : AbstractValidator<VerifierAccesInformaticienQuery>
{
    public VerifierAccesInformaticienQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeUtilisateur)
            .NotEmpty().WithMessage("CodeUtilisateur is required")
            .MaximumLength(20).WithMessage("CodeUtilisateur must be at most 20 characters");
    }
}

public class VerifierAccesInformaticienQueryHandler : IRequestHandler<VerifierAccesInformaticienQuery, VerifierAccesInformaticienResult>
{
    // Liste des codes utilisateur autorises (INFORMATICIEN dans Magic)
    private static readonly HashSet<string> CodesInformaticiens = new(StringComparer.OrdinalIgnoreCase)
    {
        "INFORMATICIEN",
        "ADMIN",
        "SYSADMIN",
        "IT",
        "TECH"
    };

    public Task<VerifierAccesInformaticienResult> Handle(
        VerifierAccesInformaticienQuery request,
        CancellationToken cancellationToken)
    {
        // Verifier si l'utilisateur est dans la liste des informaticiens
        var estInformaticien = CodesInformaticiens.Contains(request.CodeUtilisateur);

        if (estInformaticien)
        {
            return Task.FromResult(new VerifierAccesInformaticienResult
            {
                EstAutorise = true,
                CodeUtilisateur = request.CodeUtilisateur,
                RoleUtilisateur = "INFORMATICIEN"
            });
        }

        return Task.FromResult(new VerifierAccesInformaticienResult
        {
            EstAutorise = false,
            CodeUtilisateur = request.CodeUtilisateur,
            MessageErreur = request.SupprimerMessages ? null : "Non autorise - Acces reserve aux informaticiens",
            RoleUtilisateur = "STANDARD"
        });
    }
}
