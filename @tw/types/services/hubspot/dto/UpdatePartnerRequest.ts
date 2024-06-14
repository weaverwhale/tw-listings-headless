export declare type updatePartnerRequest = {
  partner_name: string;
  partner_type: string;
  website?: string;
  primary_contact_email: string;
  primary_contact_name: string;
  companiesToMarkAsRemoved: string[];
  contactsToMarkAsRemoved: string[];
  companiesToAdd: string[];
  contactsToAdd: string[];
  count_of_managed_stores: number;
  count_of_managed_users: number;
};
