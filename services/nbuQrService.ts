
import { PaymentData, QrVersion, QrGenerationResult } from '../types';

/**
 * Base64URL encoding implementation (RFC 4648)
 * Replaces + with -, / with _, and removes padding =
 */
const toBase64Url = (str: string): string => {
  // Use TextEncoder to handle UTF-8 properly before b64
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const b64 = btoa(binString);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const generateNbuPaymentUrl = (data: PaymentData, version: QrVersion = QrVersion.V002): QrGenerationResult => {
  const lineEnding = '\n';
  
  // Construct the raw structure based on NBU rules
  // Table 1, Appendix 2/3
  const fields: string[] = [
    'BCD',                      // Service Tag
    version,                   // Version (002 or 003)
    '1',                       // Coding (1 = UTF-8)
    'UCT',                     // Function (Ukrainian Credit Transfer)
    '',                        // BIC (Reserved/Optional)
    data.recipientName,        // Recipient Name
    data.iban,                 // Recipient IBAN
    data.amount ? `${data.currency}${data.amount}` : '', // Amount with currency prefix
    data.identificationCode,   // Recipient ID (EDRPOU/IPN)
    '',                        // Purpose Code (Reserved)
    data.reference || '',      // Reference
    data.purpose,              // Purpose Text
    data.display || '',        // Display Text
  ];

  const rawPayload = fields.join(lineEnding);
  const encodedPayload = toBase64Url(rawPayload);
  
  // Base URLs provided in documents
  const baseUrl = version === QrVersion.V002 || version === QrVersion.V003 
    ? 'https://bank.gov.ua/qr/' 
    : 'https://qr.bank.gov.ua/';

  return {
    fullUrl: `${baseUrl}${encodedPayload}`,
    rawPayload,
    encodedPayload
  };
};
