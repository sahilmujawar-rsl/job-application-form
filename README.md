# Job Application Form

A five-step application form built with React, TypeScript, React Hook Form, and Zod.

## Run locally

```bash
npm install
npm run dev
```

## Form structure

`src/form/schema.ts` defines the Zod schemas and the `JobApplicationData` type inferred from them. The experience schema is a discriminated union for fresher and experienced applicants. Education and previous companies use React Hook Form field arrays.

`src/App.tsx` owns one `useForm` instance and shares it with each step through `FormProvider`. Steps validate on Next, and the complete schema is checked on submit. The form uses `onBlur` validation to avoid showing errors while a user is still typing.

`src/form/mockApi.ts` simulates a 1.5-second request. Use an email containing `validation` to see a field error, `server` to simulate a server failure, or any other valid email for success.

The experience step and review step subscribe to only the values they display with `useWatch`. Repeating sections use `useFieldArray`.

The application walkthrough, including both error responses and success, is recorded in `evidence/job-application-demo.webm`. The recording sequence is documented in `evidence/validation-demo-script.md`.

## Remaining assignment items

- Publish the code and provide a branch name and pull request link.
- Share status updates by email.
