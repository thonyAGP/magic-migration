using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class MoyenPaiementConfiguration : IEntityTypeConfiguration<MoyenPaiement>
{
    public void Configure(EntityTypeBuilder<MoyenPaiement> builder)
    {
        builder.ToTable("cafil015_dat");

        builder.HasKey(e => new { e.Societe, e.CodeMop });

        builder.Property(e => e.Societe)
            .HasColumnName("mop_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeMop)
            .HasColumnName("mop_code_mop")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(e => e.Libelle)
            .HasColumnName("mop_libelle")
            .HasMaxLength(40);

        builder.Property(e => e.Classe)
            .HasColumnName("mop_classe")
            .HasMaxLength(10);

        builder.Property(e => e.Type)
            .HasColumnName("mop_type")
            .HasMaxLength(4);

        builder.Property(e => e.Actif)
            .HasColumnName("mop_actif");

        builder.Property(e => e.AccepteDevise)
            .HasColumnName("mop_accepte_devise");

        builder.Property(e => e.RequiertReference)
            .HasColumnName("mop_requiert_reference");

        builder.Property(e => e.CodeComptable)
            .HasColumnName("mop_code_comptable")
            .HasMaxLength(20);

        builder.Property(e => e.OrdreAffichage)
            .HasColumnName("mop_ordre_affichage");
    }
}
