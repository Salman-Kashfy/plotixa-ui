interface Currency {
    symbol?: string;
    code?: string;
}

export const displayAmount = (currency: Currency, amount: number): string => {
    if (!amount) return '';

    // Format with proper thousands separators
    const formattedAmount = amount.toLocaleString('en', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    // Return in the format: "Rs 5,000.00" (symbol + space + formatted amount)
    return (`${currency?.symbol || ''} ${formattedAmount}`).trim();

    // Alternative formats (uncomment if preferred):
    // 1. With currency code: return `${currency.code} ${formattedAmount}`; // "PKR 5,000.00"
    // 2. Symbol without space: return `${currency.symbol}${formattedAmount}`; // "Rs5,000.00"
};