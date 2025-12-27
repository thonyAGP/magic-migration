using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionDetailConfiguration : IEntityTypeConfiguration<CaisseSessionDetail>
{
    public void Configure(EntityTypeBuilder<CaisseSessionDetail> builder)
    {
        builder.ToTable("caisse_session_detail");

        builder.HasKey(x => new { x.Utilisateur, x.ChronoSession, x.ChronoDetail });

        builder.Property(x => x.Utilisateur).HasColumnName("utilisateur").HasMaxLength(8).IsRequired();
        builder.Property(x => x.ChronoSession).HasColumnName("chrono_session").IsRequired();
        builder.Property(x => x.ChronoDetail).HasColumnName("chrono_detail").IsRequired();
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(1).IsRequired();
        builder.Property(x => x.Quand).HasColumnName("quand").HasMaxLength(1).IsRequired();
        builder.Property(x => x.Date).HasColumnName("date").HasMaxLength(8).IsFixedLength().IsRequired();
        builder.Property(x => x.Heure).HasColumnName("heure").HasMaxLength(6).IsFixedLength().IsRequired();
        builder.Property(x => x.Montant).HasColumnName("montant");
        builder.Property(x => x.MontantMonnaie).HasColumnName("montant_monnaie");
        builder.Property(x => x.MontantProduits).HasColumnName("montant_produits");
        builder.Property(x => x.MontantCartes).HasColumnName("montant_cartes");
        builder.Property(x => x.MontantCheques).HasColumnName("montant_cheques");
        builder.Property(x => x.MontantOd).HasColumnName("montant_od");
        builder.Property(x => x.CommentaireEcart).HasColumnName("commentaire_ecart").HasMaxLength(30);
        builder.Property(x => x.NbreDevises).HasColumnName("nbre_devises");
        builder.Property(x => x.CommentaireEcartDevise).HasColumnName("commentaire_ecart_devise").HasMaxLength(30).IsRequired();
        builder.Property(x => x.MontantLibre1).HasColumnName("montant_libre_1");
        builder.Property(x => x.MontantLibre2).HasColumnName("montant_libre_2");
        builder.Property(x => x.MontantLibre3).HasColumnName("montant_libre_3");
        builder.Property(x => x.TypeCaisseRecIms).HasColumnName("type_caisse_rec_ims").HasMaxLength(3).IsRequired();
        builder.Property(x => x.TerminalCaisse).HasColumnName("terminal_caisse").HasMaxLength(3).IsRequired();
        builder.Property(x => x.OuvertureAuto).HasColumnName("ouverture_auto").HasMaxLength(1).IsRequired();
        builder.Property(x => x.BufferExtensions).HasColumnName("buffer_extensions").HasMaxLength(9).IsRequired();
        builder.Property(x => x.HostnameCaisse).HasColumnName("hostname_caisse").HasMaxLength(50).IsRequired();
    }
}
