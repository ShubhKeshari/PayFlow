import { getAllBooksService, getBookByIdService } from '../services/book.service.js';

/**
 * Book Controller
 * Thin HTTP handler layer: handles HTTP request validation and delegates business logic to book.service.js.
 */
export const getBooks = async (req, res) => {
  try {
    const books = await getAllBooksService();
    return res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error("❌ Error fetching books catalog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve books catalog",
      error: error.message
    });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await getBookByIdService(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(`❌ Error fetching book ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve book details",
      error: error.message
    });
  }
};
