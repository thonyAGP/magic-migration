using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class GmCompletConfiguration : IEntityTypeConfiguration<GmComplet>
{
    public void Configure(EntityTypeBuilder<GmComplet> builder)
    {
        builder.ToTable("cafil009_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("gmc_societe").HasMaxLength(2);
        builder.Property(e => e.Compte).HasColumnName("gmc_compte");
        builder.Property(e => e.FiliationCompte).HasColumnName("gmc_filiation_compte");
        builder.Property(e => e.Titre).HasColumnName("gmc_titre").HasMaxLength(4);
        builder.Property(e => e.NomComplet).HasColumnName("gmc_nom_complet").HasMaxLength(60);
        builder.Property(e => e.PrenomComplet).HasColumnName("gmc_prenom_complet").HasMaxLength(40);
        builder.Property(e => e.Bebe).HasColumnName("gmc_bebe").HasMaxLength(2);
        builder.Property(e => e.TypeDeClient).HasColumnName("gmc_type_de_client").HasMaxLength(2);
        builder.Property(e => e.NumeroAdherent).HasColumnName("gmc_numero_adherent");
        builder.Property(e => e.LettreControle).HasColumnName("gmc_lettre_controle").HasMaxLength(2);
        builder.Property(e => e.FiliationClub).HasColumnName("gmc_filiation_club");
        builder.Property(e => e.DateNaissance).HasColumnName("gmc_date_naissance");
        builder.Property(e => e.VilleNaissance).HasColumnName("gmc_ville_naissance").HasMaxLength(70);
        builder.Property(e => e.PaysNaissance).HasColumnName("gmc_pays_naissance").HasMaxLength(6);
        builder.Property(e => e.CodeInscription).HasColumnName("gmc_code_inscription").HasMaxLength(6);
        builder.Property(e => e.CodeVente).HasColumnName("gmc_code_vente").HasMaxLength(6);
        builder.Property(e => e.CodeNationalite).HasColumnName("gmc_code_nationalite").HasMaxLength(4);
        builder.Property(e => e.Profession).HasColumnName("gmc_profession").HasMaxLength(40);
        builder.Property(e => e.PieceId).HasColumnName("gmc_piece_id").HasMaxLength(2);
        builder.Property(e => e.NumeroPiece).HasColumnName("gmc_numero_piece").HasMaxLength(60);
        builder.Property(e => e.DateDelivrance).HasColumnName("gmc_date_delivrance");
        builder.Property(e => e.DateValidite).HasColumnName("gmc_date_validite");
        builder.Property(e => e.VilleDelivrance).HasColumnName("gmc_ville_delivrance").HasMaxLength(100);
    }
}
