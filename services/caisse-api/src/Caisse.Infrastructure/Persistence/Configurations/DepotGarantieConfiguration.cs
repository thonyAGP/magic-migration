using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DepotGarantieConfiguration : IEntityTypeConfiguration<DepotGarantie>
{
    public void Configure(EntityTypeBuilder<DepotGarantie> builder)
    {
        builder.ToTable("cafil017_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("dga_societe").HasMaxLength(2);
        builder.Property(e => e.CodeGm).HasColumnName("dga_code_gm");
        builder.Property(e => e.Filiation).HasColumnName("dga_filiation");
        builder.Property(e => e.DateDepot).HasColumnName("dga_date_depot");
        builder.Property(e => e.HeureDepot).HasColumnName("dga_heure_depot");
        builder.Property(e => e.DateRetrait).HasColumnName("dga_date_retrait");
        builder.Property(e => e.HeureRetrait).HasColumnName("dga_heure_retrait");
        builder.Property(e => e.TypeDepot).HasColumnName("dga_type_depot").HasMaxLength(8);
        builder.Property(e => e.Devise).HasColumnName("dga_devise").HasMaxLength(6);
        builder.Property(e => e.Montant).HasColumnName("dga_montant");
        builder.Property(e => e.Etat).HasColumnName("dga_etat").HasMaxLength(2);
        builder.Property(e => e.Operateur).HasColumnName("dga_operateur").HasMaxLength(16);
        builder.Property(e => e.NumDossierPms).HasColumnName("dga_num_dossier_pms").HasMaxLength(64);
        builder.Property(e => e.NumDossierAxis).HasColumnName("dga_num_dossier_axis").HasMaxLength(64);
        builder.Property(e => e.NumDossierNa).HasColumnName("dga_num_dossier_na").HasMaxLength(64);
    }
}
