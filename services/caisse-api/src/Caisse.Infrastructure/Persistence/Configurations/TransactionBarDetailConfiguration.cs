using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class TransactionBarDetailConfiguration : IEntityTypeConfiguration<TransactionBarDetail>
{
    public void Configure(EntityTypeBuilder<TransactionBarDetail> builder)
    {
        builder.ToTable("bartransacdet");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("btd_id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.TransactionId)
            .HasColumnName("btd_transaction_id");

        builder.Property(e => e.Societe)
            .HasColumnName("btd_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeArticle)
            .HasColumnName("btd_code_article")
            .HasMaxLength(20);

        builder.Property(e => e.LibelleArticle)
            .HasColumnName("btd_libelle_article")
            .HasMaxLength(50);

        builder.Property(e => e.Quantite)
            .HasColumnName("btd_quantite");

        builder.Property(e => e.PrixUnitaire)
            .HasColumnName("btd_prix_unitaire");

        builder.Property(e => e.MontantLigne)
            .HasColumnName("btd_montant_ligne");

        builder.Property(e => e.TauxTva)
            .HasColumnName("btd_taux_tva");

        builder.Property(e => e.MontantTva)
            .HasColumnName("btd_montant_tva");

        builder.Property(e => e.CodeTva)
            .HasColumnName("btd_code_tva")
            .HasMaxLength(10);

        builder.Property(e => e.CodeService)
            .HasColumnName("btd_code_service")
            .HasMaxLength(10);

        builder.Property(e => e.NumeroLigne)
            .HasColumnName("btd_numero_ligne");

        builder.Property(e => e.TypeLigne)
            .HasColumnName("btd_type_ligne")
            .HasMaxLength(2);

        builder.Property(e => e.Reference)
            .HasColumnName("btd_reference")
            .HasMaxLength(50);

        // Index for common queries
        builder.HasIndex(e => e.TransactionId);
    }
}
