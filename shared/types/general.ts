import type { PaginationState } from "@tanstack/react-table";

interface BaseEntity {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;
}

export interface BaseEntityWithId extends BaseEntity {
  id: string;
}

export interface PaginationQuery extends PaginationState {
  keyword?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
