import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Eye, Pencil, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ProjectRow } from "@/hooks/useProjects";

interface AdminProjectsTabProps {
  batches: ProjectRow[];
  onEditProject: (batch: ProjectRow) => void;
}

const projectStatusColors: Record<string, string> = {
  funding: "bg-accent text-accent-foreground",
  production: "bg-secondary text-secondary-foreground",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  shipping: "bg-accent text-accent-foreground",
};

const canAdvanceProject = (status: string) => ["funding", "production", "shipping"].includes(status);

const nextProjectStatus: Record<string, string> = {
  funding: "production",
  production: "shipping",
  shipping: "completed",
};

const nextProjectLabel: Record<string, string> = {
  funding: "→ Production",
  production: "→ Shipping",
  shipping: "→ Completed",
};

const AdminProjectsTab = ({ batches, onEditProject }: AdminProjectsTabProps) => {
  const [projectSearch, setProjectSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredProjects = batches.filter((b) =>
    projectSearch === "" || b.product_name?.toLowerCase().includes(projectSearch.toLowerCase()) || b.batch_name?.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const advanceStatus = async (b: ProjectRow) => {
    const next = nextProjectStatus[b.status];
    try {
      const { error } = await supabase.from("batches").update({ status: next }).eq("id", b.id);
      if (error) throw error;
      toast({ title: `${b.batch_name} → ${next}` });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    } catch (e) {
      toast({ title: "Error", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  const cancelProject = async (b: ProjectRow) => {
    try {
      const { error } = await supabase.from("batches").update({ status: "cancelled" }).eq("id", b.id);
      if (error) throw error;
      toast({ title: `${b.batch_name} cancelled`, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    } catch (e) {
      toast({ title: "Error", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">Production Projects</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-8 h-8 text-xs w-48" value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} />
          </div>
          <Link to="/create-batch"><Button size="sm">+ New Project</Button></Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["Product", "Project", "Status", "Qty", "Funded", "Progress", "Partners", "Deadline", ""].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((b) => {
              const progress = b.total_quantity > 0 ? Math.round((b.funded_units / b.total_quantity) * 100) : 0;
              return (
                <tr key={b.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {b.image && b.image.startsWith("http") ? (
                        <img src={b.image} alt={b.product_name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <span className="text-xl">{b.image || "📦"}</span>
                      )}
                      <span className="text-sm font-medium">{b.product_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{b.batch_name}</td>
                  <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${projectStatusColors[b.status] || ""}`}>{b.status}</span></td>
                  <td className="px-5 py-4 text-sm">{b.total_quantity}</td>
                  <td className="px-5 py-4 text-sm">{b.funded_units}/{b.total_quantity}</td>
                  <td className="px-5 py-4">
                    <div className="w-20">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">{b.partners_joined}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{b.deadline ? new Date(b.deadline).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <Link to={`/batch/${b.id}`}><Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => onEditProject(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                      {canAdvanceProject(b.status) && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => advanceStatus(b)}>
                          {nextProjectLabel[b.status]}
                        </Button>
                      )}
                      {b.status === "funding" && (
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-destructive" onClick={() => cancelProject(b)}>
                          <Ban className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredProjects.length === 0 && <div className="p-8 text-center text-muted-foreground">No projects found.</div>}
    </div>
  );
};

export default AdminProjectsTab;
