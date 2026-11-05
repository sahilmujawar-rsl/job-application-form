import { useFormContext, type FieldPath } from 'react-hook-form'
import type { HTMLInputTypeAttribute } from 'react'
import type { JobApplicationData } from '../form/schema'
import { getFieldError } from './formErrors'

type FieldProps = {
  name: FieldPath<JobApplicationData>
  label: string
}

type TextFieldProps = FieldProps & {
  type?: HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  min?: string
  max?: string
  step?: string
}

export function TextField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  min,
  max,
  step,
}: TextFieldProps) {
  const { register, formState: { errors } } = useFormContext<JobApplicationData>()
  const fieldError = getFieldError(errors, name)
  const inputId = name.replaceAll('.', '-')

  return (
    <div className="field-wrap">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={fieldError ? 'field-input invalid' : 'field-input'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        aria-invalid={Boolean(fieldError)}
        aria-describedby={fieldError ? `${inputId}-error` : undefined}
        {...register(name)}
      />
      {fieldError && (
        <p id={`${inputId}-error`} className="field-error" role="alert">
          {fieldError.message}
        </p>
      )}
    </div>
  )
}

export function TextArea({
  name,
  label,
  placeholder,
}: FieldProps & {
  placeholder?: string
}) {
  const { register, formState: { errors } } = useFormContext<JobApplicationData>()
  const fieldError = getFieldError(errors, name)
  const inputId = name.replaceAll('.', '-')

  return (
    <div className="field-wrap">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <textarea
        id={inputId}
        className={fieldError ? 'field-input invalid' : 'field-input'}
        placeholder={placeholder}
        aria-invalid={Boolean(fieldError)}
        aria-describedby={fieldError ? `${inputId}-error` : undefined}
        {...register(name)}
      />
      {fieldError && (
        <p id={`${inputId}-error`} className="field-error" role="alert">
          {fieldError.message}
        </p>
      )}
    </div>
  )
}

export function Checkbox({ name, label }: FieldProps) {
  const { register, formState: { errors } } = useFormContext<JobApplicationData>()
  const fieldError = getFieldError(errors, name)
  const inputId = name.replaceAll('.', '-')

  return (
    <div className="checkbox-wrap">
      <label htmlFor={inputId} className="checkbox-label">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? `${inputId}-error` : undefined}
          {...register(name)}
        />
        <span>{label}</span>
      </label>
      {fieldError && (
        <p id={`${inputId}-error`} className="field-error" role="alert">
          {fieldError.message}
        </p>
      )}
    </div>
  )
}
