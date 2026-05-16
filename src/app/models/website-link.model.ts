export interface WebsiteLink {
  id: number;
  clientName: string;
  websiteUrl: string;
  loginUsername: string;
  loginPassword: string;
  referenceSource: string; // e.g. Fiverr, Upwork, Direct, etc.
  referenceDetail?: string; // extra detail about the reference
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface WebsiteLinkCreate {
  clientName: string;
  websiteUrl: string;
  loginUsername: string;
  loginPassword: string;
  referenceSource: string;
  referenceDetail?: string;
  notes?: string;
  isActive?: boolean;
}

export interface WebsiteLinkUpdate {
  clientName?: string;
  websiteUrl?: string;
  loginUsername?: string;
  loginPassword?: string;
  referenceSource?: string;
  referenceDetail?: string;
  notes?: string;
  isActive?: boolean;
}
