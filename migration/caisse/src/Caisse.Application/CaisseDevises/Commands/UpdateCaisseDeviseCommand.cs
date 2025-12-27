using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.CaisseDevises.Commands;

public record UpdateCaisseDeviseCommand(
    string Utilisateur,
    string CodeDevise,
    string ModePaiement,
    string Quand,
    string Type,
    double Quantite) : IRequest<UpdateCaisseDeviseResult>;

public record UpdateCaisseDeviseResult(
    bool Success,
    bool Created = false,
    string? Error = null);

public class UpdateCaisseDeviseCommandHandler : IRequestHandler<UpdateCaisseDeviseCommand, UpdateCaisseDeviseResult>
{
    private readonly ICaisseDbContext _context;

    public UpdateCaisseDeviseCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateCaisseDeviseResult> Handle(
        UpdateCaisseDeviseCommand request,
        CancellationToken cancellationToken)
    {
        var existing = await _context.Devises
            .FirstOrDefaultAsync(d => d.Utilisateur == request.Utilisateur
                                   && d.CodeDevise == request.CodeDevise
                                   && d.ModePaiement == request.ModePaiement,
                cancellationToken);

        if (existing != null)
        {
            existing.UpdateQuantite(request.Quantite);
            await _context.SaveChangesAsync(cancellationToken);
            return new UpdateCaisseDeviseResult(true, Created: false);
        }

        var devise = CaisseDevise.Create(
            request.Utilisateur,
            request.CodeDevise,
            request.ModePaiement,
            request.Quand,
            request.Type,
            request.Quantite);

        _context.Devises.Add(devise);
        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateCaisseDeviseResult(true, Created: true);
    }
}
