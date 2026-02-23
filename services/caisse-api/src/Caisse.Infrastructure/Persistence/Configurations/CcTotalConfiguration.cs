using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CcTotalConfiguration : IEntityTypeConfiguration<CcTotal>
{
    public void Configure(EntityTypeBuilder<CcTotal> builder)
    {
        builder.ToTable("cctotal");

        builder.HasKey(e => new { e.Societe, e.CodeGm, e.Filiation, e.DateComptable, e.NumeroTicket });

        builder.Property(e => e.Societe)
            .HasColumnName("cct_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeGm)
            .HasColumnName("cct_code_gm");

        builder.Property(e => e.Filiation)
            .HasColumnName("cct_filiation");

        builder.Property(e => e.DateComptable)
            .HasColumnName("cct_date_comptable");

        builder.Property(e => e.TypeMouvement)
            .HasColumnName("cct_type_mouvement")
            .HasMaxLength(2);

        builder.Property(e => e.CodeService)
            .HasColumnName("cct_code_service")
            .HasMaxLength(10);

        builder.Property(e => e.CodeDevise)
            .HasColumnName("cct_code_devise")
            .HasMaxLength(6);

        builder.Property(e => e.Montant)
            .HasColumnName("cct_montant");

        builder.Property(e => e.MontantDevise)
            .HasColumnName("cct_montant_devise");

        builder.Property(e => e.NumeroTicket)
            .HasColumnName("cct_numero_ticket");

        builder.Property(e => e.Operateur)
            .HasColumnName("cct_operateur")
            .HasMaxLength(16);

        builder.Property(e => e.DateOperation)
            .HasColumnName("cct_date_operation");

        builder.Property(e => e.HeureOperation)
            .HasColumnName("cct_heure_operation");

        builder.Property(e => e.Commentaire)
            .HasColumnName("cct_commentaire")
            .HasMaxLength(100);

        builder.Property(e => e.CodeArticle)
            .HasColumnName("cct_code_article")
            .HasMaxLength(20);

        builder.Property(e => e.Quantite)
            .HasColumnName("cct_quantite");

        builder.Property(e => e.Reference)
            .HasColumnName("cct_reference")
            .HasMaxLength(50);
    }
}
