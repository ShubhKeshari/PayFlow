import prisma from '../config/db.js';

/**
 * Book Service
 * Encapsulates data fetching and business logic for the catalog.
 */
export const getAllBooksService = async () => {
  return await prisma.book.findMany({
    orderBy: {
      createdAt: 'asc'
    }
  });
};

export const getBookByIdService = async (bookId) => {
  return await prisma.book.findUnique({
    where: { id: bookId }
  });
};
