export declare type NewPartnerRequest = {
  partner_name: string;
  partner_type: string;
  website?: string;
  pod_id: string;
  pod_created_date: string;
  primary_contact_email: string;
  primary_contact_name: string;
  associatedCompanyIds: string[];
  associatedContactIds: string[];
  count_of_managed_stores: number;
  count_of_managed_users: number;
};
