"use client";
// @ts-nocheck

import React, { useState } from "react";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/services/adminApi";
import type { AdminProfile } from "@/services/adminApi";

interface PreferencesFormProps {
  adminId: string;
  adminProfile: AdminProfile;
  onSuccess?: () => void;
}

const PreferencesForm = ({ adminId, adminProfile, onSuccess }: PreferencesFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  interface FormValues {
    full_name: string;
    email: string;
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      full_name: adminProfile?.full_name || "",
      email: adminProfile?.email || "",
    },
    validate: (values: FormValues) => {
      const errors: Record<string, string> = {};
      if (!values.full_name) {
        errors.full_name = "Full name is required";
      }
      if (!values.email) {
        errors.email = "Email is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = "Invalid email address";
      }
      return errors;
    },
    onSubmit: async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
      try {
        setIsSubmitting(true);
        setMessage(null);

        await adminApi.updateAdminProfile(adminId, {
          full_name: values.full_name,
          email: values.email,
        });

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        onSuccess?.();
      } catch (error: any) {
        console.error("Error updating profile:", error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Failed to update profile. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="bg-white shadow-sm rounded-lg p-4 md:col-span-2">
      <h2 className="text-lg font-medium mb-3">Profile Information</h2>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Full Name</label>
          <input
            name="full_name"
            type="text"
            value={formik.values.full_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {formik.touched.full_name && formik.errors.full_name && (
            <div className="text-sm text-red-600 mt-1">
              {formik.errors.full_name}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-sm text-red-600 mt-1">
              {formik.errors.email}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="bg-[#cc910d] text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PreferencesForm;
