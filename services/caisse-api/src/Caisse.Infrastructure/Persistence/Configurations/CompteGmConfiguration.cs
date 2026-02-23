using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CompteGmConfiguration : IEntityTypeConfiguration<CompteGm>
{
    public void Configure(EntityTypeBuilder<CompteGm> builder)
    {
        builder.ToTable("cafil025_dat");

        builder.HasKey(e => new { e.Societe, e.CodeAdherent, e.Filiation });

        builder.Property(e => e.Societe)
            .HasColumnName("cgm_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeAdherent)
            .HasColumnName("cgm_code_adherent");

        builder.Property(e => e.Filiation)
            .HasColumnName("cgm_filiation");

        builder.Property(e => e.Qualite)
            .HasColumnName("cgm_qualite")
            .HasMaxLength(4);

        builder.Property(e => e.NomPrenom)
            .HasColumnName("cgm_nom_prenom")
            .HasMaxLength(50);

        builder.Property(e => e.Etat)
            .HasColumnName("cgm_etat")
            .HasMaxLength(2);

        builder.Property(e => e.Garanti)
            .HasColumnName("cgm_garanti")
            .HasMaxLength(2);

        builder.Property(e => e.SoldeDuCompte)
            .HasColumnName("cgm_solde_du_compte");

        builder.Property(e => e.DateLimitSolde)
            .HasColumnName("cgm_date_limit_solde");

        builder.Property(e => e.DateComptSold)
            .HasColumnName("cgm_date_compt__sold");

        builder.Property(e => e.DateLastOperat)
            .HasColumnName("cgm_date_lastoperat_");

        builder.Property(e => e.HeureLastOperat)
            .HasColumnName("cgm_heure_lastoperat");

        builder.Property(e => e.Operateur)
            .HasColumnName("cgm_operateur")
            .HasMaxLength(16);

        builder.Property(e => e.DateTimeLastCheckout)
            .HasColumnName("cgm_datetimelastcheckout");

        builder.Property(e => e.TypeVoyage)
            .HasColumnName("cgm_type_voyage")
            .HasMaxLength(4);

        builder.Property(e => e.CodeLieu)
            .HasColumnName("cgm_code_lieu")
            .HasMaxLength(10);

        builder.Property(e => e.DateDebutSejour)
            .HasColumnName("cgm_date_debut_sejour");

        builder.Property(e => e.DateFinSejour)
            .HasColumnName("cgm_date_fin_sejour");

        builder.Property(e => e.NumChambre)
            .HasColumnName("cgm_num_chambre")
            .HasMaxLength(10);

        builder.Property(e => e.DeviseCompte)
            .HasColumnName("cgm_devise_compte")
            .HasMaxLength(6);

        builder.Property(e => e.NbDecimales)
            .HasColumnName("cgm_nb_decimales");
    }
}
