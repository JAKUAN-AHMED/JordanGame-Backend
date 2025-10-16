import { z } from 'zod';

export const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Full name is required.',
        invalid_type_error: 'Full name must be a string.',
      })
      .min(2, 'Full name must be at least 2 characters long.'),
    email: z
      .string({
        required_error: 'Email is required.',
        invalid_type_error: 'Email must be a string.',
      })
      .email('Invalid email address.'),
    phone: z
      .string({
        required_error: 'Phone number is required.',
        invalid_type_error: 'Phone number must be a string.',
      })
      .min(10, 'Phone number must be at least 10 characters long.'),
    address: z.string({
      required_error: 'Address is required.',
      invalid_type_error: 'Address must be a string.',
    }),
    password: z
      .string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
      })
      .min(8, 'Password must be at least 8 characters long.'),
    profileImage: z.string().optional(),
    role: z.enum(['admin', 'user']).default('user').optional(),
    profileStatus: z
      .enum(['active', 'delete', 'block', 'suspend', 'disabled'])
      .default('active')
      .optional(),
  }),
});

// ✅ Update schema (makes fields inside body optional)
export const updateUserValidationSchema = z.object({
  body: createUserValidationSchema.shape.body
    .extend({
      status: z
        .object({
          isDeleted: z.boolean().optional(),
          isBlocked: z.boolean().optional(),
          isDeactivated: z.boolean().optional(),
        })
        .optional(),
      isEmailVerified: z.boolean().optional(),
    })
    .partial(), // 👈 only fields inside body are optional
});

// ✅ Change status schema (strict for PATCH status)
export const changeUserStatusValidationSchema = z.object({
  body: z.object({
    profileStatus: z
      .enum(['active', 'delete', 'block', 'suspend', 'disabled'])
      .optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  changeUserStatusValidationSchema,
};
