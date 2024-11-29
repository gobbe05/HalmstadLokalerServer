import Office, { IOffice } from '../models/officeModel'

/**
 * Increment views for a batch of documents and return the updated documents.
 * @param filter - MongoDB filter to match documents.
 * @returns Promise<IOffice[]> - Array of updated documents.
 */
export const incrementAndFetchOneOffice = async (
  filter: Record<string, unknown>, // Generic filter type
): Promise<IOffice> => {
  try {
    // Increment views for the office document
    await Office.updateOne(filter, { $inc: { visits: 1 } });

    // Fetch the updated documents
    const office = await Office.findOne(filter);  

    return office as IOffice; // Cast result to match the expected type
  } catch (error) {
    console.error('Error incrementing and fetching batch:', error);
    throw new Error('Failed to increment and fetch batch');
  }
}