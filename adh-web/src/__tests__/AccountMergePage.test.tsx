// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    mergeHistories: [] as Array<{
      id: number;
      sourceAccount: string;
      targetAccount: string;
      mergeDate: Date;
      operator: string;
      status: string;
    }>,
    sourceAccount: null as {
      accountNumber: string;
      balance: number;
      status: string;
      createdDate: Date;
      chronoHisto?: string;
      logCodeExists?: boolean;
      filiationGarantie?: boolean;
      repriseConfirmee?: boolean;
      compteRemplace?: boolean;
      statusBK?: number;
      repriseAuto?: boolean;
      sansInterface?: boolean;
    } | null,
    targetAccount: null as {
      accountNumber: string;
      balance: number;
      status: string;
      createdDate: Date;
      chronoHisto?: string;
      logCodeExists?: boolean;
      filiationGarantie?: boolean;
      repriseConfirmee?: boolean;
      compteRemplace?: boolean;
      statusBK?: number;
      repriseAuto?: boolean;
      sansInterface?: boolean;
    } | null,
    validationState: null as {
      isClosureInProgress: boolean;
      networkStatus: string;
      validationStatus: string;
      vg78Flag?: boolean;
    } | null,
    isLoading: false,
    error: null as string | null,
    mergeProgress: 0,
    currentStep: "idle",
    currentTask: 0,
    validateMergeConditions: vi.fn(),
    executeMerge: vi.fn(),
    createMergeHistory: vi.fn(),
    rollbackMerge: vi.fn(),
    printMergeTicket: vi.fn(),
    reset: vi.fn(),
    checkBusinessRules: vi.fn(),
    validateNetworkStatus: vi.fn(),
    validateClosureBlocking: vi.fn(),
    evaluateBusinessRule005: vi.fn(() => true),
    evaluateBusinessRule006: vi.fn(() => true),
    evaluateBusinessRule007: vi.fn(() => 'PASSED'),
    evaluateBusinessRule008: vi.fn(() => true),
    evaluateBusinessRule009: vi.fn(() => true),
    evaluateBusinessRule010: vi.fn(() => true),
    evaluateBusinessRule011: vi.fn(() => true),
    evaluateBusinessRule012: vi.fn(() => true),
    evaluateBusinessRule013: vi.fn(() => true),
    validateAllBusinessRules: vi.fn(),
    setState: vi.fn()
  };
  return {
    mockStore: store,
    mockSetState: vi.fn()
  };
});

vi.mock("@/stores/accountMergeStore", () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState };
  mockHook.setState = mockSetState;
  return { useAccountMergeStore: mockHook };
});

vi.mock("@/components/layout", () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>{children}</div>
  )
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: string;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
  Input: ({ value, onChange, disabled, placeholder, id }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
  }) => (
    <input
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
    />
  ),
  Dialog: ({ open, onOpenChange, children }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    open ? <div data-testid="dialog" onClick={() => onOpenChange(false)}>{children}</div> : null
  )
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: (string | undefined | null | false)[]) => args.filter(Boolean).join(" ")
}));

import { AccountMergePage } from "@/pages/AccountMergePage";

describe("AccountMergePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.mergeHistories = [];
    mockStore.sourceAccount = null;
    mockStore.targetAccount = null;
    mockStore.validationState = null;
    mockStore.isLoading = false;
    mockStore.error = null;
    mockStore.mergeProgress = 0;
    mockStore.currentStep = "idle";
    mockStore.currentTask = 0;
  });

  it("renders without crashing", () => {
    render(<AccountMergePage />);
    expect(screen.getByText("Account Merge")).toBeInTheDocument();
    expect(screen.getByText("Merge source account into target account (192 task workflow)")).toBeInTheDocument();
  });

  it("displays account selection form initially", () => {
    render(<AccountMergePage />);
    expect(screen.getByLabelText("Source Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Target Account")).toBeInTheDocument();
    expect(screen.getByText("Validate Accounts")).toBeInTheDocument();
  });

  it("handles source account input change", () => {
    render(<AccountMergePage />);
    const input = screen.getByLabelText("Source Account") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ACC001" } });
    expect(input.value).toBe("ACC001");
  });

  it("handles target account input change", () => {
    render(<AccountMergePage />);
    const input = screen.getByLabelText("Target Account") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ACC002" } });
    expect(input.value).toBe("ACC002");
  });

  it("disables validate button when inputs are empty", () => {
    render(<AccountMergePage />);
    const validateButton = screen.getByText("Validate Accounts");
    expect(validateButton).toBeDisabled();
  });

  it("enables validate button when both inputs have values", () => {
    render(<AccountMergePage />);
    const sourceInput = screen.getByLabelText("Source Account");
    const targetInput = screen.getByLabelText("Target Account");
    const validateButton = screen.getByText("Validate Accounts");

    fireEvent.change(sourceInput, { target: { value: "ACC001" } });
    fireEvent.change(targetInput, { target: { value: "ACC002" } });

    expect(validateButton).not.toBeDisabled();
  });

  it("validates accounts on button click", async () => {
    mockStore.validateMergeConditions.mockResolvedValue(undefined);
    mockStore.validateNetworkStatus.mockResolvedValue(undefined);
    mockStore.validateClosureBlocking.mockResolvedValue(undefined);
    
    render(<AccountMergePage />);
    
    const sourceInput = screen.getByLabelText("Source Account");
    const targetInput = screen.getByLabelText("Target Account");
    const validateButton = screen.getByText("Validate Accounts");
    
    fireEvent.change(sourceInput, { target: { value: "ACC001" } });
    fireEvent.change(targetInput, { target: { value: "ACC002" } });
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(mockStore.validateMergeConditions).toHaveBeenCalledWith("ACC001", "ACC002");
    });
  });

  it("displays loading state during validation", () => {
    mockStore.isLoading = true;
    
    render(<AccountMergePage />);
    
    const validateButton = screen.getByText("Validating...");
    expect(validateButton).toBeDisabled();
  });

  it("displays validation status after validation", () => {
    mockStore.currentStep = "validated";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000.50,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000.75,
      status: "active",
      createdDate: new Date()
    };
    mockStore.validationState = {
      isClosureInProgress: false,
      networkStatus: "A",
      validationStatus: "PASSED"
    };
    
    render(<AccountMergePage />);
    
    expect(screen.getByText("Validation Status")).toBeInTheDocument();
    expect(screen.getByText(/ACC001 - Balance: \$1000.50/)).toBeInTheDocument();
    expect(screen.getByText(/ACC002 - Balance: \$2000.75/)).toBeInTheDocument();
    expect(screen.getByText(/Closure Status: Not In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/Network Status: A/)).toBeInTheDocument();
    expect(screen.getByText(/Validation Status: PASSED/)).toBeInTheDocument();
  });

  it("displays closure in progress status", () => {
    mockStore.currentStep = "validated";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.validationState = {
      isClosureInProgress: true,
      networkStatus: "R",
      validationStatus: "FAILED"
    };
    
    render(<AccountMergePage />);
    
    expect(screen.getByText(/Closure Status: In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/Network Status: R/)).toBeInTheDocument();
    expect(screen.getByText(/Validation Status: FAILED/)).toBeInTheDocument();
  });

  it("displays merge execution section after validation", () => {
    mockStore.currentStep = "validated";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    expect(screen.getByText("Merge Execution")).toBeInTheDocument();
    expect(screen.getByText("Execute Merge")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("executes merge on button click", async () => {
    mockStore.currentStep = "validated";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date(),
      chronoHisto: "A",
      logCodeExists: false,
      filiationGarantie: true,
      repriseConfirmee: true,
      compteRemplace: false,
      statusBK: 6,
      repriseAuto: false,
      sansInterface: false
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date(),
      chronoHisto: "B",
      logCodeExists: false,
      filiationGarantie: false,
      repriseConfirmee: false,
      compteRemplace: false,
      statusBK: 1,
      repriseAuto: true,
      sansInterface: false
    };
    mockStore.validationState = {
      isClosureInProgress: false,
      networkStatus: "A",
      validationStatus: "PASSED",
      vg78Flag: false
    };
    mockStore.executeMerge.mockResolvedValue(undefined);
    
    render(<AccountMergePage />);
    
    const executeButton = screen.getByText("Execute Merge");
    fireEvent.click(executeButton);
    
    await waitFor(() => {
      expect(mockStore.executeMerge).toHaveBeenCalledWith("ACC001", "ACC002");
    });
  });

  it("displays merge progress during execution", () => {
    mockStore.currentStep = "transferring";
    mockStore.mergeProgress = 50;
    mockStore.currentTask = 96;
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("96 / 192")).toBeInTheDocument();
    expect(screen.getByText(/Current Step: transferring/)).toBeInTheDocument();
    expect(screen.getByText("Executing...")).toBeInTheDocument();
  });

  it("disables execute button during merge", () => {
    mockStore.currentStep = "transferring";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    const executeButton = screen.getByText("Executing...");
    expect(executeButton).toBeDisabled();
  });

  it("disables cancel button during merge", () => {
    mockStore.currentStep = "updating";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("displays completion message when merge is completed", () => {
    mockStore.currentStep = "completed";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.mergeHistories = [
      {
        id: 1,
        sourceAccount: "ACC001",
        targetAccount: "ACC002",
        mergeDate: new Date(),
        operator: "OP001",
        status: "completed"
      }
    ];
    
    render(<AccountMergePage />);
    
    expect(screen.getByText("Merge Completed")).toBeInTheDocument();
    expect(screen.getByText("Merge completed successfully!")).toBeInTheDocument();
    expect(screen.getByText(/Account ACC001 has been merged into ACC002/)).toBeInTheDocument();
    expect(screen.getByText("Print Ticket")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("handles print ticket button click", async () => {
    mockStore.currentStep = "completed";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.mergeHistories = [
      {
        id: 1,
        sourceAccount: "ACC001",
        targetAccount: "ACC002",
        mergeDate: new Date(),
        operator: "OP001",
        status: "completed"
      }
    ];
    mockStore.printMergeTicket.mockResolvedValue(undefined);
    
    render(<AccountMergePage />);
    
    const printButton = screen.getByText("Print Ticket");
    fireEvent.click(printButton);
    
    await waitFor(() => {
      expect(mockStore.printMergeTicket).toHaveBeenCalledWith(1);
    });
  });

  it("handles close button click and resets state", () => {
    mockStore.currentStep = "completed";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    
    expect(mockStore.reset).toHaveBeenCalled();
  });

  it("handles cancel button click and resets state", () => {
    mockStore.currentStep = "validated";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    
    render(<AccountMergePage />);
    
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    
    expect(mockStore.reset).toHaveBeenCalled();
  });

  it("displays error state", () => {
    mockStore.error = "Validation failed: accounts cannot be merged";
    
    render(<AccountMergePage />);
    
    expect(screen.getByText("Validation failed: accounts cannot be merged")).toBeInTheDocument();
  });

  it("calls reset on unmount", () => {
    const { unmount } = render(<AccountMergePage />);
    
    unmount();
    
    expect(mockStore.reset).toHaveBeenCalled();
  });

  it("does not call validateMergeConditions when inputs are empty", () => {
    render(<AccountMergePage />);
    
    const validateButton = screen.getByText("Validate Accounts");
    fireEvent.click(validateButton);
    
    expect(mockStore.validateMergeConditions).not.toHaveBeenCalled();
  });

  it("does not call executeMerge when accounts are not set", () => {
    mockStore.currentStep = "validated";
    
    render(<AccountMergePage />);
    
    const executeButton = screen.getByText("Execute Merge");
    fireEvent.click(executeButton);
    
    expect(mockStore.executeMerge).not.toHaveBeenCalled();
  });

  it("does not call printMergeTicket when merge histories are empty", () => {
    mockStore.currentStep = "completed";
    mockStore.sourceAccount = {
      accountNumber: "ACC001",
      balance: 1000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.targetAccount = {
      accountNumber: "ACC002",
      balance: 2000,
      status: "active",
      createdDate: new Date()
    };
    mockStore.mergeHistories = [];
    
    render(<AccountMergePage />);
    
    const printButton = screen.getByText("Print Ticket");
    fireEvent.click(printButton);
    
    expect(mockStore.printMergeTicket).not.toHaveBeenCalled();
  });
});