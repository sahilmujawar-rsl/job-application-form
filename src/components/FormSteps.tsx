import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { createEntryId, type JobApplicationData } from '../form/schema'
import { Checkbox, TextArea, TextField } from './FormFields'
import { getFieldError } from './formErrors'

export function PersonalDetailsStep() {
  return (
    <section className="step-section">
      <div className="two-column-grid">
        <TextField name="personalDetails.fullName" label="Full name" placeholder="John Doe" autoComplete="name" />
        <TextField name="personalDetails.email" label="Email" type="email" placeholder="john@email.com" autoComplete="email" />
      </div>

      <div className="two-column-grid">
        <TextField name="personalDetails.phone" label="Phone" type="tel" placeholder="+1 (555) 123-4567" autoComplete="tel" />
        <TextField name="personalDetails.dateOfBirth" label="Date of birth" type="date" />
      </div>

      <TextField name="personalDetails.currentCity" label="Current city" placeholder="Bengaluru" autoComplete="address-level2" />
    </section>
  )
}

export function EducationStep() {
  const { control, formState: { errors } } = useFormContext<JobApplicationData>()
  const { fields: qualifications, append: addQualification, remove: removeQualification } = useFieldArray({
    control,
    name: 'education',
  })
  const educationError = getFieldError(errors, 'education')

  return (
    <section className="step-section">
      <div className="list-header">
        <h3>Qualifications</h3>
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            addQualification({
              id: createEntryId(),
              degree: '',
              institution: '',
              yearOfPassing: '',
              percentage: '',
            })
          }
        >
          Add qualification
        </button>
      </div>

      {educationError && (
        <p className="field-error" role="alert">
          {educationError.message}
        </p>
      )}

      {qualifications.map((field, index) => (
        <div className="array-card" key={field.id}>
          <div className="card-header">
            <h4>Qualification {index + 1}</h4>
            {qualifications.length > 1 && (
              <button type="button" className="remove-button" onClick={() => removeQualification(index)}>
                Remove
              </button>
            )}
          </div>

          <div className="three-column-grid">
            <TextField name={`education.${index}.degree`} label="Degree" placeholder="B.Tech / MBA" />
            <TextField name={`education.${index}.institution`} label="Institution" placeholder="University name" />
            <TextField name={`education.${index}.yearOfPassing`} label="Year of passing" type="number" min="1950" max="2100" placeholder="2024" />
          </div>

          <TextField name={`education.${index}.percentage`} label="Percentage / CGPA" type="number" min="0" max="100" step="0.01" placeholder="88" />
        </div>
      ))}
    </section>
  )
}

export function ExperienceStep() {
  const { control, setValue, formState: { errors } } = useFormContext<JobApplicationData>()
  const experienceType = useWatch({ control, name: 'experience.experienceType' })
  const {
    fields: companies,
    append: addCompany,
    remove: removeCompany,
  } = useFieldArray({
    control,
    name: 'experience.previousCompanies',
  })
  const companiesError = getFieldError(errors, 'experience.previousCompanies')

  const switchExperienceType = (nextType: 'fresher' | 'experienced') => {
    setValue('experience.experienceType', nextType, { shouldValidate: true })

    if (nextType === 'fresher') {
      setValue('experience.availabilityToJoin', '', { shouldValidate: true })
      return
    }

    if (companies.length === 0) {
      addCompany({ id: createEntryId(), company: '', role: '', from: '', to: '' })
    }

    setValue('experience.totalExperience', '', { shouldValidate: true })
    setValue('experience.noticePeriod', '', { shouldValidate: true })
  }

  return (
    <section className="step-section">
      <div className="segmented-control" role="radiogroup" aria-label="Experience type selector">
        <button
          type="button"
          className={experienceType === 'fresher' ? 'segment active' : 'segment'}
          onClick={() => switchExperienceType('fresher')}
          aria-pressed={experienceType === 'fresher'}
        >
          Fresher
        </button>
        <button
          type="button"
          className={experienceType === 'experienced' ? 'segment active' : 'segment'}
          onClick={() => switchExperienceType('experienced')}
          aria-pressed={experienceType === 'experienced'}
        >
          Experienced
        </button>
      </div>

      {experienceType === 'fresher' ? (
        <TextField name="experience.availabilityToJoin" label="Availability to join" type="date" />
      ) : (
        <>
          <div className="two-column-grid">
            <TextField name="experience.totalExperience" label="Total experience (years)" type="number" min="0" max="60" step="0.1" placeholder="4" />
            <TextField name="experience.noticePeriod" label="Notice period (months)" type="number" min="0" max="180" step="1" placeholder="3" />
          </div>

          <div className="list-header">
            <h3>Previous companies</h3>
            <button
              type="button"
              className="secondary-button"
              onClick={() => addCompany({ id: createEntryId(), company: '', role: '', from: '', to: '' })}
            >
              Add company
            </button>
          </div>

          {companies.map((field, index) => (
            <div className="array-card" key={field.id}>
              <div className="card-header">
                <h4>Company {index + 1}</h4>
                {companies.length > 1 && (
                  <button type="button" className="remove-button" onClick={() => removeCompany(index)}>
                    Remove
                  </button>
                )}
              </div>

              <div className="two-column-grid">
                <TextField name={`experience.previousCompanies.${index}.company`} label="Company" placeholder="Acme Corp" />
                <TextField name={`experience.previousCompanies.${index}.role`} label="Role" placeholder="Frontend Engineer" />
              </div>

              <div className="two-column-grid">
                <TextField name={`experience.previousCompanies.${index}.from`} label="From" type="date" />
                <TextField name={`experience.previousCompanies.${index}.to`} label="To" type="date" />
              </div>
            </div>
          ))}

          {companiesError && (
            <p className="field-error" role="alert">
              {companiesError.message}
            </p>
          )}
        </>
      )}
    </section>
  )
}

export function ApplicationDetailsStep() {
  return (
    <section className="step-section">
      <div className="two-column-grid">
        <TextField name="applicationDetails.positionAppliedFor" label="Position applied for" placeholder="Senior Frontend Engineer" />
        <TextField name="applicationDetails.expectedJoiningDate" label="Expected joining date" type="date" />
      </div>

      <div className="two-column-grid">
        <TextField name="applicationDetails.portfolioLink" label="Portfolio link (optional)" type="url" placeholder="https://yourportfolio.com" />
        <div />
      </div>

      <TextArea name="applicationDetails.coverNote" label="Cover note (optional)" placeholder="Briefly describe your interest and fit for the role." />
      <Checkbox name="applicationDetails.termsAccepted" label="I accept the terms and conditions for this application." />
    </section>
  )
}

export function ReviewStep() {
  const { control } = useFormContext<JobApplicationData>()
  const personalDetails = useWatch({ control, name: 'personalDetails' })
  const education = useWatch({ control, name: 'education' })
  const experience = useWatch({ control, name: 'experience' })
  const applicationDetails = useWatch({ control, name: 'applicationDetails' })

  return (
    <section className="step-section">
      <div className="review-card">
        <h3>Personal Details</h3>
        <dl>
          <div><dt>Full name</dt><dd>{personalDetails?.fullName || '—'}</dd></div>
          <div><dt>Email</dt><dd>{personalDetails?.email || '—'}</dd></div>
          <div><dt>Phone</dt><dd>{personalDetails?.phone || '—'}</dd></div>
          <div><dt>Date of birth</dt><dd>{personalDetails?.dateOfBirth || '—'}</dd></div>
          <div><dt>Current city</dt><dd>{personalDetails?.currentCity || '—'}</dd></div>
        </dl>
      </div>

      <div className="review-card">
        <h3>Education</h3>
        {education?.length ? (
          education.map((item, index) => (
            <dl key={item.id || index}>
              <div><dt>Degree</dt><dd>{item.degree || '—'}</dd></div>
              <div><dt>Institution</dt><dd>{item.institution || '—'}</dd></div>
              <div><dt>Year</dt><dd>{item.yearOfPassing || '—'}</dd></div>
              <div><dt>Percentage</dt><dd>{item.percentage || '—'}</dd></div>
            </dl>
          ))
        ) : (
          <p>No qualifications added.</p>
        )}
      </div>

      <div className="review-card">
        <h3>Experience</h3>
        {experience?.experienceType === 'fresher' ? (
          <dl>
            <div><dt>Type</dt><dd>Fresher</dd></div>
            <div><dt>Availability to join</dt><dd>{experience.availabilityToJoin || '—'}</dd></div>
          </dl>
        ) : (
          <dl>
            <div><dt>Type</dt><dd>Experienced</dd></div>
            <div><dt>Total experience</dt><dd>{experience?.totalExperience || '—'}</dd></div>
            <div><dt>Notice period</dt><dd>{experience?.noticePeriod || '—'}</dd></div>
          </dl>
        )}
        {experience?.experienceType === 'experienced' &&
          experience.previousCompanies.map((company, index) => (
            <div className="review-company" key={company.id}>
              <h4>Company {index + 1}</h4>
              <dl>
                <div><dt>Company</dt><dd>{company.company || '—'}</dd></div>
                <div><dt>Role</dt><dd>{company.role || '—'}</dd></div>
                <div><dt>From</dt><dd>{company.from || '—'}</dd></div>
                <div><dt>To</dt><dd>{company.to || '—'}</dd></div>
              </dl>
            </div>
          ))}
      </div>

      <div className="review-card">
        <h3>Application Details</h3>
        <dl>
          <div><dt>Position</dt><dd>{applicationDetails?.positionAppliedFor || '—'}</dd></div>
          <div><dt>Expected joining date</dt><dd>{applicationDetails?.expectedJoiningDate || '—'}</dd></div>
          <div><dt>Portfolio</dt><dd>{applicationDetails?.portfolioLink || '—'}</dd></div>
          <div><dt>Cover note</dt><dd>{applicationDetails?.coverNote || '—'}</dd></div>
          <div><dt>Terms accepted</dt><dd>{applicationDetails?.termsAccepted ? 'Yes' : 'No'}</dd></div>
        </dl>
      </div>
    </section>
  )
}
