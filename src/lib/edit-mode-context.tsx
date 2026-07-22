"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Form ID dùng để trigger submit từ StatusBar
export const DASHBOARD_FORM_ID = "incident-form-dashboard";

interface EditModeContextType {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  setIsEditing: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
