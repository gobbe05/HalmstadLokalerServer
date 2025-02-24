import Office, { IOffice } from '../../models/officeModel'

/**
 * Increment views for a batch of documents and return the updated documents.
 * @param filter - MongoDB filter to match documents.
 * @param limit - Limit
 * @returns Promise<IOffice[]> - Array of updated documents.
 */
export const incrementAndFetchOffices = async (
  filter: Record<string, unknown>, // Generic filter type
  offset: number,
  limit?: number
): Promise<IOffice[]> => {
  try {
    // Find documents matching the filter with a limit
    const matchingDocuments = limit ? await Office.find(filter).limit(limit) : await Office.find(filter)

    // Extract the IDs of the limited documents
    const ids = matchingDocuments.map((doc) => doc._id);

    // Increment views for all matching documents
    await Office.updateMany({ _id: { $in: ids } }, { $inc: { views: 1 } });

    // Fetch the updated documents
    const updatedDocuments = limit ? await Office.find(filter).skip(offset).limit(limit) : await Office.find(filter).skip(offset)  

    return updatedDocuments; // Cast result to match the expected type
  } catch (error) {
    console.error('Error incrementing and fetching batch:', error);
    throw new Error('Failed to increment and fetch batch');
  }
}