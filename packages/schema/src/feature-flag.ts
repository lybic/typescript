export const FEATURE_FLAG_BRING_YOUR_OWN_SANDBOX = 'bring_your_own_sandbox' as const
export const FEATURE_FLAG_CUSTOM_SPEC_AND_DATACENTER = 'custom_spec_and_datacenter' as const
export const FEATURE_FLAG_MACHINE_IMAGE = 'machine_image' as const

export type FeatureFlagName =
  | typeof FEATURE_FLAG_BRING_YOUR_OWN_SANDBOX
  | typeof FEATURE_FLAG_CUSTOM_SPEC_AND_DATACENTER
  | typeof FEATURE_FLAG_MACHINE_IMAGE
