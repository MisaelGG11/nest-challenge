import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginatedResultDto } from '../dto/paginated-result.dto';

export const ApiPaginatedResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  hasCatalog: boolean = false,
) =>
  applyDecorators(
    ApiExtraModels(PaginatedResultDto, dataDto),
    ApiOkResponse({
      schema: hasCatalog
        ? {
            // If the response has a catalog, the response will be an array of the data schema or a paginated result of the data schema
            oneOf: [
              {
                title: `PaginatedResultOf${dataDto.name}`,
                allOf: [
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(dataDto) }, // Data schema
                      },
                    },
                  },
                  { $ref: getSchemaPath(PaginatedResultDto) }, // Pagination schema
                ],
              },
              {
                title: `CatalogOf${dataDto.name}`,
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) }, // Data schema as a catalog
              },
            ],
          }
        : {
            // If not, the response will be a paginated result of the data schema
            title: `PaginatedResultOf${dataDto.name}`,
            allOf: [
              {
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataDto) }, // Data schema
                  },
                },
              },
              { $ref: getSchemaPath(PaginatedResultDto) }, // Pagination schema
            ],
          },
    }),
  );
