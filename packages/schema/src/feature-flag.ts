import { z } from 'zod/v3'
import { attachMeta } from './utils.js'

export const FEATURE_FLAG_BRING_YOUR_OWN_SANDBOX = 'bring_your_own_sandbox'
export const FEATURE_FLAG_CUSTOM_SPEC_AND_DATACENTER = 'custom_spec_and_datacenter'
export const FEATURE_FLAG_ANDROID_CONTAINER = 'android_container'

export type FeatureFlagName =
  | typeof FEATURE_FLAG_BRING_YOUR_OWN_SANDBOX
  | typeof FEATURE_FLAG_CUSTOM_SPEC_AND_DATACENTER
  | typeof FEATURE_FLAG_ANDROID_CONTAINER

export const setFeatureFlagSchema = z.object({
  organizationId: attachMeta(z.string().describe(/* i18n */ 'The organization ID to set the feature flag for.'), {
    title: /* i18n */ 'Organization ID',
    fieldComponent: 'string',
  }),
  featureFlag: attachMeta(z.string().describe(/* i18n */ 'The feature flag to set.'), {
    title: /* i18n */ 'Feature Flag',
    fieldComponent: 'string',
  }),
  featureFlagValue: attachMeta(
    z
      .string()
      .optional()
      .describe(/* i18n */ 'The value of the feature flag. If not provided, the feature flag will be set to true.'),
    {
      title: /* i18n */ 'Feature Flag Value (optional)',
      fieldComponent: 'string',
    },
  ),
})

export const removeFeatureFlagSchema = z.object({
  organizationId: attachMeta(z.string().describe(/* i18n */ 'The organization ID to remove the feature flag for.'), {
    title: /* i18n */ 'Organization ID',
    fieldComponent: 'string',
  }),
  featureFlag: attachMeta(z.string().describe(/* i18n */ 'The feature flag to remove.'), {
    title: /* i18n */ 'Feature Flag',
    fieldComponent: 'string',
  }),
})
