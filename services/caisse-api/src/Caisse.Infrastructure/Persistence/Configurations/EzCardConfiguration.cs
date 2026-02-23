using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class EzCardConfiguration : IEntityTypeConfiguration<EzCard>
{
    public void Configure(EntityTypeBuilder<EzCard> builder)
    {
        builder.ToTable("ezcard");

        builder.HasNoKey();

        builder.Property(e => e.Societe)
            .HasColumnName("societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeGm)
            .HasColumnName("code_gm")
            .IsRequired();

        builder.Property(e => e.Filiation)
            .HasColumnName("filiation")
            .IsRequired();

        builder.Property(e => e.CardCode)
            .HasColumnName("card_code")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.Plafond)
            .HasColumnName("plafond")
            .IsRequired();

        builder.Property(e => e.Type)
            .HasColumnName("type")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.DateOperation)
            .HasColumnName("date_operation");

        builder.Property(e => e.TimeOperation)
            .HasColumnName("ttime_operation");

        builder.Property(e => e.Utilisateur)
            .HasColumnName("utilisateur")
            .HasMaxLength(20)
            .IsRequired();
    }
}
