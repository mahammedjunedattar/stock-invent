// app/models/item.js
import { z } from 'zod';

export const ItemSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .transform(str => str.trim()),

  sku: z.string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU cannot exceed 50 characters")
    .regex(/^[A-Z0-9_]+$/, "SKU can only contain uppercase letters, numbers and underscores")
    .transform(str => str.toUpperCase()),

  quantity: z.number()
    .int("Must be a whole number")
    .nonnegative("Quantity cannot be negative")
    .lte(999999, "Quantity too large"),

  minStock: z.number()
    .int("Must be a whole number")
    .nonnegative("Minimum stock cannot be negative")
    .default(5),

  lastUpdated: z.date()
    .default(() => new Date())
});

export const validateItem = (data) => {
  try {
    // Strip unrecognized keys before validation
    const strippedData = {
      name: data.name,
      sku: data.sku,
      quantity: Number(data.quantity),
      minStock: Number(data.minStock) || 5
    };

    return ItemSchema.safeParse(strippedData);
  } catch (error) {
    return {
      success: false,
      error: new z.ZodError([{
        code: z.ZodIssueCode.custom,
        path: [],
        message: "Invalid item structure"
      }])
    };
  }
};