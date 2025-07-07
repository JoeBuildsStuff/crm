export type Company = {
  id: string;
  created_at?: string;
  name: string;
  description?: string;
}

// Form-specific types (for your React component)
export type CompanyFormData = {
  name: string;
  description: string;
}

// API response types
export type CompanyListResponse = {
  companies: Company[];
  total: number;
}

export type CompanyDetailResponse = Company;

// Insert/Update types (without generated fields)
export type CompanyInsert = Omit<Company, 'id' | 'created_at'>;
export type CompanyUpdate = Partial<CompanyInsert>;

// Utility types for the component
export type CompanyData = {
  name: string;
  description: string;
}