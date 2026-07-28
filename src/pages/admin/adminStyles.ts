export const userStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent text-accent-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

export const roleColors: Record<string, string> = {
  partner: "bg-primary/10 text-primary",
  dropshipper: "bg-accent text-accent-foreground",
  distributor: "bg-secondary text-secondary-foreground",
  admin: "bg-destructive/10 text-destructive",
  warehouse: "bg-secondary text-secondary-foreground",
};

export const withdrawStatusColors: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  completed: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
};

export const orderStatusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};
