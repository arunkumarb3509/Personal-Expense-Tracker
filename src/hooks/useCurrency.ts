import { useAuth } from '@/context/AuthContext';
import { formatCurrency, DEFAULT_CURRENCY, CURRENCIES } from '@/constants/currencies';

export function useCurrency() {
  const { user } = useAuth();
  const currencyCode = user?.currency || DEFAULT_CURRENCY;
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.INR;

  const format = (amount: number | null | undefined, showDecimals: boolean = false) => {
    return formatCurrency(amount, currencyCode, showDecimals);
  };

  return {
    currencyCode,
    currencySymbol: currencyInfo.symbol,
    currencyInfo,
    format,
  };
}
