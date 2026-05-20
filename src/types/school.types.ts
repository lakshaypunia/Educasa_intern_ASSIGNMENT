import { z } from 'zod';

export interface School {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: Date;
}

export interface SchoolWithDistance extends School {
  distance_km: number;
}

export const addSchoolSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  latitude: z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export const listSchoolsSchema = z.object({
  latitude: z.preprocess(
    Number,
    z
      .number({ invalid_type_error: 'Latitude must be a number' })
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
  ),
  longitude: z.preprocess(
    Number,
    z
      .number({ invalid_type_error: 'Longitude must be a number' })
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
  ),
});

export type AddSchoolInput = z.infer<typeof addSchoolSchema>;
export type ListSchoolsInput = z.infer<typeof listSchoolsSchema>;
