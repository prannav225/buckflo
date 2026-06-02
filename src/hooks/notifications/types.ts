export interface NotificationItem {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  category: "alerts" | "bills" | "insights";
  title: string;
  description: string;
  iconName:
    | "alert"
    | "budget"
    | "trend-up"
    | "trend-down"
    | "sub"
    | "goal"
    | "advisor";
  action?: {
    label: string;
    onClick: () => void;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}
