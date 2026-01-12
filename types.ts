
export enum QrVersion {
  V001 = '001',
  V002 = '002',
  V003 = '003',
}

export interface PaymentData {
  recipientName: string;
  iban: string;
  amount?: number;
  currency: string;
  identificationCode: string; // EDRPOU or IPN
  purpose: string;
  reference?: string;
  display?: string;
}

export interface QrGenerationResult {
  fullUrl: string;
  rawPayload: string;
  encodedPayload: string;
}
