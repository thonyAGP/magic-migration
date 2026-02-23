using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class TransactionBarEnteteConfiguration : IEntityTypeConfiguration<TransactionBarEntete>
{
    public void Configure(EntityTypeBuilder<TransactionBarEntete> builder)
    {
        builder.ToTable("bartransacent");

        // Composite key since bar_id is not unique
        builder.HasKey(e => new { e.BarId, e.TicketNumber });

        builder.Property(e => e.BarId)
            .HasColumnName("bar_id")
            .HasMaxLength(20);

        builder.Property(e => e.PosId)
            .HasColumnName("pos_id")
            .HasMaxLength(20);

        builder.Property(e => e.BarmanId)
            .HasColumnName("barman_id")
            .HasMaxLength(20);

        builder.Property(e => e.TicketNumber)
            .HasColumnName("ticket_number")
            .HasMaxLength(20);

        builder.Property(e => e.DateTicket)
            .HasColumnName("date_ticket")
            .HasMaxLength(8);

        builder.Property(e => e.TimeTicket)
            .HasColumnName("time_ticket")
            .HasMaxLength(6);

        builder.Property(e => e.TotalTicket)
            .HasColumnName("total_ticket");

        builder.Property(e => e.TotalPaye)
            .HasColumnName("total_paye");

        builder.Property(e => e.TotalCreditConso)
            .HasColumnName("total_credit_conso");

        builder.Property(e => e.EzCardId)
            .HasColumnName("ez_card_id")
            .HasMaxLength(50);

        builder.Property(e => e.Societe)
            .HasColumnName("societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.Adherent)
            .HasColumnName("adherent");

        builder.Property(e => e.Filiation)
            .HasColumnName("filiation");

        builder.Property(e => e.TaiCodeForfait)
            .HasColumnName("tai_code_forfait")
            .HasMaxLength(20);

        // Index for common queries
        builder.HasIndex(e => new { e.Societe, e.Adherent, e.Filiation, e.DateTicket });
    }
}
