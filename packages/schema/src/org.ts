import { z } from 'zod/v3'

export const sendSmsVerificationCodeSchema = z.object({
  mobileNumber: z.string().min(1),
  captcha: z.string().min(1),
})

export type SendSmsVerificationCode = z.infer<typeof sendSmsVerificationCodeSchema>

export const verifyMobileSchema = z.object({
  mobileNumber: z.string().min(1),
  verificationCode: z.string().min(1),
})

export type VerifyMobile = z.infer<typeof verifyMobileSchema>
