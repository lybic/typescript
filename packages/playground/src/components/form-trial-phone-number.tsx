import { z } from 'zod/v4'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import { forwardRef } from 'react'

const formSchema = z.object({
  phoneNumber: z.string().min(1),
  verificationCode: z.string().min(1),
})

export function FormTrialPhoneNumber() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      verificationCode: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Only phone numbers from China Mainland is supported" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMS Code</FormLabel>
              <FormControl>
                <SendSMSCodeField {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

const SendSMSCodeField = forwardRef<HTMLInputElement>((props, ref) => {
  return (
    <div className="flex gap-2">
      <Input {...props} ref={ref} placeholder="6-digits code" />
      <Button variant="outline">Send SMS Code</Button>
    </div>
  )
})
