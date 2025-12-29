using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseParametresConfiguration : IEntityTypeConfiguration<CaisseParametres>
{
    public void Configure(EntityTypeBuilder<CaisseParametres> builder)
    {
        builder.ToTable("caisse_parametres");
        builder.HasNoKey();

        builder.Property(e => e.Cle).HasColumnName("cle").HasMaxLength(10);
        builder.Property(e => e.MopCmp).HasColumnName("mop_cmp").HasMaxLength(10);
        builder.Property(e => e.ClassOd).HasColumnName("class_od").HasMaxLength(10);
        builder.Property(e => e.CompteEcartGain).HasColumnName("compte_ecart_gain");
        builder.Property(e => e.CompteEcartPerte).HasColumnName("compte_ecart_perte");
        builder.Property(e => e.SupprimeComptesFinCentralise).HasColumnName("supprime_comptes_fin_centralise");
        builder.Property(e => e.SupprimeMopCentralise).HasColumnName("supprime_mop_centralise");
        builder.Property(e => e.ArticleCompteDerniereMinute).HasColumnName("article_compte_derniere_minute");
        builder.Property(e => e.CompteApproCaisse).HasColumnName("compte_appro_caisse");
        builder.Property(e => e.CompteRemiseCaisse).HasColumnName("compte_remise_caisse");
        builder.Property(e => e.CompteFdrReceptionniste).HasColumnName("compte_fdr_receptionniste");
        builder.Property(e => e.CompteBilanMini1).HasColumnName("compte_bilan_mini_1");
        builder.Property(e => e.CompteBilanMaxi1).HasColumnName("compte_bilan_maxi_1");
        builder.Property(e => e.SessionsCaisseAConserver).HasColumnName("sessions_caisse_a_conserver");
        builder.Property(e => e.ComptagesCoffreAConserver).HasColumnName("comptages_coffre_a_conserver");
        builder.Property(e => e.NumTerminalCaisseMini).HasColumnName("num_terminal_caisse_mini");
        builder.Property(e => e.NumTerminalCaisseMaxi).HasColumnName("num_terminal_caisse_maxi");
        builder.Property(e => e.CompteVersretraitNonCash).HasColumnName("compte_versretrait_non_cash");
        builder.Property(e => e.CompteVersretraitCash).HasColumnName("compte_versretrait_cash");
        builder.Property(e => e.SeparateurDecimalExcel).HasColumnName("separateur_decimal_excel").HasMaxLength(2);
        builder.Property(e => e.InitialisationAutomatique).HasColumnName("initialisation_automatique");
        builder.Property(e => e.PositionImsDansMagicini).HasColumnName("position_ims_dans_magicini");
        builder.Property(e => e.GestionCaisseAvec2Coffres).HasColumnName("gestion_caisse_avec_2_coffres").HasMaxLength(2);
        builder.Property(e => e.PositionXtrackDansMagicini).HasColumnName("position_xtrack_dans_magicini");
        builder.Property(e => e.Service1SansSessionIms).HasColumnName("service_1_sans_session_ims").HasMaxLength(10);
        builder.Property(e => e.Service2SansSessionIms).HasColumnName("service_2_sans_session_ims").HasMaxLength(10);
        builder.Property(e => e.Service3SansSessionIms).HasColumnName("service_3_sans_session_ims").HasMaxLength(10);
        builder.Property(e => e.Service4SansSessionIms).HasColumnName("service_4_sans_session_ims").HasMaxLength(10);
        builder.Property(e => e.Service5SansSessionIms).HasColumnName("service_5_sans_session_ims").HasMaxLength(10);
        builder.Property(e => e.CompteBoutique).HasColumnName("compte_boutique");
        builder.Property(e => e.ClotureAutomatique).HasColumnName("cloture_automatique").HasMaxLength(2);
        builder.Property(e => e.ActiviteBoutique).HasColumnName("activite_boutique");
        builder.Property(e => e.CodeABarresIms).HasColumnName("code_a_barres_ims");
        builder.Property(e => e.Buffer).HasColumnName("buffer").HasMaxLength(200);
    }
}
