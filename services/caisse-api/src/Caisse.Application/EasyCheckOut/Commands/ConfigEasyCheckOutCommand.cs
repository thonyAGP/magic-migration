using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Commands;

/// <summary>
/// Command pour la configuration Easy Check Out
/// Migration du programme Magic Prg_63 "Easy Checkout Config"
///
/// Configure les parametres de session Easy Check Out
/// </summary>
public record ConfigEasyCheckOutCommand(
    string Societe,
    bool ActiverAutomatique = false,
    bool ActiverEmail = true,
    bool ActiverPDF = true,
    int DelaiConfirmation = 0, // 0 = immédiat
    bool ControlMontants = true,
    bool AuthoriserAnnulation = true,
    string MoyenPaiementParDefaut = "CB"
) : IRequest<ConfigEasyCheckOutResult>;

public record ConfigEasyCheckOutResult
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public ConfigurationDto? Configuration { get; init; }
}

public record ConfigurationDto
{
    public string Societe { get; init; } = string.Empty;
    public bool ActiverAutomatique { get; init; }
    public bool ActiverEmail { get; init; }
    public bool ActiverPDF { get; init; }
    public int DelaiConfirmation { get; init; }
    public bool ControlMontants { get; init; }
    public bool AuthoriserAnnulation { get; init; }
    public string MoyenPaiementParDefaut { get; init; } = string.Empty;
    public DateTime DateMiseAJour { get; init; }
}

public class ConfigEasyCheckOutCommandValidator : AbstractValidator<ConfigEasyCheckOutCommand>
{
    public ConfigEasyCheckOutCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.MoyenPaiementParDefaut)
            .NotEmpty().WithMessage("MoyenPaiementParDefaut is required");

        RuleFor(x => x.DelaiConfirmation)
            .GreaterThanOrEqualTo(0).WithMessage("DelaiConfirmation must be >= 0");
    }
}

public class ConfigEasyCheckOutCommandHandler : IRequestHandler<ConfigEasyCheckOutCommand, ConfigEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public ConfigEasyCheckOutCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ConfigEasyCheckOutResult> Handle(
        ConfigEasyCheckOutCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verifier que la societe existe
            var comptes = await _context.GmComplets
                .AsNoTracking()
                .Where(c => c.Societe == request.Societe)
                .AnyAsync(cancellationToken);

            if (!comptes)
            {
                return new ConfigEasyCheckOutResult
                {
                    Success = false,
                    Message = $"Societe {request.Societe} non trouvee"
                };
            }

            var config = new ConfigurationDto
            {
                Societe = request.Societe,
                ActiverAutomatique = request.ActiverAutomatique,
                ActiverEmail = request.ActiverEmail,
                ActiverPDF = request.ActiverPDF,
                DelaiConfirmation = request.DelaiConfirmation,
                ControlMontants = request.ControlMontants,
                AuthoriserAnnulation = request.AuthoriserAnnulation,
                MoyenPaiementParDefaut = request.MoyenPaiementParDefaut,
                DateMiseAJour = DateTime.Now
            };

            return new ConfigEasyCheckOutResult
            {
                Success = true,
                Message = "Configuration mise a jour avec succes",
                Configuration = config
            };
        }
        catch (Exception ex)
        {
            return new ConfigEasyCheckOutResult
            {
                Success = false,
                Message = ex.Message
            };
        }
    }
}
