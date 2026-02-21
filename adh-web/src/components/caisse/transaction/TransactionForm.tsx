import { useCallback, useMemo, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { Plus, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectOption } from '@/components/ui';
import { Combobox } from '@/components/ui';
import { FormPanel } from '@/components/layout';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/stores';
import type {
  TransactionFormProps,
  TransactionFormData,
  TransactionLineFormData,
} from './types';
import type { ArticleType } from '@/types/transaction';
import type { VRLIdentity, TransactionDraft } from '@/types/transaction-lot2';
import { ArticleTypeSelector } from './ArticleTypeSelector';
import { PaymentMethodGrid } from './PaymentMethodGrid';
import { GiftPassCheck } from './GiftPassCheck';
import { ResortCreditCheck } from './ResortCreditCheck';
import { TPERecoveryDialog } from './TPERecoveryDialog';
import { TransactionSummary } from './TransactionSummary';
import { ForfaitDialog } from './ForfaitDialog';
import { VRLIdentityDialog } from './VRLIdentityDialog';
import { CommentaireDialog } from '../dialogs/CommentaireDialog';
import { AnnulationReferenceDialog } from './AnnulationReferenceDialog';
import { GiftPassConfirmDialog, type GiftPassAction } from './GiftPassConfirmDialog';

const DEVISES = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - Dollar US' },
  { value: 'GBP', label: 'GBP - Livre Sterling' },
  { value: 'CHF', label: 'CHF - Franc Suisse' },
  { value: 'JPY', label: 'JPY - Yen Japonais' },
];

const MOCK_COMPTES = [
  { value: '10001', label: '10001 - DUPONT Jean' },
  { value: '10002', label: '10002 - MARTIN Sophie' },
  { value: '10003', label: '10003 - GARCIA Pedro' },
  { value: '10004', label: '10004 - SMITH John' },
];

function createEmptyLine(): TransactionLineFormData {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantite: 1,
    prixUnitaire: 0,
    montant: 0,
    devise: 'EUR',
    codeProduit: '',
  };
}

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(
    value,
  );

const modeLabels = {
  GP: {
    clientLabel: 'Adherent',
    compteLabel: 'Compte GM',
    articlesLabel: 'Articles Grande Boutique',
    venteLabel: 'Vente GP',
  },
  Boutique: {
    clientLabel: 'Client',
    compteLabel: 'Compte Boutique',
    articlesLabel: 'Articles Boutique',
    venteLabel: 'Vente Boutique',
  },
} as const;

export function TransactionForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
}: TransactionFormProps) {
  const labels = modeLabels[mode];
  const [commentaireOpen, setCommentaireOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleType, setArticleType] = useState<ArticleType>('default');
  const [forfaitOpen, setForfaitOpen] = useState(false);
  const [vrlIdentityOpen, setVrlIdentityOpen] = useState(false);
  const [tpeRecoveryOpen, setTpeRecoveryOpen] = useState(false);
  const [vrlIdentity, setVrlIdentity] = useState<VRLIdentity | null>(null);
  const [forfaitDates, setForfaitDates] = useState<{ debut: string; fin: string } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isCheckingGiftPass, setIsCheckingGiftPass] = useState(false);
  const [isCheckingResortCredit, setIsCheckingResortCredit] = useState(false);
  const [showAnnulationDialog, setShowAnnulationDialog] = useState(false);
  const [annulationRef, setAnnulationRef] = useState<string | null>(null);
  const [showGiftPassConfirm, setShowGiftPassConfirm] = useState(false);
  const [_giftPassAction, setGiftPassAction] = useState<GiftPassAction | null>(null);

  const {
    catalogMOP,
    catalogForfaits,
    selectedMOP,
    paymentSide,
    giftPassBalance,
    resortCreditBalance,
    tpeError,
    addMOP,
    removeMOP,
    togglePaymentSide,
    checkGiftPass,
    checkResortCredit,
    setDraft,
  } = useTransactionStore();

  const defaultValues: TransactionFormData = {
    compteNumero: initialData?.compteNumero ?? '',
    compteNom: initialData?.compteNom ?? '',
    devise: initialData?.devise ?? 'EUR',
    dateTransaction:
      initialData?.dateTransaction ?? new Date().toISOString().slice(0, 10),
    lignes: initialData?.lignes ?? [createEmptyLine()],
    commentaire: initialData?.commentaire ?? '',
    mode,
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lignes',
  });

  const lignes = watch('lignes');
  const devise = watch('devise');
  const commentaire = watch('commentaire');

  const totals = useMemo(() => {
    const totalHT = lignes.reduce((sum, l) => sum + (l.montant || 0), 0);
    return { totalHT, totalTTC: totalHT };
  }, [lignes]);

  const handleAddLine = useCallback(() => {
    append(createEmptyLine());
  }, [append]);

  const handleRemoveLine = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
      }
    },
    [fields.length, remove],
  );

  const handleLineChange = useCallback(
    (index: number, field: 'quantite' | 'prixUnitaire', value: number) => {
      const currentLignes = getValues('lignes');
      const ligne = currentLignes[index];
      if (!ligne) return;

      const updated = { ...ligne, [field]: value };
      updated.montant = updated.quantite * updated.prixUnitaire;
      setValue(`lignes.${index}`, updated, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const handleCompteChange = useCallback(
    (value: string) => {
      setValue('compteNumero', value);
      const compte = MOCK_COMPTES.find((c) => c.value === value);
      if (compte) {
        const nom = compte.label.split(' - ')[1] ?? '';
        setValue('compteNom', nom);
      }
    },
    [setValue],
  );

  const handleCommentaireSave = useCallback(
    (value: string) => {
      setValue('commentaire', value);
      setCommentaireOpen(false);
    },
    [setValue],
  );

  const handleCheckGiftPass = useCallback(async () => {
    setIsCheckingGiftPass(true);
    try {
      await checkGiftPass(0, '', 0, 0);
      // After checking, if balance available, open confirm dialog
      const balance = useTransactionStore.getState().giftPassBalance;
      if (balance?.available) {
        setShowGiftPassConfirm(true);
      }
    } finally {
      setIsCheckingGiftPass(false);
    }
  }, [checkGiftPass]);

  const handleCheckResortCredit = useCallback(async () => {
    setIsCheckingResortCredit(true);
    try {
      await checkResortCredit(0, '', 0, 0);
    } finally {
      setIsCheckingResortCredit(false);
    }
  }, [checkResortCredit]);

  const handleVRLValidate = useCallback((data: VRLIdentity) => {
    setVrlIdentity(data);
    setVrlIdentityOpen(false);
  }, []);

  const handleForfaitValidate = useCallback((debut: string, fin: string) => {
    setForfaitDates({ debut, fin });
    setForfaitOpen(false);
  }, []);

  const handleArticleTypeChange = useCallback((type: ArticleType) => {
    setArticleType(type);
    if (type === 'ANN') {
      setShowAnnulationDialog(true);
    }
  }, []);

  const handleAnnulationValidate = useCallback((reference: string) => {
    setAnnulationRef(reference);
    setShowAnnulationDialog(false);
    // Pre-fill lines with negative amounts (mock)
    const negLine = createEmptyLine();
    negLine.description = `Annulation ${reference}`;
    negLine.quantite = 1;
    negLine.prixUnitaire = -280;
    negLine.montant = -280;
    setValue('lignes', [negLine]);
  }, [setValue]);

  const handleGiftPassConfirmSelect = useCallback((action: GiftPassAction) => {
    setGiftPassAction(action);
    setShowGiftPassConfirm(false);
  }, []);

  const buildDraft = useCallback((): TransactionDraft => {
    const values = getValues();
    return {
      compteId: parseInt(values.compteNumero) || 0,
      compteNom: values.compteNom,
      articleType,
      lignes: values.lignes.map(l => ({
        description: l.description,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        devise: l.devise || values.devise,
        codeProduit: l.codeProduit,
      })),
      mop: selectedMOP,
      paymentSide,
      giftPass: giftPassBalance ?? undefined,
      resortCredit: resortCreditBalance ?? undefined,
      forfait: undefined,
      vrlIdentity: vrlIdentity ?? undefined,
      commentaire: values.commentaire || undefined,
      devise: values.devise,
      montantTotal: totals.totalTTC,
    };
  }, [getValues, articleType, selectedMOP, paymentSide, giftPassBalance, resortCreditBalance, vrlIdentity, totals.totalTTC]);

  const onFormSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    if (!showSummary) {
      const d = buildDraft();
      setDraft(d);
      setShowSummary(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col gap-4"
    >
      {/* Header: Mode badge */}
      <div className="flex items-center justify-between">
        <Badge variant={mode === 'GP' ? 'default' : 'secondary'}>
          {labels.venteLabel}
        </Badge>
        {commentaire && (
          <span className="text-xs text-on-surface-muted italic truncate max-w-xs">
            {commentaire}
          </span>
        )}
      </div>

      {/* Section 1: Compte + Date + Devise */}
      <FormPanel title="Informations transaction">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Compte */}
          <div className="flex flex-col gap-1.5">
            <Label required>{labels.compteLabel}</Label>
            <Combobox
              options={MOCK_COMPTES}
              value={watch('compteNumero')}
              onChange={handleCompteChange}
              placeholder="Rechercher un compte..."
              searchPlaceholder="Nom ou numero..."
              emptyMessage="Aucun compte trouve"
              disabled={readOnly}
              error={errors.compteNumero?.message}
            />
            {errors.compteNumero && (
              <span className="text-xs text-danger">{errors.compteNumero.message}</span>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <Label required>Date</Label>
            <Input
              type="date"
              {...register('dateTransaction', { required: 'Date obligatoire' })}
              disabled={readOnly}
              error={errors.dateTransaction?.message}
            />
            {errors.dateTransaction && (
              <span className="text-xs text-danger">{errors.dateTransaction.message}</span>
            )}
          </div>

          {/* Devise */}
          <div className="flex flex-col gap-1.5">
            <Label required>Devise</Label>
            <Select
              {...register('devise', { required: 'Devise obligatoire' })}
              disabled={readOnly}
              error={errors.devise?.message}
            >
              {DEVISES.map((d) => (
                <SelectOption key={d.value} value={d.value}>
                  {d.label}
                </SelectOption>
              ))}
            </Select>
            {errors.devise && (
              <span className="text-xs text-danger">{errors.devise.message}</span>
            )}
          </div>
        </div>
      </FormPanel>

      {/* Section 1.5: Article Type Selector */}
      <FormPanel title="Type d'article">
        <ArticleTypeSelector
          selected={articleType}
          onSelect={handleArticleTypeChange}
          mode={mode}
          disabled={readOnly}
        />
        {articleType === 'VRL' && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVrlIdentityOpen(true)}
              disabled={readOnly}
            >
              {vrlIdentity
                ? `${vrlIdentity.nom} ${vrlIdentity.prenom}`
                : 'Saisir identite VRL'}
            </Button>
            {vrlIdentity && <Badge variant="default">Identite saisie</Badge>}
          </div>
        )}
        {(articleType === 'VRL' || articleType === 'VSL') && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForfaitOpen(true)}
              disabled={readOnly}
            >
              {forfaitDates
                ? `${forfaitDates.debut} → ${forfaitDates.fin}`
                : 'Dates forfait'}
            </Button>
            {forfaitDates && <Badge variant="default">Dates definies</Badge>}
          </div>
        )}
      </FormPanel>

      {/* Annulation banner */}
      {articleType === 'ANN' && annulationRef && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Annulation de la transaction #{annulationRef}
        </div>
      )}

      {/* Section 2: Lines */}
      <FormPanel
        title={labels.articlesLabel}
        actions={
          !readOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLine}
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          ) : undefined
        }
      >
        {errors.lignes?.message && (
          <div className="mb-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.lignes.message}
          </div>
        )}

        {/* Inline editable lines */}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                'grid gap-2 items-end rounded-md border border-border p-3',
                readOnly && 'opacity-70',
              )}
              style={{
                gridTemplateColumns:
                  mode === 'Boutique'
                    ? '120px 1fr 80px 120px 120px 40px'
                    : '1fr 80px 120px 120px 40px',
              }}
            >
              {mode === 'Boutique' && (
                <div>
                  {index === 0 && (
                    <Label className="text-xs mb-1">Code produit</Label>
                  )}
                  <Input
                    {...register(`lignes.${index}.codeProduit`)}
                    placeholder="Code"
                    disabled={readOnly}
                    error={
                      errors.lignes?.[index]?.codeProduit?.message
                    }
                  />
                </div>
              )}
              <div>
                {index === 0 && (
                  <Label className="text-xs mb-1" required>
                    Description
                  </Label>
                )}
                <Input
                  {...register(`lignes.${index}.description`, {
                    required: 'Obligatoire',
                  })}
                  placeholder="Description article"
                  disabled={readOnly}
                  error={errors.lignes?.[index]?.description?.message}
                />
              </div>
              <div>
                {index === 0 && (
                  <Label className="text-xs mb-1" required>
                    Qte
                  </Label>
                )}
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...register(`lignes.${index}.quantite`, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Min 1' },
                    onChange: (e) =>
                      handleLineChange(index, 'quantite', Number(e.target.value)),
                  })}
                  disabled={readOnly}
                  error={errors.lignes?.[index]?.quantite?.message}
                  className="text-right"
                />
              </div>
              <div>
                {index === 0 && (
                  <Label className="text-xs mb-1" required>
                    Prix unit.
                  </Label>
                )}
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...register(`lignes.${index}.prixUnitaire`, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Min 0' },
                    onChange: (e) =>
                      handleLineChange(
                        index,
                        'prixUnitaire',
                        Number(e.target.value),
                      ),
                  })}
                  disabled={readOnly}
                  error={errors.lignes?.[index]?.prixUnitaire?.message}
                  className="text-right"
                />
              </div>
              <div>
                {index === 0 && (
                  <Label className="text-xs mb-1">Montant</Label>
                )}
                <div className="flex h-9 items-center justify-end rounded-md bg-surface-dim px-3 text-sm font-medium">
                  {formatCurrency(lignes[index]?.montant ?? 0, devise)}
                </div>
              </div>
              <div>
                {index === 0 && <div className="h-4 mb-1" />}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLine(index)}
                  disabled={readOnly || fields.length <= 1}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </FormPanel>

      {/* Section 3: Totals */}
      <FormPanel title="Totaux">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-muted">Total HT</span>
              <span className="font-medium">
                {formatCurrency(totals.totalHT, devise)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
              <span>Total TTC</span>
              <span>{formatCurrency(totals.totalTTC, devise)}</span>
            </div>
          </div>
        </div>
      </FormPanel>

      {/* Section 4: Payment Methods */}
      <FormPanel title="Reglement">
        <PaymentMethodGrid
          catalog={catalogMOP}
          selectedMOP={selectedMOP}
          paymentSide={paymentSide}
          totalTransaction={totals.totalTTC}
          devise={devise}
          onAddMOP={addMOP}
          onRemoveMOP={removeMOP}
          onTogglePaymentSide={togglePaymentSide}
          disabled={readOnly}
        />
      </FormPanel>

      {/* Section 5: Verifications */}
      <FormPanel title="Verifications">
        <div className="space-y-3">
          <GiftPassCheck
            result={giftPassBalance}
            isChecking={isCheckingGiftPass}
            onCheck={handleCheckGiftPass}
            disabled={readOnly}
          />
          <ResortCreditCheck
            result={resortCreditBalance}
            isChecking={isCheckingResortCredit}
            onCheck={handleCheckResortCredit}
            disabled={readOnly}
          />
        </div>
      </FormPanel>

      {/* Section 6: Summary */}
      {showSummary && buildDraft() && (
        <TransactionSummary draft={buildDraft()} selectedMOP={selectedMOP} />
      )}

      {/* Section 7: Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCommentaireOpen(true)}
            disabled={readOnly}
          >
            <MessageSquare className="h-4 w-4" />
            Commentaire
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={readOnly || isSubmitting}>
            {showSummary ? (isSubmitting ? 'Soumission...' : 'Confirmer') : (isSubmitting ? 'Validation...' : 'Valider')}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <VRLIdentityDialog
        open={vrlIdentityOpen}
        onOpenChange={setVrlIdentityOpen}
        onValidate={handleVRLValidate}
        initialData={vrlIdentity ?? undefined}
      />

      <ForfaitDialog
        open={forfaitOpen}
        onOpenChange={setForfaitOpen}
        catalogForfaits={catalogForfaits}
        onValidate={handleForfaitValidate}
      />

      <CommentaireDialog
        open={commentaireOpen}
        onOpenChange={setCommentaireOpen}
        value={commentaire}
        onSave={handleCommentaireSave}
      />

      <TPERecoveryDialog
        open={tpeRecoveryOpen || !!tpeError}
        onOpenChange={(open) => {
          if (!open) setTpeRecoveryOpen(false);
        }}
        error={tpeError ?? ''}
        montant={totals.totalTTC}
        devise={devise}
        mopCatalog={catalogMOP}
        onRetry={(newMop: string) => addMOP(newMop, totals.totalTTC)}
        onCancel={onCancel}
      />

      <AnnulationReferenceDialog
        open={showAnnulationDialog}
        onClose={() => setShowAnnulationDialog(false)}
        onValidate={handleAnnulationValidate}
      />

      <GiftPassConfirmDialog
        open={showGiftPassConfirm}
        onClose={() => setShowGiftPassConfirm(false)}
        onSelect={handleGiftPassConfirmSelect}
        balance={giftPassBalance?.balance ?? 0}
      />
    </form>
  );
}
