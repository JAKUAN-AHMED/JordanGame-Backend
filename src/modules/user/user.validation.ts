import { z } from 'zod';

export const createUserValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),
    role: z
      .enum(['ADMIN', 'STAF', 'SUPERADMIN', 'BUSINESS', 'USER'])
      .default('USER'),
  }),
});

// ✅ Update schema (makes fields inside body optional)
export const updateUserValidationSchema = z.object({
  body: createUserValidationSchema.shape.body.extend({
    status: z
      .object({
        isDeleted: z.boolean().optional(),
        isBlocked: z.boolean().optional(),
        isDeactivated: z.boolean().optional(),
      })
      .optional(),
    isEmailVerified: z.boolean().optional(),
  }).partial(), // 👈 only fields inside body are optional
});

// ✅ Change status schema (strict for PATCH status)
export const changeUserStatusValidationSchema = z.object({
  body: z.object({
    status: z
      .object({
        isDeleted: z.boolean().optional(),
        isBlocked: z.boolean().optional(),
        isDeactivated: z.boolean().optional(),
      }),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  changeUserStatusValidationSchema,
};
