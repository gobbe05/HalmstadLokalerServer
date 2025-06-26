export default function maskEmail(email: string): string {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email; // If no domain, return the original email

    const maskedLocalPart = localPart.length > 2 
        ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2) 
        : localPart;

    return `${maskedLocalPart}@${domain}`;
}