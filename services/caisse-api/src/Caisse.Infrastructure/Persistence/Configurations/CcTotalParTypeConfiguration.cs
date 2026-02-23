using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CcTotalParTypeConfiguration : IEntityTypeConfiguration<CcTotalParType>
{
    public void Configure(EntityTypeBuilder<CcTotalParType> builder)
    {
        builder.ToTable("ccpartyp");

        builder.HasNoKey();

        builder.Property(e => e.Societe)
            .HasColumnName("societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.Code8Chiffres)
            .HasColumnName("code_8chiffres")
            .IsRequired();

        builder.Property(e => e.Filiation)
            .HasColumnName("filiation")
            .IsRequired();

        builder.Property(e => e.Type)
            .HasColumnName("type")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.SoldeCreditConso)
            .HasColumnName("solde_credit_conso")
            .IsRequired();
    }
}
