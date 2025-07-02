import { z } from 'zod';


export const categoryInputSchema = z.object({
 name:z.coerce.string().min(1).max(100),
  //slug:z.coerce.string().min(1).max(255)

});

export const categoryOutputSerializer = z.object({
 
  name:z.coerce.string().min(1).max(100),
  slug:z.coerce.string().min(1).max(255),
 

});