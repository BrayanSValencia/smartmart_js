import { z } from 'zod';


export const loginInputSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128)

});

