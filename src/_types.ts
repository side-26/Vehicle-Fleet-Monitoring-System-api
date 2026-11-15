export interface PaginationData<T, M = unknown> {
  metadata: PaginationMetadata<M>;
  result: Array<T>;
}

interface PaginationMetadata<M = unknown> {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
  data: M;
}

export interface BsePaginationParams {
  page: number;
  perPage: number;
}

export interface ErrorResponse {
  isSuccess: false;
  status: number;
  message: string | null;
  data: ErrorResponseData;
}

interface ErrorResponseData<D = unknown> {
  details: D;
  fieldMessage: FieldErrorMessage[] | null;
}

interface FieldErrorMessage {
  name: string;
  message: string;
}

export interface SuccessResponse<D> {
  isSuccess: true;
  message: string | null;
  data: D;
}
