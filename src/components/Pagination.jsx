import React from "react";
import "../styles/Pagination.css";

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="pagination-controls">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        style={{ opacity: isFirstPage ? 0.5 : 1 }}
      >
        Prev
      </button>

      {currentPage < totalPages && (
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default Pagination;
