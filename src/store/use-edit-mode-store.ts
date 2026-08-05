"use client";

import { create } from "zustand";

export type FormSubmitAction = "save" | "approve";
export type SubmitHandler = (
  actionType?: FormSubmitAction,
) => void | Promise<void>;

export interface EditModeState {
  isEditing: boolean;
  disableEditButton: boolean;
  disableApproveButton: boolean;
  daPhanTich: boolean;
  daDuyet: boolean;
  submitHandler: SubmitHandler | null;
  setIsEditing: (v: boolean) => void;
  setDisableEditButton: (v: boolean) => void;
  setDisableApproveButton: (v: boolean) => void;
  setIncidentStatus: (status: {
    daPhanTich: boolean;
    daDuyet: boolean;
  }) => void;
  registerSubmitHandler: (handler: SubmitHandler | null) => void;
  triggerSubmit: (actionType?: FormSubmitAction) => void;
  resetState: () => void;
}

export const useEditModeStore = create<EditModeState>((set, get) => ({
  isEditing: false,
  disableEditButton: false,
  disableApproveButton: false,
  daPhanTich: false,
  daDuyet: false,
  submitHandler: null,

  setIsEditing: (isEditing) => set({ isEditing }),
  setDisableEditButton: (disableEditButton) => set({ disableEditButton }),
  setDisableApproveButton: (disableApproveButton) =>
    set({ disableApproveButton }),
  setIncidentStatus: (status) =>
    set({ daPhanTich: status.daPhanTich, daDuyet: status.daDuyet }),

  registerSubmitHandler: (handler) => set({ submitHandler: handler }),

  resetState: () =>
    set({
      isEditing: false,
      disableEditButton: false,
      disableApproveButton: false,
      daPhanTich: false,
      daDuyet: false,
      submitHandler: null,
    }),

  triggerSubmit: (actionType) => {
    const handler = get().submitHandler;
    if (handler) {
      handler(actionType);
    }
  },
}));

/**
  Custom hook useEditMode() đóng vai trò bridge layer,
  giữ nguyên 100% interface cho các component hiện có (StatusBar, IncidentReportForm, IncidentAnalysisForm)
 */
export function useEditMode() {
  const isEditing = useEditModeStore((state) => state.isEditing);
  const setIsEditing = useEditModeStore((state) => state.setIsEditing);
  const disableEditButton = useEditModeStore(
    (state) => state.disableEditButton,
  );
  const setDisableEditButton = useEditModeStore(
    (state) => state.setDisableEditButton,
  );
  const disableApproveButton = useEditModeStore(
    (state) => state.disableApproveButton,
  );
  const setDisableApproveButton = useEditModeStore(
    (state) => state.setDisableApproveButton,
  );
  const daPhanTich = useEditModeStore((state) => state.daPhanTich);
  const daDuyet = useEditModeStore((state) => state.daDuyet);
  const setIncidentStatus = useEditModeStore(
    (state) => state.setIncidentStatus,
  );
  const registerSubmitHandler = useEditModeStore(
    (state) => state.registerSubmitHandler,
  );
  const triggerSubmit = useEditModeStore((state) => state.triggerSubmit);
  const resetState = useEditModeStore((state) => state.resetState);

  return {
    isEditing,
    setIsEditing,
    disableEditButton,
    setDisableEditButton,
    disableApproveButton,
    setDisableApproveButton,
    daPhanTich,
    daDuyet,
    setIncidentStatus,
    registerSubmitHandler,
    triggerSubmit,
    resetState,
  };
}
