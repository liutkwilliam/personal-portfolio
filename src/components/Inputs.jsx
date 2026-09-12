import React from "react";

export function Label({ label }) {
  return (
    <>
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
    </>
  )
}

export function Dropdown({ label, value, onChange, children }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label label={label} />
        <select name="category" value={value} onChange={onChange} className="mb-2 w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-2 py-2">
          {children}
        </select>
      </div>
    </>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label label={label} />
        <textarea
          placeholder="Content (Markdown supported)"
          className="min-h-50 rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          {...props}
        />
      </div>
    </>
  );
}


export function Inputs({ label, ...props }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label label={label} />
        <input
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          {...props}
        />
      </div>
    </>
  );
}
