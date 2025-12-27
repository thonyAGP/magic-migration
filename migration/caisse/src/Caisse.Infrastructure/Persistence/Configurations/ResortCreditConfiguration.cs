using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class ResortCreditConfiguration : IEntityTypeConfiguration<ResortCredit>
{
    public void Configure(EntityTypeBuilder<ResortCredit> builder)
    {
        builder.ToTable("resort_credit");

        builder.HasNoKey();

        builder.Property(e => e.Societe)
            .HasColumnName("rcr_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.NumCompte)
            .HasColumnName("rcr_num_compte")
            .IsRequired();

        builder.Property(e => e.Filiation)
            .HasColumnName("rcr_filiation")
            .IsRequired();

        builder.Property(e => e.Service)
            .HasColumnName("rcr_service")
            .HasMaxLength(4)
            .IsRequired();

        builder.Property(e => e.MontantAttribue)
            .HasColumnName("rcr_montant_attribue")
            .IsRequired();

        builder.Property(e => e.MontantUtilise)
            .HasColumnName("rcr_montant_utilise")
            .IsRequired();

        // Solde is a computed property, not mapped
        builder.Ignore(e => e.Solde);
    }
}
