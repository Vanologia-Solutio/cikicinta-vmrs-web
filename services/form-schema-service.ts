import httpClient from "@/lib/http-client";
import { ENDPOINTS } from "@/shared/constants/endpoints";
import { ApiResponse } from "@/shared/types/api-response";
import { FormSchema } from "@/shared/types/form";
import { AxiosInstance } from "axios";
import { FieldValues } from "react-hook-form";

class FormSchemaService {
  private httpClient: AxiosInstance = httpClient;

  async getFormSchemaByKey<T extends FieldValues = FieldValues>(
    key: string,
  ): Promise<ApiResponse<FormSchema<T>>> {
    const res = await this.httpClient.get(
      ENDPOINTS.formSchemas.getFormSchemaByKey,
      {
        params: { key },
      },
    );
    return res.data;
  }
}

export const formSchemaService = new FormSchemaService();
