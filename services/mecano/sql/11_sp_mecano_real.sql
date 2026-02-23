-- ============================================================================
-- PROCEDURE STOCKEE: sp_mecano_generer_real
-- Description: Generation des donnees MECANO pour la base CSK0912
-- ============================================================================
-- Parametres:
--   @p_societe        - Code societe (ex: 'C')
--   @p_date_debut     - Date debut periode (format YYYYMMDD)
--   @p_date_fin       - Date fin periode (format YYYYMMDD)
--   @p_user           - Utilisateur (pour identification session)
-- ============================================================================

USE CSK0912;
GO

CREATE OR ALTER PROCEDURE dbo.sp_mecano_generer_real
    @p_societe NVARCHAR(10) = 'C',
    @p_date_debut NVARCHAR(8) = NULL,
    @p_date_fin NVARCHAR(8) = NULL,
    @p_user NVARCHAR(128) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Valeurs par defaut
    IF @p_user IS NULL SET @p_user = SYSTEM_USER;
    IF @p_date_debut IS NULL SET @p_date_debut = FORMAT(GETDATE(), 'yyyyMMdd');
    IF @p_date_fin IS NULL SET @p_date_fin = FORMAT(DATEADD(MONTH, 1, GETDATE()), 'yyyyMMdd');

    -- CTE pour joindre clients et hebergements
    ;WITH source_data AS (
        SELECT
            gmc.gmc_societe AS societe,
            gmc.gmc_compte AS compte,
            gmc.gmc_filiation_compte AS filiation,
            gmc.gmc_nom_complet AS nom,
            gmc.gmc_prenom_complet AS prenom,
            gmc.gmc_titre AS titre,
            gmc.gmc_numero_adherent AS numero_adherent,
            gmc.gmc_numero_dossier AS numero_dossier,
            gmc.gmc_code_vente AS code_vente,
            gmc.gmc_code_fidelite AS code_fidelite,
            heb.heb_date_fin AS date_fin,
            heb.heb_code_logement AS code_logement,
            heb.heb_lieu_de_sejour AS lieu_sejour,
            heb.heb_u_p_nb_occup AS nb_occupants,
            heb.heb_age AS age_char,
            heb.heb_age_num AS age_num,
            heb.heb_code_sexe AS code_sexe
        FROM dbo.cafil009_dat gmc
        INNER JOIN dbo.cafil012_dat heb
            ON heb.heb_societe = gmc.gmc_societe
            AND heb.heb_num_compte = gmc.gmc_compte
            AND heb.heb_filiation = gmc.gmc_filiation_compte
        WHERE
            gmc.gmc_societe = @p_societe
            AND heb.heb_date_fin >= @p_date_debut
            AND heb.heb_date_fin <= @p_date_fin
            AND heb.heb_date_fin <> '00000000'
            AND heb.heb_code_logement IS NOT NULL
            AND heb.heb_code_logement <> ''
    ),
    avec_calculs AS (
        SELECT *,
            -- Calcul age numerique
            CASE
                WHEN ISNUMERIC(age_num) = 1 THEN CAST(age_num AS INT)
                ELSE 0
            END AS age_calcule,
            -- Libelle sexe
            CASE
                WHEN titre IN ('M.', 'Mr', 'Mr.', 'Hr.', 'Sr.') THEN 'Mr'
                WHEN titre IN ('Mme', 'Me', 'Mlle', 'Mrs.', 'Sra.') THEN 'Me'
                WHEN code_sexe = 'M' THEN 'Mr'
                WHEN code_sexe = 'F' THEN 'Me'
                ELSE ''
            END AS sexe_lib
        FROM source_data
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY nom, filiation) AS sequence,
        societe,
        @p_user AS [user],
        code_vente,
        sexe_lib AS sexe,
        nom,
        prenom,
        filiation AS numero,
        FORMAT(numero_adherent, '0000000000') AS numero_adherent,
        age_calcule AS age,
        '' AS num_accompagnant,
        0 AS fil_accompagnant,
        '' AS seminaire,
        numero_dossier AS dossier,
        lieu_sejour,
        code_logement,
        nb_occupants,
        -- Format date fin: DD/MM/YYYY
        SUBSTRING(date_fin, 7, 2) + '/' + SUBSTRING(date_fin, 5, 2) + '/' + SUBSTRING(date_fin, 1, 4) AS fin_sejour,
        '' AS circuit,
        CASE WHEN code_fidelite IS NOT NULL AND code_fidelite <> '' THEN 'S' ELSE '' END AS bebe,
        code_fidelite AS millesia,
        '' AS nom_logement,
        age_calcule AS age_num
    FROM avec_calculs
    ORDER BY nom, filiation;
END;
GO

PRINT 'Procedure sp_mecano_generer_real creee avec succes';
GO
