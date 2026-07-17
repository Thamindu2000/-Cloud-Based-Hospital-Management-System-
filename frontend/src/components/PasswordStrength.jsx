import React from 'react';

const PasswordStrength = ({ password }) => {
  const tests = [
    { regex: /.{8,}/, text: "Be at least 8 characters long" },
    { regex: /[A-Z]/, text: "At least one uppercase letter (A-Z)" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least one special character (!@#$%^&*)" }
  ];

  const score = password ? tests.filter(t => t.regex.test(password)).length : 0;
  const colors = ["bg-red-500", "bg-orange-400", "bg-emerald-500"];

  return (
    <div className="mt-3 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
      {/* Segmented Status Bar */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full flex overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex-1 transition-colors duration-300 ${
              score > i ? colors[score - 1] : "bg-slate-200"
            } ${i > 0 ? "ml-1" : ""}`}
          ></div>
        ))}
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {tests.map((t, i) => {
          const isPassed = password ? t.regex.test(password) : false;
          return (
            <div
              key={i}
              className={`flex items-center text-xs transition-colors duration-300 ${
                isPassed ? "text-emerald-700 font-medium" : "text-slate-400"
              }`}
            >
              {isPassed ? (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 mr-2 text-[10px]">
                  ✓
                </span>
              ) : (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-400 mr-2 text-[10px]">
                  ✗
                </span>
              )}
              <span>{t.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
