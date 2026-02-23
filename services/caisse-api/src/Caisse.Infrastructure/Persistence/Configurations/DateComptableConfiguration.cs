using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DateComptableConfiguration : IEntityTypeConfiguration<DateComptable>
{
    public void Configure(EntityTypeBuilder<DateComptable> builder)
    {
        builder.ToTable("cafil048_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("dat_societe").HasMaxLength(2);
        builder.Property(e => e.Date).HasColumnName("dat_date_comptable");
    }
}
