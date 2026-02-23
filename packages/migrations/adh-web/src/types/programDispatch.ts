export interface ProgramDispatchControl {
  controlId: string;
  targetProgram: string;
  programName: string;
}

export interface ProgramDispatchRoute {
  controlId: string;
  success: boolean;
  targetProgram?: string;
  error?: string;
}

export interface LastClickedResponse {
  controlId: string | null;
}

export interface ProgramDispatchState {
  lastClickedControl: string | null;
  isDispatching: boolean;
  error: string | null;
  dispatchToProgram: (controlId: string) => Promise<void>;
  getLastClickedControl: () => Promise<string | null>;
  clearDispatch: () => void;
}

export type ProgramDispatchAction =
  | { type: 'SET_LAST_CLICKED'; payload: string }
  | { type: 'SET_DISPATCHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_DISPATCH' };