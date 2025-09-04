/**
 * Calculates an array representing the pagination range to display
 *
 * @param currentPage - The currently active page
 * @param totalPages - The total number of pages
 * @param siblingCount - Number of sibling pages to show on each side of current page
 * @returns Array of page numbers and ellipsis indicators
 */
export function calculatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1,
): (number | string)[] {
  const totalPageNumbers = siblingCount * 2 + 5; // first + last + current + siblings*2 + dots*2

  // Case 1: Total pages is less than the numbers we want to show -> show all
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculate left and right sibling indices, ensuring they are within bounds
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  // Calculate if dots should be shown
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: No left dots, but right dots needed, e.g., [1, 2, 3, 4, 5, ..., 10]
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "ellipsis-right", lastPageIndex];
  }

  // Case 3: Left dots needed, but no right dots e.g., [1, ..., 6, 7, 8, 9, 10]
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i,
    );
    return [firstPageIndex, "ellipsis-left", ...rightRange];
  }

  // Case 4: Both left and right dots needed, e.g., [1, ..., 4, 5, 6, ..., 10]
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [
      firstPageIndex,
      "ellipsis-left",
      ...middleRange,
      "ellipsis-right",
      lastPageIndex,
    ];
  }

  // Fallback (shouldn't be reached with the logic above)
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}
