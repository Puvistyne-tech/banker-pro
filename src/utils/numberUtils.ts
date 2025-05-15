// src/utils/numberUtils.ts
export function parseFrenchCurrency(value: string): number | null {
    if (!value) return null;

    // Remove € symbol and any whitespace
    let cleanedValue = value.replace(/€/g, '').trim();

    // If the value contains both dots and commas, assume the last one is the decimal separator
    const hasDot = cleanedValue.includes('.');
    const hasComma = cleanedValue.includes(',');

    if (hasDot && hasComma) {
        // If both exist, use the last one as decimal separator
        const lastDot = cleanedValue.lastIndexOf('.');
        const lastComma = cleanedValue.lastIndexOf(',');
        const decimalSeparator = lastDot > lastComma ? '.' : ',';
        
        // Remove all other separators and replace the decimal one with a dot
        cleanedValue = cleanedValue
            .replace(new RegExp(`[^0-9${decimalSeparator}]`, 'g'), '') // Remove everything except numbers and decimal separator
            .replace(decimalSeparator, '.'); // Replace decimal separator with dot
    } else {
        // If only one type of separator exists, use it as decimal
        const separator = hasDot ? '.' : hasComma ? ',' : null;
        if (separator) {
            cleanedValue = cleanedValue
                .replace(new RegExp(`[^0-9${separator}]`, 'g'), '') // Remove everything except numbers and separator
                .replace(separator, '.'); // Replace separator with dot
        } else {
            // No separators, just remove non-numeric characters
            cleanedValue = cleanedValue.replace(/[^0-9]/g, '');
        }
    }

    const num = parseFloat(cleanedValue);
    return isNaN(num) ? null : num;
}

export function formatCurrency(value: number | null | undefined, locale = 'fr-FR', currency = 'EUR'): string {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}