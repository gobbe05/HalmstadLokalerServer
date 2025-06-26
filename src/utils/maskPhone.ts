export default function maskPhone(phone: string): string {
    if (!phone) return '';
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If the phone number is less than 4 digits, return it as is
    if (digits.length <= 4) return digits;

    // Mask all but the last 4 digits
    const maskedPart = '*'.repeat(digits.length - 4);
    const visiblePart = digits.slice(-4);

    return maskedPart + visiblePart;
}