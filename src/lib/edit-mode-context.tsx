"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Form ID dùng để trigger submit từ StatusBar
export const DASHBOARD_FORM_ID = "incident-form-dashboard";

interface EditModeContextType {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  disableEditButton: boolean;
  setDisableEditButton: (v: boolean) => void;
  disableApproveButton: boolean;
  setDisableApproveButton: (v: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  setIsEditing: () => {},
  disableEditButton: false,
  setDisableEditButton: () => {},
  disableApproveButton: false,
  setDisableApproveButton: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [disableEditButton, setDisableEditButton] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(false);

  return (
    <EditModeContext.Provider
      value={{
        isEditing,
        setIsEditing,
        disableEditButton,
        setDisableEditButton,
        disableApproveButton,
        setDisableApproveButton,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
