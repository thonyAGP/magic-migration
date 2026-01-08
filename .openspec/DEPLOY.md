# Déploiement OpenSpec sur lb2i.com

## Prérequis

- Compte Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
- Accès DNS Gandi pour lb2i.com

---

## Étape 1 : Créer le projet Cloudflare Pages

1. Aller sur https://dash.cloudflare.com/
2. Menu gauche → **Workers & Pages**
3. **Create application** → **Pages** → **Connect to Git**
4. Autoriser GitHub et sélectionner le repo `thonyAGP/lecteur-magic`
5. Configuration du build :
   - **Project name** : `openspec-viewer`
   - **Production branch** : `master`
   - **Build command** : *(laisser vide)*
   - **Build output directory** : `.openspec`
6. **Save and Deploy**

---

## Étape 2 : Récupérer les credentials

### Account ID
1. Cloudflare Dashboard → URL contient : `dash.cloudflare.com/XXXXXX/...`
2. Le `XXXXXX` est ton **Account ID**

### API Token
1. Mon profil (icône en haut à droite) → **API Tokens**
2. **Create Token**
3. Template : **Edit Cloudflare Workers**
4. Permissions :
   - Account > Cloudflare Pages > Edit
   - Zone > Zone > Read (pour lb2i.com)
5. **Create Token** et copier la valeur

---

## Étape 3 : Configurer GitHub Secrets

1. Aller sur https://github.com/thonyAGP/lecteur-magic/settings/secrets/actions
2. **New repository secret** :
   - `CLOUDFLARE_ACCOUNT_ID` = ton Account ID
   - `CLOUDFLARE_API_TOKEN` = ton API Token

---

## Étape 4 : Configurer le domaine lb2i.com

### Sur Cloudflare
1. **Workers & Pages** → `openspec-viewer` → **Custom domains**
2. **Set up a custom domain**
3. Entrer : `lb2i.com` ou `docs.lb2i.com` (selon préférence)

### Sur Gandi DNS
Ajouter un enregistrement CNAME :
```
Type: CNAME
Nom: @ (ou docs)
Valeur: openspec-viewer.pages.dev
TTL: 3600
```

Pour le domaine racine (lb2i.com), Gandi peut nécessiter un ALIAS ou A record.
Cloudflare fournira les instructions exactes.

---

## Utilisation

Après configuration, chaque push sur master avec des modifications dans `.openspec/` déclenchera automatiquement un déploiement.

**URL temporaire** : https://openspec-viewer.pages.dev
**URL finale** : https://lb2i.com (après config DNS)

---

## Test manuel

```bash
# Forcer un déploiement
git commit --allow-empty -m "trigger deploy"
git push
```

Ou via GitHub → Actions → Deploy OpenSpec → Run workflow
