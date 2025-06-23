export type RowDataType = {
  "Master ID": number;
  Product: string;
  Material: string;
  "Material Description": string;
  "Measurement Instrument": string;
  "Colour Similarity": string;
  "Product type": string;
  Function: string;
  Series: string;
  Colour: string;
  "Key Feature": string;
};

export type SortConfig = {
  key: keyof RowDataType;
  direction: "asc" | "desc";
} | null;

export type FilterConfig = {
  [key: string]: string;
};

export type PaginationData = {
  total_records: number;
  records_per_page: number;
  page: number;
  total_pages: number;
};

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "tel" | "select";
  required?: boolean;
  readOnly?: boolean;
  selectOptions?: SelectOption[];
  apiEndpoint?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export type ColumnConfig = {
  key: string;
  label: string;
};
