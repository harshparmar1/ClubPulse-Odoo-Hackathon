import React from 'react';

const variantClasses = {
  active: 'bg-teal-50 text-teal-700 border-teal-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  done: 'bg-teal-50 text-teal-700 border-teal-200',
  paid: 'bg-teal-50 text-teal-700 border-teal-200',
  
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  todo: 'bg-slate-100 text-slate-700 border-slate-200',

  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  expired: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',

  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200'
};

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const normVariant = variant.toLowerCase().replace('-', '_');
  const classes = variantClasses[normVariant] || variantClasses.neutral;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes} ${className}`}
    >
      {children}
    </span>
  );
};
