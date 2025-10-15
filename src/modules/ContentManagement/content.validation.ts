import { z } from 'zod';

const baseContentSchema = z.object({
  name: z
    .string({
      required_error: 'Content name is required.',
      invalid_type_error: 'Content name must be a string.',
    })
    .min(2, 'Content name must be at least 2 characters long.'),
  description: z
    .string({
      required_error: 'Description is required.',
      invalid_type_error: 'Description must be a string.',
    })
    .min(5, 'Description must be at least 5 characters long.'),
  imgUrl: z
    .string({
      invalid_type_error: 'Image URL must be a string.',
    })
    .url('Invalid image URL format.')
    .optional()
    .nullable(),
  status: z
    .enum(['active', 'locked'], {
      invalid_type_error: 'Status must be: active or locked.',
    })
    .default('locked')
    .optional(),
});

export const createContentValidationSchema = z.object({
  body: z.discriminatedUnion('category', [
    z.object({
      category: z.literal('skin'),
      numberOfCarrot: z.coerce
        .number({
          required_error: 'Number of carrots is required for skin category.',
          invalid_type_error: 'Number of carrots must be a number.',
        })
        .int('Number of carrots must be an integer.')
        .positive('Number of carrots must be positive.'),
    }).merge(baseContentSchema),

    z.object({
      category: z.literal('power-up'),
      timeInSec: z.coerce
        .number({
          required_error: 'Time in seconds is required for power-up category.',
          invalid_type_error: 'Time in seconds must be a number.',
        })
        .int('Time in seconds must be an integer.')
        .positive('Time in seconds must be positive.'),
    }).merge(baseContentSchema),

    z.object({
      category: z.literal('achievement'),
      targetValueInFt: z.coerce
        .number({
          required_error: 'Target value in feet is required for achievement category.',
          invalid_type_error: 'Target value must be a number.',
        })
        .positive('Target value must be positive.'),
    }).merge(baseContentSchema),

    z.object({
      category: z.literal('obstacles'),
    }).merge(baseContentSchema),
  ]),
});

export const updateContentValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Content name must be at least 2 characters long.').optional(),
    category: z.enum(['skin', 'power-up', 'achievement', 'obstacles']).optional(),
    description: z.string().min(5, 'Description must be at least 5 characters long.').optional(),
    imgUrl: z.string().url('Invalid image URL format.').optional(),
    numberOfCarrot: z.coerce.number().int().positive().optional(),
    timeInSec: z.coerce.number().int().positive().optional(),
    targetValueInFt: z.coerce.number().positive().optional(),
    status: z.enum(['active', 'locked']).optional(),
  }).refine(
    (data) => {
      // If category is being updated, validate corresponding fields
      if (data.category === 'skin' && data.numberOfCarrot === undefined) {
        return false;
      }
      if (data.category === 'power-up' && data.timeInSec === undefined) {
        return false;
      }
      if (data.category === 'achievement' && data.targetValueInFt === undefined) {
        return false;
      }
      // obstacles doesn't require any special field
      return true;
    },
    {
      message: 'Required field missing for the specified category',
    }
  ),
});

export const ContentValidation = {
  createContentValidationSchema,
  updateContentValidationSchema,
};
