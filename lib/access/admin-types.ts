import type { AccessState } from "@/lib/access/types";

export type AdminUserListItem = {
  user_id: string;
  email: string;
  is_admin: boolean;
  trial_ends_at: string;
  manual_premium: boolean;
  premium_active: boolean;
  account_disabled: boolean;
  last_active_at: string | null;
  created_at: string;
  journal_entry_count: number;
  access_state: AccessState;
  subscription_label: string;
};
