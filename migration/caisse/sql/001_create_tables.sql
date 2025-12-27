-- ============================================
-- Migration Caisse ADH - Scripts SQL
-- Generated from Magic Unipaas REF DataSources
-- ============================================

-- Table 232: caisse_devise (gestion_devise_session)
CREATE TABLE caisse_devise (
    utilisateur         NVARCHAR(16)    NOT NULL,
    code_devise         NVARCHAR(6)     NOT NULL,
    mode_paiement       NVARCHAR(8)     NOT NULL,
    quand               NVARCHAR(2)     NOT NULL,
    type                NVARCHAR(2)     NOT NULL,
    quantite            FLOAT           NOT NULL,
    CONSTRAINT PK_caisse_devise PRIMARY KEY (utilisateur, code_devise, mode_paiement)
);

-- Table 246: caisse_session (histo_sessions_caisse)
CREATE TABLE caisse_session (
    utilisateur             NVARCHAR(16)    NOT NULL,
    chrono                  FLOAT           NOT NULL,
    date_debut_session      CHAR(8)         NOT NULL,
    heure_debut_session     CHAR(6)         NOT NULL,
    date_fin_session        CHAR(8)         NOT NULL,
    heure_fin_session       CHAR(6)         NOT NULL,
    date_comptable          CHAR(8)         NOT NULL,
    pointage                BIT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_caisse_session PRIMARY KEY (utilisateur, chrono)
);

-- Table 247: caisse_session_article (histo_sessions_caisse_article)
CREATE TABLE caisse_session_article (
    utilisateur         NVARCHAR(16)    NOT NULL,
    chrono_session      FLOAT           NOT NULL,
    chrono_detail       SMALLINT        NOT NULL,
    code_article        SMALLINT        NOT NULL,
    libelle_article     NVARCHAR(32)    NOT NULL,
    prix_unitaire       FLOAT           NOT NULL,
    quantite            SMALLINT        NOT NULL,
    montant             FLOAT           NOT NULL,
    date                CHAR(8)         NOT NULL,
    heure               CHAR(6)         NOT NULL,
    CONSTRAINT PK_caisse_session_article PRIMARY KEY (utilisateur, chrono_session, chrono_detail)
);

-- Table 248: caisse_session_coffre2 (sessions_coffre2)
CREATE TABLE caisse_session_coffre2 (
    date_ouverture_caisse_90    CHAR(8)         NOT NULL,
    heure_ouverture_caisse_90   CHAR(6)         NOT NULL,
    chrono                      FLOAT           NOT NULL,
    utilisateur                 NVARCHAR(16)    NOT NULL,
    CONSTRAINT PK_caisse_session_coffre2 PRIMARY KEY (utilisateur, chrono)
);

-- Table 249: caisse_session_detail (histo_sessions_caisse_detail)
CREATE TABLE caisse_session_detail (
    utilisateur             NVARCHAR(16)    NOT NULL,
    chrono_session          FLOAT           NOT NULL,
    chrono_detail           SMALLINT        NOT NULL,
    type                    NVARCHAR(2)     NOT NULL,
    quand                   NVARCHAR(2)     NOT NULL,
    date                    CHAR(8)         NOT NULL,
    heure                   CHAR(6)         NOT NULL,
    montant                 FLOAT           NULL,
    montant_monnaie         FLOAT           NULL,
    montant_produits        FLOAT           NULL,
    montant_cartes          FLOAT           NULL,
    montant_cheques         FLOAT           NULL,
    montant_od              FLOAT           NULL,
    commentaire_ecart       NVARCHAR(60)    NULL,
    nbre_devises            SMALLINT        NULL,
    commentaire_ecart_devise NVARCHAR(60)   NOT NULL DEFAULT '',
    montant_libre_1         FLOAT           NULL,
    montant_libre_2         FLOAT           NULL,
    montant_libre_3         FLOAT           NULL,
    type_caisse_rec_ims     NVARCHAR(6)     NOT NULL DEFAULT '',
    terminal_caisse         NVARCHAR(6)     NOT NULL DEFAULT '',
    ouverture_auto          NVARCHAR(2)     NOT NULL DEFAULT '',
    buffer_extensions       NVARCHAR(18)    NOT NULL DEFAULT '',
    hostname_caisse         NVARCHAR(100)   NOT NULL DEFAULT '',
    CONSTRAINT PK_caisse_session_detail PRIMARY KEY (utilisateur, chrono_session, chrono_detail)
);

-- Table 250: caisse_session_devise (histo_sessions_caisse_devise)
CREATE TABLE caisse_session_devise (
    utilisateur         NVARCHAR(16)    NOT NULL,
    chrono_session      FLOAT           NOT NULL,
    chrono_detail       SMALLINT        NOT NULL,
    type                NVARCHAR(2)     NOT NULL,
    quand               NVARCHAR(2)     NOT NULL,
    code_devise         NVARCHAR(6)     NOT NULL,
    mode_paiement       NVARCHAR(8)     NOT NULL,
    quantite            FLOAT           NOT NULL,
    date                CHAR(8)         NOT NULL,
    heure               CHAR(6)         NOT NULL,
    CONSTRAINT PK_caisse_session_devise PRIMARY KEY (utilisateur, chrono_session, chrono_detail, code_devise)
);

-- Table 677: caisse_parametres (parametres_caisse)
CREATE TABLE caisse_parametres (
    cle                             NVARCHAR(12)    NOT NULL,
    mop_cmp                         NVARCHAR(8)     NOT NULL DEFAULT '',
    class_od                        NVARCHAR(12)    NOT NULL DEFAULT '',
    compte_ecart_gain               SMALLINT        NOT NULL DEFAULT 0,
    compte_ecart_perte              SMALLINT        NOT NULL DEFAULT 0,
    supprime_comptes_fin_centralise BIT             NOT NULL DEFAULT 0,
    supprime_mop_centralise         BIT             NOT NULL DEFAULT 0,
    article_compte_derniere_minute  SMALLINT        NOT NULL DEFAULT 0,
    compte_appro_caisse             SMALLINT        NOT NULL DEFAULT 0,
    compte_remise_caisse            SMALLINT        NOT NULL DEFAULT 0,
    compte_fdr_receptionniste       SMALLINT        NOT NULL DEFAULT 0,
    compte_bilan_mini_1             SMALLINT        NOT NULL DEFAULT 0,
    compte_bilan_maxi_1             SMALLINT        NOT NULL DEFAULT 0,
    sessions_caisse_a_conserver     SMALLINT        NOT NULL DEFAULT 0,
    comptages_coffre_a_conserver    SMALLINT        NOT NULL DEFAULT 0,
    num_terminal_caisse_mini        SMALLINT        NOT NULL DEFAULT 0,
    num_terminal_caisse_maxi        SMALLINT        NOT NULL DEFAULT 0,
    compte_versretrait_non_cash     SMALLINT        NOT NULL DEFAULT 0,
    compte_versretrait_cash         SMALLINT        NOT NULL DEFAULT 0,
    separateur_decimal_excel        NVARCHAR(2)     NOT NULL DEFAULT '',
    initialisation_automatique      BIT             NOT NULL DEFAULT 0,
    position_ims_dans_magicini      SMALLINT        NOT NULL DEFAULT 0,
    gestion_caisse_avec_2_coffres   NVARCHAR(2)     NOT NULL DEFAULT '',
    position_xtrack_dans_magicini   SMALLINT        NOT NULL DEFAULT 0,
    service_1_sans_session_ims      NVARCHAR(8)     NOT NULL DEFAULT '',
    service_2_sans_session_ims      NVARCHAR(8)     NOT NULL DEFAULT '',
    service_3_sans_session_ims      NVARCHAR(8)     NOT NULL DEFAULT '',
    service_4_sans_session_ims      NVARCHAR(8)     NOT NULL DEFAULT '',
    service_5_sans_session_ims      NVARCHAR(8)     NOT NULL DEFAULT '',
    compte_boutique                 SMALLINT        NOT NULL DEFAULT 0,
    cloture_automatique             NVARCHAR(2)     NOT NULL DEFAULT '',
    activite_boutique               SMALLINT        NOT NULL DEFAULT 0,
    code_a_barres_ims               BIT             NOT NULL DEFAULT 0,
    buffer                          NVARCHAR(198)   NOT NULL DEFAULT '',
    CONSTRAINT PK_caisse_parametres PRIMARY KEY (cle)
);

-- Table 67: cafil045_dat (tables tab)
CREATE TABLE cafil045_dat (
    tab_nom_table           NVARCHAR(10)    NOT NULL,
    tab_nom_interne_code    NVARCHAR(10)    NOT NULL,
    tab_code_alpha5         NVARCHAR(10)    NOT NULL,
    tab_code_numeric6       SMALLINT        NOT NULL DEFAULT 0,
    tab_classe              NVARCHAR(12)    NOT NULL DEFAULT '',
    tab_valeur_numerique    FLOAT           NOT NULL DEFAULT 0,
    tab_libelle20           NVARCHAR(40)    NOT NULL DEFAULT '',
    tab_libelle10_upper     NVARCHAR(20)    NOT NULL DEFAULT '',
    tab_code_droit_modif    NVARCHAR(2)     NOT NULL DEFAULT '',
    tab_remise_autorisee    BIT             NOT NULL DEFAULT 0,
    tab_prix_autorise       BIT             NOT NULL DEFAULT 0,
    tab_imprimer_tva        BIT             NOT NULL DEFAULT 0,
    tab_activer_bar_limit   BIT             NOT NULL DEFAULT 0,
    tab_activer_credit_conso BIT            NOT NULL DEFAULT 0,
    tab_type_service        NVARCHAR(2)     NOT NULL DEFAULT '',
    tab_pourcent_commission FLOAT           NOT NULL DEFAULT 0,
    tab_sale_label_modifiable BIT           NOT NULL DEFAULT 0,
    tab_voir_tel            BIT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_cafil045_dat PRIMARY KEY (tab_nom_table, tab_nom_interne_code)
);

-- Table 693: devisein_par (devise_in)
CREATE TABLE devisein_par (
    code_devise             NVARCHAR(8)     NOT NULL,
    libelle                 NVARCHAR(40)    NOT NULL DEFAULT '',
    nombre_de_decimales     SMALLINT        NOT NULL DEFAULT 2,
    taux                    FLOAT           NOT NULL DEFAULT 1.0,
    CONSTRAINT PK_devisein_par PRIMARY KEY (code_devise)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IX_caisse_session_date ON caisse_session(date_debut_session);
CREATE INDEX IX_caisse_session_detail_session ON caisse_session_detail(utilisateur, chrono_session);
CREATE INDEX IX_caisse_session_article_session ON caisse_session_article(utilisateur, chrono_session);
CREATE INDEX IX_caisse_session_devise_session ON caisse_session_devise(utilisateur, chrono_session);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE caisse_session_detail
    ADD CONSTRAINT FK_session_detail_session
    FOREIGN KEY (utilisateur, chrono_session)
    REFERENCES caisse_session(utilisateur, chrono);

ALTER TABLE caisse_session_article
    ADD CONSTRAINT FK_session_article_session
    FOREIGN KEY (utilisateur, chrono_session)
    REFERENCES caisse_session(utilisateur, chrono);

ALTER TABLE caisse_session_devise
    ADD CONSTRAINT FK_session_devise_session
    FOREIGN KEY (utilisateur, chrono_session)
    REFERENCES caisse_session(utilisateur, chrono);
