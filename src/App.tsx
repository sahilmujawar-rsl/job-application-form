
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import { useEffect, useState } from 'react'
import {
  defaultValues,
  jobApplicationSchema,
  type JobApplicationData,
} from './form/schema'
import { submitApplication } from './form/mockApi'
import {
  ApplicationDetailsStep,
  EducationStep,
  ExperienceStep,
  PersonalDetailsStep,
  ReviewStep,
} from './components/FormSteps'
import './App.css'

type FormStep = {
  title: string
  fields: FieldPath<JobApplicationData>[]
}

const steps: FormStep[] = [
  {
    title: 'Personal Details',
    fields: [
      'personalDetails.fullName',
      'personalDetails.email',
      'personalDetails.phone',
      'personalDetails.dateOfBirth',
      'personalDetails.currentCity',
    ],
  },
  { title: 'Education', fields: ['education'] },
  { title: 'Experience', fields: ['experience'] },
  {
    title: 'Application Details',
    fields: [
      'applicationDetails.positionAppliedFor',
      'applicationDetails.expectedJoiningDate',
      'applicationDetails.portfolioLink',
      'applicationDetails.coverNote',
      'applicationDetails.termsAccepted',
    ],
  },
  { title: 'Review & Submit', fields: [] },
]

const focusFirstInvalidField = () => {
  const invalid = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      '[aria-invalid="true"]',
    ),
  ).find((element) => element.offsetParent !== null)

  invalid?.focus()
}

function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'validation' | 'error'>('idle')
  const [submissionMessage, setSubmissionMessage] = useState('')

  useEffect(() => {
    if (submissionStatus === 'validation') {
      focusFirstInvalidField()
    }
  }, [stepIndex, submissionStatus])

  const methods = useForm<JobApplicationData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const isLastStep = stepIndex === steps.length - 1

  const moveToNextStep = async () => {
    const fieldsToValidate = steps[stepIndex].fields
    if (fieldsToValidate.length === 0) {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1))
      return
    }

    const isValid = await methods.trigger(fieldsToValidate)
    if (!isValid) {
      focusFirstInvalidField()
      return
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  const submitForm = async (data: JobApplicationData) => {
    methods.clearErrors()
    setSubmissionStatus('idle')
    setSubmissionMessage('')

    try {
      const result = await submitApplication(data)

      if (!result.ok) {
        setSubmissionStatus('validation')
        setSubmissionMessage(result.message ?? 'Please review the highlighted details.')

        result.fieldErrors?.forEach((error) => {
          methods.setError(error.name, {
            type: 'server',
            message: error.message,
          })
        })

        const firstError = result.fieldErrors?.[0]
        if (firstError) {
          const errorStep = steps.findIndex((step) =>
            step.fields.some(
              (field) => firstError.name === field || firstError.name.startsWith(`${field}.`),
            ),
          )
          if (errorStep >= 0) setStepIndex(errorStep)
        }
        return
      }

      setSubmissionStatus('success')
      setSubmissionMessage(result.message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The server request failed.'
      setSubmissionStatus('error')
      setSubmissionMessage(message)
    }
  }

  return (
    <main className="app-shell">
      <div className="form-card">
        <header className="form-header">
          <div>
            <p className="eyebrow">Careers Portal</p>
            <h1>Job Application</h1>
          </div>
          <div className="step-indicator" aria-live="polite">
            {steps.map((step, index) => (
              <span key={step.title} className={index === stepIndex ? 'step-pill active' : 'step-pill'}>
                {index + 1}
              </span>
            ))}
          </div>
        </header>

        <div className="wizard-title-wrap">
          <h2>{steps[stepIndex].title}</h2>
          <p>Step {stepIndex + 1} of {steps.length}</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitForm)} noValidate>
            {stepIndex === 0 && <PersonalDetailsStep />}
            {stepIndex === 1 && <EducationStep />}
            {stepIndex === 2 && <ExperienceStep />}
            {stepIndex === 3 && <ApplicationDetailsStep />}
            {stepIndex === 4 && <ReviewStep />}

            {(submissionStatus === 'success' || submissionStatus === 'validation' || submissionStatus === 'error') && (
              <div
                className={
                  submissionStatus === 'success'
                    ? 'status-banner success'
                    : submissionStatus === 'validation'
                      ? 'status-banner warning'
                      : 'status-banner error'
                }
                role="alert"
              >
                {submissionMessage}
              </div>
            )}

            <div className="action-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                disabled={stepIndex === 0 || methods.formState.isSubmitting}
              >
                Back
              </button>

              {isLastStep ? (
                <button key="submit" type="submit" className="primary-button" disabled={methods.formState.isSubmitting}>
                  {methods.formState.isSubmitting ? 'Submitting…' : 'Submit application'}
                </button>
              ) : (
                <button key="next" type="button" className="primary-button" onClick={moveToNextStep}>
                  Next
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </main>
  )
}

export default App
