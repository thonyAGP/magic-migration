import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useDeversementTransactionStore } from '@/stores/deversementTransactionStore';
import { useAuthStore } from '@/stores';
import type { Vente, VenteType, OperationDiverseType } from '@/types/deversementTransaction';

type Phase = 'form' | 'result';

export function DeversementTransactionPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const vente = useDeversementTransactionStore((s) => s.vente);
  const operationsDiverses = useDeversementTransactionStore((s) => s.operationsDiverses);
  const compteGM = useDeversementTransactionStore((s) => s.compteGM);
  const _hebergement = useDeversementTransactionStore((s) => s.hebergement);
  const transfertAffectation = useDeversementTransactionStore((s) => s.transfertAffectation);
  const isProcessing = useDeversementTransactionStore((s) => s.isProcessing);
  const error = useDeversementTransactionStore((s) => s.error);
  const _affectationTransfert = useDeversementTransactionStore((s) => s.affectationTransfert);
  const showAffectationModal = useDeversementTransactionStore((s) => s.showAffectationModal);
  const numeroTicket = useDeversementTransactionStore((s) => s.numeroTicket);
  const _venteVrlVsl = useDeversementTransactionStore((s) => s.venteVrlVsl);
  const _complementsBiking = useDeversementTransactionStore((s) => s.complementsBiking);
  const _deversementHistory = useDeversementTransactionStore((s) => s.deversementHistory);

  const setVente = useDeversementTransactionStore((s) => s.setVente);
  const _setAffectationTransfert = useDeversementTransactionStore((s) => s.setAffectationTransfert);
  const setShowAffectationModal = useDeversementTransactionStore((s) => s.setShowAffectationModal);
  const deverserVente = useDeversementTransactionStore((s) => s.deverserVente);
  const affecterTransfert = useDeversementTransactionStore((s) => s.affecterTransfert);
  const chargerCompteGM = useDeversementTransactionStore((s) => s.chargerCompteGM);
  const chargerOperationsDiverses = useDeversementTransactionStore((s) => s.chargerOperationsDiverses);
  const resetState = useDeversementTransactionStore((s) => s.resetState);

  const [phase, setPhase] = useState<Phase>('form');
  const [societe, setSociete] = useState('SOC1');
  const [compte, setCompte] = useState('C1001');
  const [filiation, setFiliation] = useState('0');
  const [montant, setMontant] = useState('150.00');
  const [annulation, setAnnulation] = useState(false);
  const [typeVente, setTypeVente] = useState<VenteType>('standard');
  const [tempAffectation, setTempAffectation] = useState('');

  useEffect(() => {
    if (societe && compte) {
      chargerCompteGM(societe, compte);
    }
  }, [societe, compte, chargerCompteGM]);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleDeverser = useCallback(async () => {
    if (!societe || !compte || !montant) {
      return;
    }

    const newVente: Vente = {
      id: Date.now(),
      societe,
      compte,
      filiation: parseInt(filiation, 10),
      dateEncaissement: new Date(),
      montant: parseFloat(montant),
      annulation,
      typeVente,
      modePaiement: 'CB',
      operateur: user ? `${user.nom} ${user.prenom}` : 'Inconnu',
    };

    setVente(newVente);

    if (typeVente === 'VRL' || typeVente === 'VSL') {
      setShowAffectationModal(true);
      return;
    }

    await deverserVente(newVente.id, annulation);
    await chargerOperationsDiverses(newVente.id);
    setPhase('result');
  }, [
    societe,
    compte,
    filiation,
    montant,
    annulation,
    typeVente,
    user,
    setVente,
    setShowAffectationModal,
    deverserVente,
    chargerOperationsDiverses,
  ]);

  const handleConfirmAffectation = useCallback(async () => {
    if (!vente) return;

    await deverserVente(vente.id, annulation, tempAffectation || undefined);
    
    if (tempAffectation) {
      await affecterTransfert(vente.id, tempAffectation);
    }

    await chargerOperationsDiverses(vente.id);
    setShowAffectationModal(false);
    setTempAffectation('');
    setPhase('result');
  }, [vente, annulation, tempAffectation, deverserVente, affecterTransfert, chargerOperationsDiverses, setShowAffectationModal]);

  const handleCancelAffectation = useCallback(() => {
    setShowAffectationModal(false);
    setTempAffectation('');
  }, [setShowAffectationModal]);

  const handleBack = () => {
    if (phase === 'result') {
      resetState();
      setPhase('form');
      setSociete('SOC1');
      setCompte('C1001');
      setFiliation('0');
      setMontant('150.00');
      setAnnulation(false);
      setTypeVente('standard');
    } else {
      navigate('/caisse/menu');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  const getOperationTypeLabel = (type: OperationDiverseType) => {
    const labels: Record<OperationDiverseType, string> = {
      compte: 'Compte',
      service: 'Service',
      statistiques: 'Statistiques',
      biking: 'Biking',
      lco: 'LCO',
    };
    return labels[type];
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Déversement Transaction</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'form'
                ? 'Saisir les informations de la vente'
                : 'Résultat du déversement'}
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {phase === 'form' && (
          <>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium mb-4">Informations de la vente</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Société</label>
                  <Input
                    value={societe}
                    onChange={(e) => setSociete(e.target.value)}
                    placeholder="SOC1"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Compte</label>
                  <Input
                    value={compte}
                    onChange={(e) => setCompte(e.target.value)}
                    placeholder="C1001"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Filiation</label>
                  <Input
                    type="number"
                    value={filiation}
                    onChange={(e) => setFiliation(e.target.value)}
                    placeholder="0"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Montant (EUR)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    placeholder="150.00"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type de vente</label>
                  <select
                    value={typeVente}
                    onChange={(e) => setTypeVente(e.target.value as VenteType)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-surface text-on-surface"
                    disabled={isProcessing}
                  >
                    <option value="standard">Standard</option>
                    <option value="VRL">VRL</option>
                    <option value="VSL">VSL</option>
                    <option value="OD">OD</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={annulation}
                      onChange={(e) => setAnnulation(e.target.checked)}
                      className="w-4 h-4 text-primary"
                      disabled={isProcessing}
                    />
                    <span className="text-sm font-medium">Annulation</span>
                  </label>
                </div>
              </div>

              {compteGM && (
                <div className="mt-4 p-3 bg-surface-hover rounded-md">
                  <p className="text-sm font-medium">Solde actuel compte GM</p>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {formatCurrency(compteGM.solde)}
                  </p>
                  <p className="text-xs text-on-surface-muted mt-1">
                    Dernière MAJ: {formatDate(compteGM.dateMAJ)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleBack} disabled={isProcessing}>
                Retour au menu
              </Button>
              <Button onClick={handleDeverser} disabled={isProcessing}>
                {isProcessing ? 'Traitement...' : 'Déverser'}
              </Button>
            </div>
          </>
        )}

        {phase === 'result' && (
          <>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-green-700">
                  Déversement effectué avec succès
                </h3>
              </div>

              {numeroTicket && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900">Numéro de ticket</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">#{numeroTicket}</p>
                </div>
              )}

              {vente && (
                <div className="space-y-2">
                  <h4 className="font-medium">Informations de la vente</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-on-surface-muted">Société:</span>
                      <span className="ml-2 font-medium">{vente.societe}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-muted">Compte:</span>
                      <span className="ml-2 font-medium">{vente.compte}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-muted">Montant:</span>
                      <span className="ml-2 font-medium">{formatCurrency(vente.montant)}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-muted">Type:</span>
                      <span className="ml-2 font-medium">{vente.typeVente}</span>
                    </div>
                    {vente.annulation && (
                      <div className="col-span-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Annulation
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {compteGM && (
                <div className="space-y-2">
                  <h4 className="font-medium">Compte GM mis à jour</h4>
                  <div className="p-3 bg-surface-hover rounded-md">
                    <p className="text-sm text-on-surface-muted">Nouveau solde</p>
                    <p className="text-xl font-semibold text-primary mt-1">
                      {formatCurrency(compteGM.solde)}
                    </p>
                  </div>
                </div>
              )}

              {operationsDiverses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Opérations diverses créées ({operationsDiverses.length})</h4>
                  <div className="border border-border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-hover">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Type OD</th>
                          <th className="px-3 py-2 text-right font-medium">Montant</th>
                          <th className="px-3 py-2 text-left font-medium">Date</th>
                          <th className="px-3 py-2 text-left font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operationsDiverses.map((od) => (
                          <tr key={od.id} className="border-t border-border">
                            <td className="px-3 py-2">{getOperationTypeLabel(od.typeOD)}</td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formatCurrency(od.montant)}
                            </td>
                            <td className="px-3 py-2">{formatDate(od.dateOperation)}</td>
                            <td className="px-3 py-2 text-on-surface-muted">
                              {od.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {transfertAffectation && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-sm font-medium text-purple-900">Affectation transfert</p>
                  <p className="text-lg font-semibold text-purple-700 mt-1">
                    {transfertAffectation.affectation || 'Non définie'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <Button variant="secondary" onClick={handleBack}>
                Nouvelle transaction
              </Button>
            </div>
          </>
        )}

        <Dialog open={showAffectationModal} onClose={handleCancelAffectation}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Affectation transfert</h3>
            <p className="text-sm text-on-surface-muted">
              Cette vente VRL/VSL nécessite une affectation de transfert (optionnel).
            </p>

            <div>
              <label className="block text-sm font-medium mb-1">
                Affectation (optionnel)
              </label>
              <Input
                value={tempAffectation}
                onChange={(e) => setTempAffectation(e.target.value)}
                placeholder="Ex: TRANSFERT-001"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleCancelAffectation}>
                Annuler
              </Button>
              <Button onClick={handleConfirmAffectation} disabled={isProcessing}>
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default DeversementTransactionPage;
