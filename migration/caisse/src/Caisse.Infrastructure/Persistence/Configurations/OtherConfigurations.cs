using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionArticleConfiguration : IEntityTypeConfiguration<CaisseSessionArticle>
{
    public void Configure(EntityTypeBuilder<CaisseSessionArticle> builder)
    {
        builder.ToTable("caisse_session_article");
        builder.HasKey(x => new { x.Utilisateur, x.ChronoSession, x.ChronoDetail });

        builder.Property(x => x.Utilisateur).HasColumnName("utilisateur").HasMaxLength(8).IsRequired();
        builder.Property(x => x.ChronoSession).HasColumnName("chrono_session").IsRequired();
        builder.Property(x => x.ChronoDetail).HasColumnName("chrono_detail").IsRequired();
        builder.Property(x => x.CodeArticle).HasColumnName("code_article").IsRequired();
        builder.Property(x => x.LibelleArticle).HasColumnName("libelle_article").HasMaxLength(32).IsRequired();
        builder.Property(x => x.PrixUnitaire).HasColumnName("prix_unitaire").IsRequired();
        builder.Property(x => x.Quantite).HasColumnName("quantite").IsRequired();
        builder.Property(x => x.Montant).HasColumnName("montant").IsRequired();
        builder.Property(x => x.Date).HasColumnName("date").HasMaxLength(8).IsFixedLength().IsRequired();
        builder.Property(x => x.Heure).HasColumnName("heure").HasMaxLength(6).IsFixedLength().IsRequired();
    }
}

public class CaisseSessionDeviseConfiguration : IEntityTypeConfiguration<CaisseSessionDevise>
{
    public void Configure(EntityTypeBuilder<CaisseSessionDevise> builder)
    {
        builder.ToTable("caisse_session_devise");
        builder.HasKey(x => new { x.Utilisateur, x.ChronoSession, x.ChronoDetail });

        builder.Property(x => x.Utilisateur).HasColumnName("utilisateur").HasMaxLength(8).IsRequired();
        builder.Property(x => x.ChronoSession).HasColumnName("chrono_session").IsRequired();
        builder.Property(x => x.ChronoDetail).HasColumnName("chrono_detail").IsRequired();
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(1).IsRequired();
        builder.Property(x => x.Quand).HasColumnName("quand").HasMaxLength(1).IsRequired();
        builder.Property(x => x.CodeDevise).HasColumnName("code_devise").HasMaxLength(3).IsRequired();
        builder.Property(x => x.ModePaiement).HasColumnName("mode_paiement").HasMaxLength(4).IsRequired();
        builder.Property(x => x.Quantite).HasColumnName("quantite").IsRequired();
        builder.Property(x => x.Date).HasColumnName("date").HasMaxLength(8).IsFixedLength().IsRequired();
        builder.Property(x => x.Heure).HasColumnName("heure").HasMaxLength(6).IsFixedLength().IsRequired();
    }
}

public class CaisseDeviseConfiguration : IEntityTypeConfiguration<CaisseDevise>
{
    public void Configure(EntityTypeBuilder<CaisseDevise> builder)
    {
        builder.ToTable("caisse_devise");
        builder.HasKey(x => new { x.Utilisateur, x.CodeDevise, x.ModePaiement });

        builder.Property(x => x.Utilisateur).HasColumnName("utilisateur").HasMaxLength(8).IsRequired();
        builder.Property(x => x.CodeDevise).HasColumnName("code_devise").HasMaxLength(6).IsRequired();
        builder.Property(x => x.ModePaiement).HasColumnName("mode_paiement").HasMaxLength(8).IsRequired();
        builder.Property(x => x.Quand).HasColumnName("quand").HasMaxLength(2).IsRequired();
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(2).IsRequired();
        builder.Property(x => x.Quantite).HasColumnName("quantite").IsRequired();
    }
}

public class CaisseSessionCoffre2Configuration : IEntityTypeConfiguration<CaisseSessionCoffre2>
{
    public void Configure(EntityTypeBuilder<CaisseSessionCoffre2> builder)
    {
        builder.ToTable("caisse_session_coffre2");
        builder.HasKey(x => new { x.Utilisateur, x.Chrono });

        builder.Property(x => x.DateOuvertureCaisse90).HasColumnName("date_ouverture_caisse_90").HasMaxLength(8).IsFixedLength().IsRequired();
        builder.Property(x => x.HeureOuvertureCaisse90).HasColumnName("heure_ouverture_caisse_90").HasMaxLength(6).IsFixedLength().IsRequired();
        builder.Property(x => x.Chrono).HasColumnName("chrono").IsRequired();
        builder.Property(x => x.Utilisateur).HasColumnName("utilisateur").HasMaxLength(8).IsRequired();
    }
}

public class CaisseParametresConfiguration : IEntityTypeConfiguration<CaisseParametres>
{
    public void Configure(EntityTypeBuilder<CaisseParametres> builder)
    {
        builder.ToTable("caisse_parametres");
        builder.HasKey(x => x.Cle);

        builder.Property(x => x.Cle).HasColumnName("cle").HasMaxLength(12).IsRequired();
        builder.Property(x => x.MopCmp).HasColumnName("mop_cmp").HasMaxLength(8).IsRequired();
        builder.Property(x => x.ClassOd).HasColumnName("class_od").HasMaxLength(12).IsRequired();
        builder.Property(x => x.CompteEcartGain).HasColumnName("compte_ecart_gain").IsRequired();
        builder.Property(x => x.CompteEcartPerte).HasColumnName("compte_ecart_perte").IsRequired();
        builder.Property(x => x.SupprimeComptesFinCentralise).HasColumnName("supprime_comptes_fin_centralise").IsRequired();
        builder.Property(x => x.SupprimeMopCentralise).HasColumnName("supprime_mop_centralise").IsRequired();
        builder.Property(x => x.ArticleCompteDerniereMinute).HasColumnName("article_compte_derniere_minute").IsRequired();
        builder.Property(x => x.CompteApproCaisse).HasColumnName("compte_appro_caisse").IsRequired();
        builder.Property(x => x.CompteRemiseCaisse).HasColumnName("compte_remise_caisse").IsRequired();
        builder.Property(x => x.CompteFdrReceptionniste).HasColumnName("compte_fdr_receptionniste").IsRequired();
        builder.Property(x => x.CompteBilanMini1).HasColumnName("compte_bilan_mini_1").IsRequired();
        builder.Property(x => x.CompteBilanMaxi1).HasColumnName("compte_bilan_maxi_1").IsRequired();
        builder.Property(x => x.SessionsCaisseAConserver).HasColumnName("sessions_caisse_a_conserver").IsRequired();
        builder.Property(x => x.ComptagesCoffreAConserver).HasColumnName("comptages_coffre_a_conserver").IsRequired();
        builder.Property(x => x.NumTerminalCaisseMini).HasColumnName("num_terminal_caisse_mini").IsRequired();
        builder.Property(x => x.NumTerminalCaisseMaxi).HasColumnName("num_terminal_caisse_maxi").IsRequired();
        builder.Property(x => x.CompteVersretraitNonCash).HasColumnName("compte_versretrait_non_cash").IsRequired();
        builder.Property(x => x.CompteVersretraitCash).HasColumnName("compte_versretrait_cash").IsRequired();
        builder.Property(x => x.SeparateurDecimalExcel).HasColumnName("separateur_decimal_excel").HasMaxLength(2).IsRequired();
        builder.Property(x => x.InitialisationAutomatique).HasColumnName("initialisation_automatique").IsRequired();
        builder.Property(x => x.PositionImsDansMagicini).HasColumnName("position_ims_dans_magicini").IsRequired();
        builder.Property(x => x.GestionCaisseAvec2Coffres).HasColumnName("gestion_caisse_avec_2_coffres").HasMaxLength(2).IsRequired();
        builder.Property(x => x.PositionXtrackDansMagicini).HasColumnName("position_xtrack_dans_magicini").IsRequired();
        builder.Property(x => x.Service1SansSessionIms).HasColumnName("service_1_sans_session_ims").HasMaxLength(4).IsRequired();
        builder.Property(x => x.Service2SansSessionIms).HasColumnName("service_2_sans_session_ims").HasMaxLength(4).IsRequired();
        builder.Property(x => x.Service3SansSessionIms).HasColumnName("service_3_sans_session_ims").HasMaxLength(4).IsRequired();
        builder.Property(x => x.Service4SansSessionIms).HasColumnName("service_4_sans_session_ims").HasMaxLength(4).IsRequired();
        builder.Property(x => x.Service5SansSessionIms).HasColumnName("service_5_sans_session_ims").HasMaxLength(4).IsRequired();
        builder.Property(x => x.CompteBoutique).HasColumnName("compte_boutique").IsRequired();
        builder.Property(x => x.ClotureAutomatique).HasColumnName("cloture_automatique").HasMaxLength(2).IsRequired();
        builder.Property(x => x.ActiviteBoutique).HasColumnName("activite_boutique").IsRequired();
        builder.Property(x => x.CodeABarresIms).HasColumnName("code_a_barres_ims").IsRequired();
        builder.Property(x => x.Buffer).HasColumnName("buffer").HasMaxLength(198).IsRequired();
    }
}

public class DeviseReferenceConfiguration : IEntityTypeConfiguration<DeviseReference>
{
    public void Configure(EntityTypeBuilder<DeviseReference> builder)
    {
        builder.ToTable("devisein_par");
        builder.HasKey(x => x.CodeDevise);

        builder.Property(x => x.CodeDevise).HasColumnName("code_devise").HasMaxLength(8).IsRequired();
        builder.Property(x => x.Libelle).HasColumnName("libelle").HasMaxLength(40).IsRequired();
        builder.Property(x => x.NombreDeDecimales).HasColumnName("nombre_de_decimales").IsRequired();
        builder.Property(x => x.Taux).HasColumnName("taux").IsRequired();
    }
}
