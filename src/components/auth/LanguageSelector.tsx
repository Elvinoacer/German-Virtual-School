'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">translate</span>
        <span>English (EN)</span>
        <span className="material-symbols-outlined text-[18px]">
          expand_more
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-light dark:bg-surface-dark shadow-lg ring-1 ring-black ring-opacity-5 z-10"
        >
          <div className="py-1">
            <button
              onClick={() => {
                // Language selection logic here
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              English (EN)
            </button>
            <button
              onClick={() => {
                // Language selection logic here
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Deutsch (DE)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
