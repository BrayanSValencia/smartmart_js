import { z } from 'zod';


export const userInputSchema = z.object({
  username: z.string().min(1).max(150),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.coerce.string().max(10),
  dateOfBirth:  z.coerce.date(),
  //isActive:true,

  //isActive: z.boolean(),
  //isStaff: z.boolean(),
  //email: z.string().email().max(254),
  //password: z.string().min(8).max(128)

});

export const registerInputSchema = z.object({
  username: z.string().min(1).max(150),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.coerce.string().max(10),
  dateOfBirth: z.coerce.date(),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128)
});


export const userOutputSerializer = (userInstance) =>{

    return {
  username: userInstance.username,
  firstName: userInstance.firstName,
  lastName: userInstance.lastName,
  phone: userInstance.phone,
  dateOfBirth: userInstance.dateOfBirth,

}

};

export const userPartialUpdateSchema = userInputSchema.partial();
