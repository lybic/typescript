import { z } from 'zod/v4'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { forwardRef, useCallback } from 'react'
import { useSendVerifyCode } from '@/hooks/use-send-verify-code'
import { useAliyunCaptcha } from '@/hooks/use-aliyun-captcha'
import { useCreateTrialUser } from '@/hooks/use-create-trial-user'

const formSchema = z.object({
  mobileNumber: z.string().min(10, { message: 'Mobile number is too short' }),
  verificationCode: z.string().length(6, { message: 'Verification code should be 6 digits' }),
})

export function VerifyPhoneNumber() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobileNumber: '',
      verificationCode: '',
    },
  })

  const createTrialUser = useCreateTrialUser()

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTrialUser.mutate({
      mobileNumber: values.mobileNumber,
      verificationCode: values.verificationCode,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Only mobile numbers from China Mainland is supported" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMS Code</FormLabel>
              <FormControl>
                <SendSMSCodeField form={form} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {createTrialUser.isError && <div className="text-destructive">{createTrialUser.error.message}</div>}
        <div className="flex justify-end">
          <Button type="submit" isLoading={createTrialUser.isPending}>
            Verify
          </Button>
        </div>
      </form>
    </Form>
  )
}

const SendSMSCodeField = forwardRef<HTMLInputElement, { form: UseFormReturn<z.infer<typeof formSchema>> }>(
  ({ form, ...props }, ref) => {
    const sendVerifyCode = useSendVerifyCode()

    const onAliyunCaptchaSuccess = useCallback(
      (captcha: string) => {
        form.setFocus('verificationCode', { shouldSelect: true })
        const mobileNumber = form.getValues('mobileNumber')
        sendVerifyCode.mutate({ mobileNumber, captcha })
      },
      [form, sendVerifyCode],
    )
    const aliyunCaptcha = useAliyunCaptcha({
      onSuccess: onAliyunCaptchaSuccess,
    })

    const handleSend = async () => {
      const valid = await form.trigger('mobileNumber')
      if (!valid) {
        form.setFocus('mobileNumber')
        return
      }
      aliyunCaptcha.show()
    }

    return (
      <div className="flex gap-2">
        <Input {...props} ref={ref} placeholder="6-digits code" />
        <Button
          variant="outline"
          onClick={handleSend}
          type="button"
          isLoading={sendVerifyCode.isPending || !aliyunCaptcha.loaded}
          disabled={sendVerifyCode.counter > 0}
        >
          {sendVerifyCode.counter > 0 ? `Resend in ${sendVerifyCode.counter}s` : 'Send SMS Code'}
        </Button>
      </div>
    )
  },
)
