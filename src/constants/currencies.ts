export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'prefix' | 'suffix';
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    symbolPosition: 'prefix',
    decimalPlaces: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbolPosition: 'prefix',
    decimalPlaces: 0,
  },
};

export const DEFAULT_CURRENCY = 'INR';

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = DEFAULT_CURRENCY,
  showDecimals: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  
  // Format with commas according to Indian or International standard
  let formattedNumber = '';
  if (currencyCode === 'INR') {
    // Indian numbering format (lakhs, crores)
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const parts = (showDecimals ? absVal.toFixed(curr.decimalPlaces) : Math.round(absVal).toString()).split('.');
    let intPart = parts[0];
    const decPart = parts[1];

    if (intPart.length > 3) {
      const lastThree = intPart.substring(intPart.length - 3);
      const otherNumbers = intPart.substring(0, intPart.length - 3);
      const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
      formattedNumber = res;
    } else {
      formattedNumber = intPart;
    }
    if (showDecimals && decPart) {
      formattedNumber += '.' + decPart;
    }
    if (isNegative) {
      formattedNumber = '-' + formattedNumber;
    }
  } else {
    formattedNumber = amount.toLocaleString(undefined, {
      minimumFractionDigits: showDecimals ? curr.decimalPlaces : 0,
      maximumFractionDigits: curr.decimalPlaces,
    });
  }

  return curr.symbolPosition === 'prefix'
    ? `${curr.symbol}${formattedNumber}`
    : `${formattedNumber} ${curr.symbol}`;
}
