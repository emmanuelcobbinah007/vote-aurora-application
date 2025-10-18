"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/services/adminApi";

interface PasswordFormProps {
  adminId: string;
  onSuccess?: () => void;
}

const PasswordForm = ({ adminId, onSuccess }: PasswordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.currentPassword) {
        errors.currentPassword = "Current password is required";
      }
      if (!values.newPassword) {
        errors.newPassword = "New password is required";
      } else if (values.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your new password";
      } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setIsSubmitting(true);
        setMessage(null);

        await adminApi.changeAdminPassword(adminId, {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        });

        setMessage({ type: 'success', text: 'Password updated successfully!' });
        resetForm();
        onSuccess?.();
      } catch (error: any) {
        console.error("Error changing password:", error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Failed to update password. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white shadow-sm rounded-lg p-4 md:col-span-2"
    >
      <h2 className="text-lg font-medium mb-3">Change password</h2>

      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-3">
        <label className="text-sm font-medium">Current password</label>
        <input
          name="currentPassword"
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
          className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none"
        />
        {formik.touched.currentPassword && formik.errors.currentPassword && (
          <div className="text-sm text-red-600">
            {formik.errors.currentPassword}
          </div>
        )}

        <label className="text-sm font-medium">New password</label>
        <input
          name="newPassword"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
          className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none"
        />
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div className="text-sm text-red-600">
            {formik.errors.newPassword}
          </div>
        )}

        <label className="text-sm font-medium">Confirm password</label>
        <input
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
          className="w-full border border-gray-200 rounded px-3 py-2 focus:outline-none"
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="text-sm text-red-600">
            {formik.errors.confirmPassword}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="bg-[#cc910d] text-white hover:bg-amber-700"
          >
            {formik.isSubmitting ? "Saving..." : "Update password"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PasswordForm;
