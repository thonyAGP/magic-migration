# Factory Dashboard Service

Le dashboard Factory tourne en permanence comme un service Windows géré par PM2.

## ✅ Service déjà configuré

- **Démarrage automatique** : Le service démarre automatiquement au boot Windows
- **Auto-restart** : Redémarre automatiquement en cas de crash
- **Logs persistants** : Tous les logs sont sauvegardés dans `./logs/`

## 📋 Commandes rapides

```bash
# Vérifier le statut
pnpm service:status

# Voir les logs en temps réel
pnpm service:logs

# Redémarrer le service
pnpm service:restart

# Arrêter le service
pnpm service:stop

# Démarrer le service
pnpm service:start

# Monitoring en temps réel (CPU, RAM)
pnpm service:monit
```

## 🌐 Accès au dashboard

Le dashboard est toujours accessible sur : **http://localhost:3070**

## 📊 Logs

Les logs sont sauvegardés dans :
- `./logs/pm2-out.log` - Sorties standards
- `./logs/pm2-error.log` - Erreurs
- `./logs/pm2-combined.log` - Combiné (avec timestamps)

Voir les logs en direct :
```bash
pnpm service:logs
```

Ou directement avec PM2 :
```bash
pnpm pm2 logs factory-dashboard --lines 100
```

## 🔧 Configuration avancée

Le fichier de configuration PM2 est : `ecosystem.config.cjs`

Paramètres actuels :
- **Port** : 3070
- **Dir** : ADH
- **Max Memory** : 500M (redémarre automatiquement si dépassé)
- **Max Restarts** : 10 tentatives avant abandon
- **Restart Delay** : 2000ms entre chaque tentative

## 🚀 Après une mise à jour du code

Le service utilise `tsx` qui recompile automatiquement le TypeScript.
Après un `git pull` ou modification :

```bash
pnpm service:restart
```

Pas besoin de rebuild avec `pnpm build` en développement !

## 🔄 Désinstaller le démarrage automatique

Si tu veux désactiver le démarrage au boot :

```bash
pm2-startup uninstall
```

Pour réactiver :

```bash
pm2-startup install
pnpm pm2 save
```

## ⚠️ Troubleshooting

### Le service ne démarre pas

```bash
# Voir les erreurs
pnpm service:logs

# Vérifier que le port 3070 est libre
netstat -ano | findstr :3070

# Redémarrer en forçant
pnpm pm2 delete factory-dashboard
pnpm service:start
```

### Le dashboard ne répond pas

```bash
# Vérifier le statut
pnpm service:status

# Si "errored" ou "stopped", voir les logs
pnpm service:logs

# Redémarrer
pnpm service:restart
```

### Nettoyer complètement PM2

```bash
pnpm pm2 kill
pnpm service:start
pnpm pm2 save
```
