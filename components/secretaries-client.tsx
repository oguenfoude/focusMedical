"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteDialog } from "@/components/delete-dialog";
import { saveSecretary, deleteSecretary } from "@/lib/actions/secretaries";
import { toast } from "sonner";

type Secretary = {
  id: string;
  fullName: string;
  phone: string | null;
  createdAt: Date;
};

export default function SecretariesClient({ initialSecretaries, dict }: { initialSecretaries: Secretary[]; dict: import("@/lib/i18n/types").Dictionary }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSec, setEditingSec] = useState<Secretary | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [state, formAction, isPending] = useActionState(saveSecretary, { error: "" });

  useEffect(() => {
    if ("success" in state && state.success) {
      const wasEditing = !!editingSec;
      /* eslint-disable react-hooks/set-state-in-effect -- intentional form auto-close */
      setIsOpen(false);
      setEditingSec(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      router.refresh();
      toast.success(wasEditing ? dict.secretaries.toast.updated : dict.secretaries.toast.created);
    } else if ("error" in state && state.error) {
      toast.error(state.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteSecretary(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
      toast.success(dict.secretaries.toast.deleted);
    }
    setDeleteId(null);
  };

  const filtered = initialSecretaries.filter((sec) =>
    sec.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={dict.secretaries.placeholders.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingSec(null);
        }}>
          <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 shadow-md" />}>
            <Plus className="me-2 h-4 w-4" /> {dict.secretaries.add}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSec ? dict.secretaries.edit : dict.secretaries.create}</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4 pt-4">
              {editingSec && <input type="hidden" name="id" value={editingSec.id} />}
              <div className="space-y-2">
                <Label htmlFor="fullName">{dict.secretaries.fields.fullName}</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={editingSec?.fullName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{dict.secretaries.fields.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={editingSec ? dict.secretaries.placeholders.emailUpdate : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{dict.secretaries.fields.phone}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingSec?.phone ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{dict.secretaries.fields.password}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editingSec}
                  placeholder={editingSec ? dict.secretaries.placeholders.keepCurrent : dict.common.minLength}
                  minLength={6}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  {dict.common.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? dict.common.saving : dict.common.save}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-start text-sm font-medium text-muted-foreground">
              <th className="px-6 py-4">{dict.secretaries.table.name}</th>
              <th className="px-6 py-4">{dict.secretaries.table.email}</th>
              <th className="px-6 py-4">{dict.secretaries.table.phone}</th>
              <th className="px-6 py-4">{dict.secretaries.table.addedOn}</th>
              <th className="px-6 py-4 text-end">{dict.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  {dict.secretaries.emptyState}
                </td>
              </tr>
            ) : (
              filtered.map((sec) => (
                <tr key={sec.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {sec.fullName}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    —
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {sec.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(sec.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSec(sec);
                          setIsOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(sec.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={dict.secretaries.deleteTitle}
        description={dict.secretaries.deleteConfirm}
        dict={dict}
      />
    </div>
  );
}
