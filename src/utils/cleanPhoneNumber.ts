export default function CleanPhoneNumber(phoneNumber: string | null | undefined): boolean {
    if (!phoneNumber) {
        return false;
    }

    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    return true
}