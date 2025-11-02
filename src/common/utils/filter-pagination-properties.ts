import { PaginationOptions } from '../interfaces/pagination-options.interface';

export function filterPaginationProperties<DataDto>(source: any) {
  // Por medio del source recolecta las propiedades del pagtionOptionsDto y lo restante asignalo a filter
  const { page, perPage, paginate } = source;
  const pagination: PaginationOptions = {
    page,
    perPage,
    paginate,
  };

  delete source.page;
  delete source.perPage;
  delete source.paginate;

  const filter: DataDto = { ...source } as DataDto;

  return { pagination, filter };
}
