export interface CodatDataConnection {
  id: string;
  linkUrl: string;
  platformName: string;
  status: string;
  code: string;
  lastSynced: CodatRecordLastSynced;
  bankAccounts?: { id: CodatBankAccount };
}

export interface CodatBankAccount {
  accountName: string;
  accountType: string;
  availableBalance: number;
  balance: number;
  currency: string;
  enabled: boolean;
  id: string;
  modifiedDate: string;
  plaidItem: string;
  sourceModifiedDate: string;
}

interface CodatRecordLastSynced {
  transfers: string;
  directIncomes: string;
  directCosts: string;
  payments: string;
  accountTransactions: string;
  accounts: string;
}

export type AccountingProvider = 'custom' | 'codat.Quickbooks' | 'codat.Xero';

export interface CodatData {
  company_id: string;
  lastBillsModifiedDateChecked?: string;
  lastBankAccountsModifiedDateChecked?: string;
  lastAccountsSynced?: string;
  lastSynced?: string;
  dataConnections?: { id: CodatDataConnection };
}

export interface AccounntingData {
  codat: CodatData;
  provider: AccountingProvider;
}
