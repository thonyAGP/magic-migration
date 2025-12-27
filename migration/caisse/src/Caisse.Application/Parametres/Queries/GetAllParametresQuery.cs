using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Parametres.Queries;

public record GetAllParametresQuery() : IRequest<List<ParametresDto>>;

public class GetAllParametresQueryHandler : IRequestHandler<GetAllParametresQuery, List<ParametresDto>>
{
    private readonly ICaisseDbContext _context;

    public GetAllParametresQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<ParametresDto>> Handle(
        GetAllParametresQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.Parametres
            .Select(p => new ParametresDto(
                p.Cle,
                p.MopCmp,
                p.ClassOd,
                p.CompteEcartGain,
                p.CompteEcartPerte,
                p.SupprimeComptesFinCentralise,
                p.SupprimeMopCentralise,
                p.ArticleCompteDerniereMinute,
                p.CompteApproCaisse,
                p.CompteRemiseCaisse,
                p.CompteFdrReceptionniste,
                p.CompteBilanMini1,
                p.CompteBilanMaxi1,
                p.SessionsCaisseAConserver,
                p.ComptagesCoffreAConserver,
                p.NumTerminalCaisseMini,
                p.NumTerminalCaisseMaxi,
                p.CompteVersretraitNonCash,
                p.CompteVersretraitCash,
                p.SeparateurDecimalExcel,
                p.InitialisationAutomatique,
                p.GestionCaisseAvec2Coffres,
                p.CompteBoutique,
                p.ClotureAutomatique,
                p.ActiviteBoutique,
                p.CodeABarresIms))
            .ToListAsync(cancellationToken);
    }
}
