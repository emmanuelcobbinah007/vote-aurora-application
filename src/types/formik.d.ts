import { FormikValues } from 'formik';

declare module 'formik' {
  interface FormikHelpers<Values> {
    setSubmitting: (isSubmitting: boolean) => void;
  }
}