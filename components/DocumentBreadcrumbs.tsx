'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DocumentBreadcrumbsProps {
  documentId: string;
}

export function DocumentBreadcrumbs({ documentId }: DocumentBreadcrumbsProps) {
  const [document, setDocument] = useState<{ title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          setDocument(data);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const items: Breadcrumb[] = [
    { label: 'Documents', href: '/' },
    { label: document?.title || 'Loading...' },
  ];

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 