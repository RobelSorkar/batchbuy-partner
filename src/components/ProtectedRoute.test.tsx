import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/hooks/useAuth");
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockFrom = vi.mocked(supabase.from);

/** Builds one chainable query-builder mock: awaiting it directly resolves
 * `allRolesResult`; calling `.maybeSingle()` resolves `singleResult` instead. */
function makeRoleQueryBuilder(singleResult: unknown, allRolesResult: unknown) {
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve({ data: singleResult }),
    then: (resolve: (v: { data: unknown }) => void) => resolve({ data: allRolesResult }),
  };
  return builder;
}

function renderProtectedRoute(requiredRole?: "admin" | "partner" | "warehouse") {
  return render(
    <MemoryRouter>
      <ProtectedRoute requiredRole={requiredRole}>
        <div>secret dashboard content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when no role is required and the user is signed in", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });

    renderProtectedRoute();

    expect(screen.getByText("secret dashboard content")).toBeInTheDocument();
  });

  it("redirects away from the protected content when there is no signed-in user", () => {
    mockUseAuth.mockReturnValue({ user: null, session: null, loading: false, signOut: vi.fn() });

    renderProtectedRoute("admin");

    expect(screen.queryByText("secret dashboard content")).not.toBeInTheDocument();
  });

  it("shows an email-verification prompt when the user has no roles at all", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    mockFrom.mockReturnValue(makeRoleQueryBuilder(null, []) as any);

    renderProtectedRoute("admin");

    await waitFor(() => expect(screen.getByText("Email Not Verified")).toBeInTheDocument());
    expect(screen.queryByText("secret dashboard content")).not.toBeInTheDocument();
  });

  it("denies access when the user has other roles but not the one required", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    // The specific-role check finds nothing, but the user does have roles (e.g. "partner").
    mockFrom.mockReturnValue(makeRoleQueryBuilder(null, [{ role: "partner" }]) as any);

    renderProtectedRoute("admin");

    await waitFor(() => expect(screen.getByText("Access Denied")).toBeInTheDocument());
    expect(screen.queryByText("secret dashboard content")).not.toBeInTheDocument();
  });

  it("renders the protected children once the user is confirmed to have the required role", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" } as any,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    mockFrom.mockReturnValue(makeRoleQueryBuilder({ role: "admin" }, [{ role: "admin" }]) as any);

    renderProtectedRoute("admin");

    await waitFor(() => expect(screen.getByText("secret dashboard content")).toBeInTheDocument());
  });
});
