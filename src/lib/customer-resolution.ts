export const CUSTOMER_RESOLUTION_VALUES = ["RESOLVED", "NOT_RESOLVED"] as const;
export type CustomerResolution = (typeof CUSTOMER_RESOLUTION_VALUES)[number];

export function isCustomerResolution(value: string): value is CustomerResolution {
  return (CUSTOMER_RESOLUTION_VALUES as readonly string[]).includes(value);
}
