import React, { createContext, useContext, useState } from 'react';
import { LawyerPermissions, DEFAULT_ASSOCIATE_PERMISSIONS } from '../types';
import { users as initialUsers } from '../data/mockData';

interface PermissionsContextData {
  getPermissions: (userId: string) => LawyerPermissions | null;
  updatePermissions: (userId: string, permissions: LawyerPermissions) => void;
  associates: typeof initialUsers;
}

const PermissionsContext = createContext<PermissionsContextData>({} as PermissionsContextData);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissionsMap, setPermissionsMap] = useState<Record<string, LawyerPermissions>>(() => {
    const map: Record<string, LawyerPermissions> = {};
    initialUsers.forEach((u) => {
      if (u.role === 'associate' && u.permissions) {
        map[u.id] = u.permissions;
      }
    });
    return map;
  });

  const associates = initialUsers.filter((u) => u.role === 'associate');

  function getPermissions(userId: string): LawyerPermissions | null {
    return permissionsMap[userId] ?? DEFAULT_ASSOCIATE_PERMISSIONS;
  }

  function updatePermissions(userId: string, permissions: LawyerPermissions) {
    setPermissionsMap((prev) => ({ ...prev, [userId]: permissions }));
  }

  return (
    <PermissionsContext.Provider value={{ getPermissions, updatePermissions, associates }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
