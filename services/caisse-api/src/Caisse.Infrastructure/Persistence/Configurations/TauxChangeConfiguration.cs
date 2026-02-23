using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class TauxChangeConfiguration : IEntityTypeConfiguration<TauxChange>
{
    public void Configure(EntityTypeBuilder<TauxChange> builder)
    {
        builder.ToTable("taux_change_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe)
            .HasColumnName("societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.TypeDevise)
            .HasColumnName("type_devise")
            .HasMaxLength(2);

        builder.Property(e => e.CodeDevise)
            .HasColumnName("code_devise")
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(e => e.ModePaiement)
            .HasColumnName("mode_paiement")
            .HasMaxLength(4);

        builder.Property(e => e.TauxAchat)
            .HasColumnName("taux_achat");

        builder.Property(e => e.TauxVente)
            .HasColumnName("taux_vente");

        builder.Property(e => e.DateValidite)
            .HasColumnName("date_validite");

        builder.Property(e => e.DateFin)
            .HasColumnName("date_fin");

        builder.Property(e => e.Operateur)
            .HasColumnName("operateur")
            .HasMaxLength(10);

        builder.Property(e => e.DateModification)
            .HasColumnName("date_modification");
    }
}
