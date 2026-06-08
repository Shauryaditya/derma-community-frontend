export type StrapiItem = {
  id: number;
  documentId?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CollectionResponse = {
  data?: StrapiItem[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};
