'use client';

interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
}

const templates: Template[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Template for taking organized meeting notes',
    content: '# Meeting Notes\n\n## Date:\n\n## Attendees:\n\n## Agenda:\n\n## Discussion Points:\n\n## Action Items:\n\n## Next Steps:',
  },
  {
    id: 'project-plan',
    title: 'Project Plan',
    description: 'Template for project planning and tracking',
    content: '# Project Plan\n\n## Overview:\n\n## Objectives:\n\n## Timeline:\n\n## Resources:\n\n## Milestones:\n\n## Risks and Mitigation:',
  },
  // Add more templates as needed
];

export function TemplateGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map(template => (
        <div key={template.id} className="p-4 border rounded-lg hover:border-blue-500">
          <h3 className="font-medium mb-2">{template.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {template.description}
          </p>
          {/* Add preview or selection functionality */}
        </div>
      ))}
    </div>
  );
} 