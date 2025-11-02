import { PaginationOptions } from '../interfaces/pagination-options.interface';

export const calculatePagination = (
  { page, perPage }: PaginationOptions,
  total: number,
) => {
  const from = (page - 1) * perPage;
  const to = page * perPage > total ? total : from + perPage;

  if (from + 1 > total && total !== 0) {
    throw new Error('Paginación inválida');
  }

  return { from, to };
};
