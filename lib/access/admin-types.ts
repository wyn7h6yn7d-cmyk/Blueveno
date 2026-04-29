import type { AccessState } from "@/lib/access/types";

export type AdminUserListItem = {
  user_id: string;
  email: string;
  display_name: string | null;
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
  premium_ends_at: string | null;
  account_count: number;
  recent_activity: string[];
  trading_accounts: Array<{
    id: string;
    name: string;
    account_type: string | null;
    created_at: string | null;
  }>;
  internal_note: string | null;
  premium_granted_reason: string | null;
  premium_granted_at: string | null;
  premium_granted_by: string | null;
};
