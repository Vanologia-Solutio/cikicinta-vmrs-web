export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message: string;
  timestamp: Date;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
  timestamp: Date;
};
