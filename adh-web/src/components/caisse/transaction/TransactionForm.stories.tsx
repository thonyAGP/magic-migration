import type { Meta, StoryObj } from '@storybook/react';
import { TransactionForm } from './TransactionForm';
import type { TransactionFormData, TransactionLineFormData } from './types';

const meta = {
  title: 'Caisse/TransactionForm',
  component: TransactionForm,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl mx-auto p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLines: TransactionLineFormData[] = [
  {
    id: 'line-1',
    description: 'Sejour Village Nature 7 nuits',
    quantite: 2,
    prixUnitaire: 1200,
    montant: 2400,
    devise: 'EUR',
  },
  {
    id: 'line-2',
    description: 'Forfait ski adulte 6 jours',
    quantite: 2,
    prixUnitaire: 180,
    montant: 360,
    devise: 'EUR',
  },
  {
    id: 'line-3',
    description: 'Assurance annulation',
    quantite: 1,
    prixUnitaire: 89.5,
    montant: 89.5,
    devise: 'EUR',
  },
];

const boutiqueLines: TransactionLineFormData[] = [
  {
    id: 'line-b1',
    description: 'T-Shirt Club Med L',
    quantite: 3,
    prixUnitaire: 35,
    montant: 105,
    devise: 'EUR',
    codeProduit: 'TSH-CM-L',
  },
  {
    id: 'line-b2',
    description: 'Casquette brodee',
    quantite: 1,
    prixUnitaire: 25,
    montant: 25,
    devise: 'EUR',
    codeProduit: 'CAS-BR-01',
  },
];

const handleSubmit = async (_data: TransactionFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const handleCancel = () => {
  // noop for storybook
};

export const GPMode: Story = {
  args: {
    mode: 'GP',
    initialData: {
      compteNumero: '10001',
      compteNom: 'DUPONT Jean',
      devise: 'EUR',
      dateTransaction: '2026-02-09',
      lignes: mockLines,
    },
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  },
};

export const BoutiqueMode: Story = {
  args: {
    mode: 'Boutique',
    initialData: {
      compteNumero: '10002',
      compteNom: 'MARTIN Sophie',
      devise: 'EUR',
      dateTransaction: '2026-02-09',
      lignes: boutiqueLines,
    },
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  },
};

export const Empty: Story = {
  args: {
    mode: 'GP',
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  },
};

export const ReadOnly: Story = {
  args: {
    mode: 'GP',
    readOnly: true,
    initialData: {
      compteNumero: '10001',
      compteNom: 'DUPONT Jean',
      devise: 'EUR',
      dateTransaction: '2026-02-09',
      lignes: mockLines,
      commentaire: 'Transaction validee par superviseur',
    },
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  },
};

export const WithValidationErrors: Story = {
  args: {
    mode: 'Boutique',
    initialData: {
      compteNumero: '',
      compteNom: '',
      devise: 'EUR',
      dateTransaction: '',
      lignes: [
        {
          id: 'line-err',
          description: '',
          quantite: 0,
          prixUnitaire: -5,
          montant: 0,
          devise: 'EUR',
          codeProduit: '',
        },
      ],
    },
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  },
};
