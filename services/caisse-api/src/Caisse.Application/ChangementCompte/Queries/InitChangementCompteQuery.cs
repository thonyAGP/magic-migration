using Caisse.Application.Common;
using MediatR;

namespace Caisse.Application.ChangementCompte.Queries;

/// <summary>
/// Query pour initialiser le processus de changement de compte
/// Migration du programme Magic Prg_26 "Init Changement Compte"
/// </summary>
public record InitChangementCompteQuery(
    string Societe,
    int CodeAdherent,
    int Filiation
) : IRequest<InitChangementCompteResult>;

public record InitChangementCompteResult(
    bool Found,
    string Message = "",
    object? Data = null);

public class InitChangementCompteQueryHandler : IRequestHandler<InitChangementCompteQuery, InitChangementCompteResult>
{
    private readonly ICaisseDbContext _context;

    public InitChangementCompteQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<InitChangementCompteResult> Handle(
        InitChangementCompteQuery request,
        CancellationToken cancellationToken)
    {
        // Initialize context for account change process
        // Prg_26 is essentially an empty initialization task
        // It prepares the data structure for separation/fusion operations

        var initData = new
        {
            Societe = request.Societe,
            CodeAdherent = request.CodeAdherent,
            Filiation = request.Filiation,
            InitializationDate = DateTime.Now,
            Status = "INITIALIZED"
        };

        return Task.FromResult(new InitChangementCompteResult(
            true,
            "Initialization du changement de compte effectuée",
            initData));
    }
}
