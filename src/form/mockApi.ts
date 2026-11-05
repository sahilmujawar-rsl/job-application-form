import type { FieldPath } from 'react-hook-form'
import type { JobApplicationData } from './schema'

type FieldError = {
  name: FieldPath<JobApplicationData>
  message: string
}

type SubmitResponse =
  | {
      ok: true
      message: string
    }
  | {
      ok: false
      fieldErrors?: FieldError[]
      message?: string
    }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function submitApplication(data: JobApplicationData): Promise<SubmitResponse> {
  await wait(1500)

  const email = data.personalDetails.email.toLowerCase()

  if (email.includes('validation')) {
    return {
      ok: false,
      fieldErrors: [
        {
          name: 'personalDetails.email',
          message: 'This email address is already associated with another application.',
        },
      ],
      message: 'Please correct the highlighted fields and try again.',
    }
  }

  if (email.includes('server')) {
    throw new Error('The server is temporarily unavailable. Please try again in a moment.')
  }

  return {
    ok: true,
    message: 'Application submitted successfully. Our recruiting team will contact you soon.',
  }
}
