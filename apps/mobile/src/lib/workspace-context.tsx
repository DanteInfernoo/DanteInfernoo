import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { listMemberships, type MembershipSummary } from "./queries";

interface WorkspaceContextValue {
  memberships: MembershipSummary[];
  workspace: MembershipSummary["workspace"] | null;
  loading: boolean;
  selectWorkspace: (workspaceId: string) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [memberships, setMemberships] = useState<MembershipSummary[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setMemberships([]);
      setWorkspaceId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rows = await listMemberships();
    setMemberships(rows);
    setWorkspaceId((current) => current ?? rows[0]?.workspace.id ?? null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const workspace = useMemo(
    () => memberships.find((m) => m.workspace.id === workspaceId)?.workspace ?? null,
    [memberships, workspaceId],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      memberships,
      workspace,
      loading,
      selectWorkspace: setWorkspaceId,
      refresh,
    }),
    [memberships, workspace, loading, refresh],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
