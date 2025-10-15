import z from "zod";

// package.validation.ts
export const createPackageValidationSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Package name must be at least 2 characters long.'),
        price: z.number().positive('Price must be positive.'),
        amount: z.number().positive('Amount must be positive.'),
        description: z.string().min(5, 'Description must be at least 5 characters long.'),
        status: z.enum(['active', 'inactive']).optional(),
    }),
})

export const updatePackageValidationschema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    amount: z.number().positive().optional(),
    description: z.string().min(5).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
