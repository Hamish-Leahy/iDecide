export const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
};

export const calculatePrice = (basePrice: number, taxRate: number): number => {
    return basePrice + (basePrice * taxRate);
};

export const generateUniqueId = (): string => {
    return 'id-' + Math.random().toString(36).substr(2, 9);
};