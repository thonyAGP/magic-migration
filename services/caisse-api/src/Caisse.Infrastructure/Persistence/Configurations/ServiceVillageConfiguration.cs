using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class ServiceVillageConfiguration : IEntityTypeConfiguration<ServiceVillage>
{
    public void Configure(EntityTypeBuilder<ServiceVillage> builder)
    {
        builder.ToTable("caisse_ref_simp_service");

        builder.HasKey(s => s.CodeService);

        builder.Property(s => s.CodeService)
            .HasColumnName("service")
            .HasMaxLength(4)
            .IsRequired();

        builder.Property(s => s.SousImputation)
            .HasColumnName("sous_imputation");
    }
}
