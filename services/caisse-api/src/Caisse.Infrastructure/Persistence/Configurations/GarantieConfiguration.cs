using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class GarantieConfiguration : IEntityTypeConfiguration<Garantie>
{
    public void Configure(EntityTypeBuilder<Garantie> builder)
    {
        builder.ToTable("cafil069_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("gar_societe").HasMaxLength(2);
        builder.Property(e => e.CodeNum).HasColumnName("gar_code_num_");
        builder.Property(e => e.CodeGarantie).HasColumnName("gar_code_garantie").HasMaxLength(10);
        builder.Property(e => e.CodeClasse).HasColumnName("gar_code_classe").HasMaxLength(12);
        builder.Property(e => e.Libelle).HasColumnName("gar_libelle").HasMaxLength(40);
        builder.Property(e => e.Montant).HasColumnName("gar_montant");
        builder.Property(e => e.CodeModif).HasColumnName("gar_code_modif_").HasMaxLength(2);
    }
}
