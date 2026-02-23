using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CompteZoomConfiguration : IEntityTypeConfiguration<CompteZoom>
{
    public void Configure(EntityTypeBuilder<CompteZoom> builder)
    {
        builder.ToTable("cafil050_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("gen_num_serie").HasMaxLength(10);
        builder.Property(e => e.Devise).HasColumnName("gen_code_utilise").HasMaxLength(10);
        builder.Property(e => e.TypeOperation).HasColumnName("gen_classement_log").HasMaxLength(10);
        builder.Property(e => e.ModePaiement).HasColumnName("gen_code_autocom").HasMaxLength(10);
        builder.Property(e => e.Titre).HasMaxLength(100);
        builder.Ignore(e => e.Titre);
    }
}
