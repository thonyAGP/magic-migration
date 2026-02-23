using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class EmailConfiguration : IEntityTypeConfiguration<Email>
{
    public void Configure(EntityTypeBuilder<Email> builder)
    {
        builder.ToTable("email");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("ema_societe").HasMaxLength(2);
        builder.Property(e => e.Compte).HasColumnName("ema_compte");
        builder.Property(e => e.Filiation).HasColumnName("ema_filiation");
        builder.Property(e => e.EmailAddress).HasColumnName("ema_email").HasMaxLength(258);
        builder.Property(e => e.Cnil).HasColumnName("ema_cnil").HasMaxLength(30);
        builder.Property(e => e.ReportFiliation).HasColumnName("ema_report_filiation");
        builder.Property(e => e.EtatCode).HasColumnName("ema_etat_code").HasMaxLength(8);
        builder.Property(e => e.DateImport).HasColumnName("ema_date_import");
        builder.Property(e => e.HeureImport).HasColumnName("ema_heure_import");
        builder.Property(e => e.DateDerniereSaisiePms).HasColumnName("ema_date_derniere_saisie_pms");
        builder.Property(e => e.HeureDerniereSaisiePms).HasColumnName("ema_heure_derniere_saisie_pms");
        builder.Property(e => e.UserDerniereSaisiePms).HasColumnName("ema_user_derniere_saisie_pms").HasMaxLength(16);
        builder.Property(e => e.DateExport).HasColumnName("ema_date_export");
        builder.Property(e => e.TimeExport).HasColumnName("ema_time_export");
        builder.Property(e => e.TelephonePortable).HasColumnName("ema_telephone_portable").HasMaxLength(40);
    }
}
