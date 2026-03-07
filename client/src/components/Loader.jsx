import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-white z-50">
      <div className="w-14 h-14 border-4 border-slate-300 border-t-black rounded-full animate-spin"></div>

      <p className="text-sm text-slate-600 tracking-wide">Loading...</p>
    </div>
  );
};

export default Loader;
