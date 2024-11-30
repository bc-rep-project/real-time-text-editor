import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Collaborator {
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'viewer' | 'commenter' | 'editor' | 'admin';
  addedBy: string;
  addedAt: Date;
  expiresAt?: Date;
  teamId?: string;
}

interface AccessLog {
  action: 'granted' | 'revoked' | 'modified';
  timestamp: Date;
  performedBy: string;
  details: string;
}

interface Team {
  id: string;
  name: string;
  members: string[];
}

interface DocumentCollaboratorsManagerProps {
  documentId: string;
  currentUserRole: Collaborator['role'];
  onClose: () => void;
}

export function DocumentCollaboratorsManager({
  documentId,
  currentUserRole,
  onClose,
}: DocumentCollaboratorsManagerProps) {
  const { data: session } = useSession();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<Collaborator['role']>('viewer');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showAccessLogs, setShowAccessLogs] = useState(false);

  // Fetch collaborators and teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch collaborators
        const collabResponse = await fetch(`/api/documents/${documentId}/collaborators`, {
          credentials: 'include'
        });
        if (!collabResponse.ok) throw new Error('Failed to fetch collaborators');
        const collabData = await collabResponse.json();
        setCollaborators(collabData);

        // Fetch teams
        const teamsResponse = await fetch('/api/teams', {
          credentials: 'include'
        });
        if (!teamsResponse.ok) throw new Error('Failed to fetch teams');
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);

        // Fetch access logs
        const logsResponse = await fetch(`/api/documents/${documentId}/access-logs`, {
          credentials: 'include'
        });
        if (!logsResponse.ok) throw new Error('Failed to fetch access logs');
        const logsData = await logsResponse.json();
        setAccessLogs(logsData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [documentId]);

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail || !session?.user) return;

    try {
      const response = await fetch(`/api/documents/${documentId}/collaborators`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newCollaboratorEmail,
          role: newCollaboratorRole,
          expiresAt: expirationDate ? new Date(expirationDate).toISOString() : undefined,
          teamId: selectedTeam || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add collaborator');

      const newCollaborator = await response.json();
      setCollaborators(prev => [...prev, newCollaborator]);
      setNewCollaboratorEmail('');
      setExpirationDate('');
      setSelectedTeam('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collaborator');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Collaborator['role']) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/collaborators/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      setCollaborators(prev =>
        prev.map(collab =>
          collab.userId === userId ? { ...collab, role: newRole } : collab
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/collaborators/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to remove collaborator');

      setCollaborators(prev => prev.filter(collab => collab.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
    }
  };

  const canManageCollaborators = currentUserRole === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Access
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
              {error}
            </div>
          )}

          {/* Add new collaborator form */}
          {canManageCollaborators && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Add Collaborator
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={newCollaboratorRole}
                      onChange={(e) => setNewCollaboratorRole(e.target.value as Collaborator['role'])}
                      className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expires
                    </label>
                    <input
                      type="datetime-local"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>
                {teams.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team (Optional)
                    </label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">No team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleAddCollaborator}
                  disabled={!newCollaboratorEmail}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Collaborator
                </button>
              </div>
            </div>
          )}

          {/* Collaborators list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Collaborators ({collaborators.length})
              </h3>
              <button
                onClick={() => setShowAccessLogs(!showAccessLogs)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {showAccessLogs ? 'Hide Access Logs' : 'Show Access Logs'}
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {collaborator.username[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {collaborator.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {collaborator.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {canManageCollaborators && collaborator.userId !== session?.user?.id && (
                        <>
                          <select
                            value={collaborator.role}
                            onChange={(e) =>
                              handleUpdateRole(
                                collaborator.userId,
                                e.target.value as Collaborator['role']
                              )
                            }
                            className="px-2 py-1 border rounded dark:border-gray-600 dark:bg-gray-800"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="commenter">Commenter</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveCollaborator(collaborator.userId)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Access Logs */}
          {showAccessLogs && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Access Logs
              </h3>
              <div className="space-y-2">
                {accessLogs.map((log, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 py-2 border-b dark:border-gray-700"
                  >
                    <span className="font-medium">{log.action}</span> by{' '}
                    <span className="font-medium">{log.performedBy}</span> -{' '}
                    {new Date(log.timestamp).toLocaleString()}
                    <div className="text-xs mt-1">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 