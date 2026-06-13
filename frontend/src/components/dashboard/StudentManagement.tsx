import { useEffect, useState } from "react";
import { UserPlus, Trash2, Loader2, AlertCircle, Users } from "lucide-react";
import { Panel } from "./Panel";
import { Button } from "@/components/ui/button";
import { api, type Student } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const DEPARTMENTS = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Information Technology",
  "Biotechnology",
  "Chemical Engineering",
  "Physics",
  "Mathematics",
  "Management",
  "Law",
  "Architecture",
];

const YEARS = [1, 2, 3, 4, 5];

const EMPTY_FORM = {
  name: "",
  email: "",
  studentId: "",
  department: "",
  year: 1,
  phone: "",
};

export function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setStudents(await api.getStudents());
    } catch {
      setError("Could not load students — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.email.trim() || !form.studentId.trim() || !form.department) {
      setFormError("Name, email, student ID and department are required.");
      return;
    }
    if (!form.email.endsWith("@muj.manipal.edu")) {
      setFormError("Email must be a @muj.manipal.edu address.");
      return;
    }

    setAdding(true);
    try {
      const created = await api.addStudent({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        studentId: form.studentId.trim().toUpperCase(),
        department: form.department,
        year: Number(form.year),
        phone: form.phone.trim() || undefined,
        addedBy: user?.email ?? "admin",
      });
      setStudents((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add student.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silently ignore — the row stays
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Panel
      title="Student Management"
      subtitle={`${students.length} registered student${students.length !== 1 ? "s" : ""}`}
      action={
        <Button
          size="sm"
          variant={showForm ? "secondary" : "default"}
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
        >
          <UserPlus className="size-4" />
          {showForm ? "Cancel" : "Add Student"}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* add form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-border bg-muted/40 p-4 space-y-3"
          >
            <p className="text-[13px] font-medium text-foreground">New Student</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input
                  className="input-base"
                  placeholder="e.g. Arjun Sharma"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>

              <Field label="Institute Email" required>
                <input
                  className="input-base"
                  type="email"
                  placeholder="student@muj.manipal.edu"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>

              <Field label="Student ID" required>
                <input
                  className="input-base"
                  placeholder="e.g. 219301234"
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                />
              </Field>

              <Field label="Phone (optional)">
                <input
                  className="input-base"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Field>

              <Field label="Department" required>
                <select
                  className="input-base"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Year">
                <select
                  className="input-base"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </Field>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-status-occupied/10 px-3 py-2 text-[13px] text-status-occupied">
                <AlertCircle className="size-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={adding}>
                {adding && <Loader2 className="size-4 animate-spin" />}
                {adding ? "Saving…" : "Save Student"}
              </Button>
            </div>
          </form>
        )}

        {/* student list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading students…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-status-occupied/20 bg-status-occupied/5 px-4 py-3 text-[13px] text-status-occupied">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Users className="size-8 opacity-40" />
            <p className="text-[13px]">No students added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <Th>Name</Th>
                  <Th>Student ID</Th>
                  <Th>Email</Th>
                  <Th>Dept / Year</Th>
                  <Th>Added by</Th>
                  <Th>Added on</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium">{s.name}</td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{s.studentId}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {s.department} · Y{s.year}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {s.addedBy.split("@")[0]}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-status-occupied/10 hover:text-status-occupied disabled:opacity-40"
                        aria-label={`Remove ${s.name}`}
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-status-occupied">*</span>}
      </span>
      {children}
    </label>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
      {children}
    </th>
  );
}
