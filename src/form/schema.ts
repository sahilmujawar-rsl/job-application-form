import { z } from 'zod'

const isValidDate = (value: string) => {
  if (!value) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

const isFutureDate = (value: string) => {
  if (!isValidDate(value)) return false
  return new Date(`${value}T00:00:00`).getTime() > Date.now()
}

const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  const dayOfMonth = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate()
  result.setDate(Math.min(dayOfMonth, lastDayOfMonth))
  return result
}

const ageIsAtLeast18 = (value: string) => {
  if (!isValidDate(value)) return false
  const today = new Date()
  const birthDate = new Date(`${value}T00:00:00`)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }
  return age >= 18
}

const urlOrEmpty = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https?:\/\/.*/i.test(value),
    'Enter a valid URL starting with http:// or https://',
  )

const requiredDate = (message: string) =>
  z.string().trim().refine((value) => isValidDate(value), message)

const requiredText = (fieldName: string, minLength = 2) =>
  z.string().trim().min(minLength, `${fieldName} is required`).max(120)

const requiredDigitString = (fieldName: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', `${fieldName} is required`)
    .refine((value) => /^\d+(?:\.\d+)?$/.test(value), `${fieldName} must be numeric`)
    .refine((value) => Number(value) >= min && Number(value) <= max, `${fieldName} must be between ${min} and ${max}`)

export const educationSchema = z.object({
  id: z.string(),
  degree: requiredText('Degree'),
  institution: requiredText('Institution'),
  yearOfPassing: requiredDigitString('Year of passing', 1950, new Date().getFullYear() + 2),
  percentage: requiredDigitString('Percentage', 0, 100),
})

export const companySchema = z
  .object({
    id: z.string(),
    company: requiredText('Company name'),
    role: requiredText('Role'),
    from: requiredDate('Start date is required'),
    to: requiredDate('End date is required'),
  })
  .refine(
    (company) => {
      if (!company.from || !company.to) return false
      return new Date(`${company.to}T00:00:00`).getTime() >= new Date(`${company.from}T00:00:00`).getTime()
    },
    {
      message: 'To date must be on or after the from date',
      path: ['to'],
    },
  )

const fresherExperienceSchema = z.object({
  experienceType: z.literal('fresher'),
  availabilityToJoin: requiredDate('Availability to join is required').refine(
    isFutureDate,
    'Availability to join must be in the future',
  ),
})

const experiencedExperienceSchema = z.object({
  experienceType: z.literal('experienced'),
  totalExperience: requiredDigitString('Total experience', 0, 60),
  noticePeriod: requiredDigitString('Notice period', 0, 180).refine(
    (value) => Number.isInteger(Number(value)),
    'Notice period must be a whole number of months',
  ),
  previousCompanies: z
    .array(companySchema)
    .min(1, 'Add at least one previous company'),
})

export const experienceSchema = z.discriminatedUnion('experienceType', [
  fresherExperienceSchema,
  experiencedExperienceSchema,
])

export const personalDetailsSchema = z.object({
  fullName: requiredText('Full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(8, 'Phone number is required')
    .max(20, 'Phone number is too long')
    .regex(/^[+]?([0-9\s()-.]+)$/, 'Enter a valid phone number'),
  dateOfBirth: requiredDate('Date of birth is required').refine(
    ageIsAtLeast18,
    'Candidate must be at least 18 years old',
  ),
  currentCity: requiredText('Current city'),
})

export const applicationDetailsSchema = z.object({
  positionAppliedFor: requiredText('Position applied for'),
  expectedJoiningDate: requiredDate('Expected joining date is required').refine(
    isFutureDate,
    'Expected joining date must be in the future',
  ),
  portfolioLink: urlOrEmpty,
  coverNote: z.string().trim().max(500).optional().or(z.literal('')),
  termsAccepted: z.boolean().refine((value) => value === true, 'You must accept the terms to continue'),
})

export const jobApplicationSchema = z
  .object({
    personalDetails: personalDetailsSchema,
    education: z.array(educationSchema).min(1, 'Add at least one qualification'),
    experience: experienceSchema,
    applicationDetails: applicationDetailsSchema,
  })
  .superRefine((data, ctx) => {
    const expectedJoiningDate = data.applicationDetails.expectedJoiningDate

    if (data.experience.experienceType === 'experienced') {
      const noticePeriod = Number.parseFloat(data.experience.noticePeriod)
      const totalExperience = Number.parseFloat(data.experience.totalExperience)
      if (!Number.isNaN(noticePeriod) && !Number.isNaN(totalExperience) && noticePeriod > totalExperience * 12 + 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['experience', 'noticePeriod'],
          message: 'Notice period should not exceed the total experience by more than 12 months',
        })
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const minJoiningDate = addMonths(today, noticePeriod)
      const applicationDate = new Date(`${expectedJoiningDate}T00:00:00`)
      if (!Number.isNaN(applicationDate.getTime()) && applicationDate <= minJoiningDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['applicationDetails', 'expectedJoiningDate'],
          message: 'Expected joining date must be after your notice period ends',
        })
      }
    }
  })

export type JobApplicationData = z.infer<typeof jobApplicationSchema>

export const createEntryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `field-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const defaultValues: JobApplicationData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    currentCity: '',
  },
  education: [
    {
      id: createEntryId(),
      degree: '',
      institution: '',
      yearOfPassing: '',
      percentage: '',
    },
  ],
  experience: {
    experienceType: 'fresher',
    availabilityToJoin: '',
  },
  applicationDetails: {
    positionAppliedFor: '',
    expectedJoiningDate: '',
    portfolioLink: '',
    coverNote: '',
    termsAccepted: false,
  },
}
