import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const shapeSchema = z.object({
  name: attachMeta(z.string(), {
    title: /* i18n */ 'Name',
    fieldComponent: 'string',
  }),
  description: attachMeta(z.string(), {
    title: /* i18n */ 'Description',
    fieldComponent: 'string',
  }),
  hardwareAcceleratedEncoding: attachMeta(z.boolean(), {
    title: /* i18n */ 'Hardware Accelerated Encoding',
    fieldComponent: 'switch',
  }),
  pricePerHour: attachMeta(
    z.coerce
      .number()
      .describe(
        /* i18n */ 'This price acts as a multiplier, e.g. if it is set to 0.5, each hour of usage will be billed as 0.5 hours.',
      ),
    {
      title: /* i18n */ 'Price Per Hour',
      fieldComponent: 'string',
    },
  ),
  requiredPlanTier: attachMeta(z.coerce.number(), {
    title: /* i18n */ 'Required Plan Tier',
    fieldComponent: 'string',
  }),
  os: attachMeta(z.enum(['Windows', 'Linux', 'Android']), {
    title: /* i18n */ 'OS',
    fieldComponent: 'select',
    fieldProps: {
      options: [
        {
          label: 'Windows',
          value: 'Windows',
        },
        {
          label: 'Linux',
          value: 'Linux',
        },
        {
          label: 'Android',
          value: 'Android',
        },
      ],
    },
  }),
  virtualization: attachMeta(z.enum(['KVM', 'Container']), {
    title: /* i18n */ 'Virtualization',
    fieldComponent: 'select',
    fieldProps: {
      options: [
        {
          label: 'KVM',
          value: 'KVM',
        },
        {
          label: 'Container',
          value: 'Container',
        },
      ],
    },
  }),
  architecture: attachMeta(z.enum(['x86_64', 'aarch64']), {
    title: /* i18n */ 'Architecture',
    fieldComponent: 'select',
    fieldProps: {
      options: [
        {
          label: 'x86_64',
          value: 'x86_64',
        },
        {
          label: 'aarch64',
          value: 'aarch64',
        },
      ],
    },
  }),
})

export const shapeCreateSchema = shapeSchema.extend({
  nomosSpecId: attachMeta(z.string(), {
    title: /* i18n */ 'Nomos Spec ID',
    fieldComponent: 'string',
  }),
  nomosDatacenterId: attachMeta(z.string(), {
    title: /* i18n */ 'Nomos Datacenter ID',
    fieldComponent: 'string',
  }),
})

export type Shape = z.infer<typeof shapeSchema>
export type ShapeCreate = z.infer<typeof shapeCreateSchema>
