"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

// Form ID dùng làm fallback nếu cần
export const DASHBOARD_FORM_ID = "incident-form-dashboard";

export type FormSubmitAction = "save" | "approve";
export type SubmitHandler = (actionType?: FormSubmitAction) => void | Promise<void>;

interface EditModeContextType {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  disableEditButton: boolean;
  setDisableEditButton: (v: boolean) => void;
  disableApproveButton: boolean;
  setDisableApproveButton: (v: boolean) => void;
  registerSubmitHandler: (handler: SubmitHandler | null) => void;
  triggerSubmit: (actionType?: FormSubmitAction) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  setIsEditing: () => {},
  disableEditButton: false,
  setDisableEditButton: () => {},
  disableApproveButton: false,
  setDisableApproveButton: () => {},
  registerSubmitHandler: () => {},
  triggerSubmit: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [disableEditButton, setDisableEditButton] = useState(false);
  const [disableApproveButton, setDisableApproveButton] = useState(false);
  const submitHandlerRef = useRef<SubmitHandler | null>(null);

  const registerSubmitHandler = useCallback((handler: SubmitHandler | null) => {
    submitHandlerRef.current = handler;
  }, []);

  const triggerSubmit = useCallback((actionType?: FormSubmitAction) => {
    if (submitHandlerRef.current) {
      submitHandlerRef.current(actionType);
    } else {
      // Fallback cho DOM requestSubmit nếu chưa register handler
      const form = document.getElementById(
        DASHBOARD_FORM_ID,
      ) as HTMLFormElement | null;
      if (form) {
        if (actionType === "approve") {
          const submitter = document.createElement("button");
          submitter.name = "action_type";
          submitter.value = "approve";
          submitter.type = "submit";
          submitter.style.display = "none";
          form.appendChild(submitter);
          submitter.click();
          form.removeChild(submitter);
        } else {
          form.requestSubmit();
        }
      }
    }
  }, []);

  return (
    <EditModeContext.Provider
      value={{
        isEditing,
        setIsEditing,
        disableEditButton,
        setDisableEditButton,
        disableApproveButton,
        setDisableApproveButton,
        registerSubmitHandler,
        triggerSubmit,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
