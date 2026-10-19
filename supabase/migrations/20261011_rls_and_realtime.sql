-- SMS — Supabase Row Level Security (RLS) & Realtime Publication Migration
-- Enables table RLS, defines role-based access for Departments/Students/AuditLogs,
-- installs an immutable append-only trigger for AuditLogs, and registers Students in realtime CDC.

-- 1. Enable Row Level Security (RLS) across all core entities
ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;

-- 2. Department Security Policies
-- Anyone (anon and authenticated) can inspect active departments for filtering
DROP POLICY IF EXISTS "allow_read_departments" ON public."Department";
CREATE POLICY "allow_read_departments"
ON public."Department"
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated administrative staff can manage departments
DROP POLICY IF EXISTS "allow_staff_manage_departments" ON public."Department";
CREATE POLICY "allow_staff_manage_departments"
ON public."Department"
FOR ALL
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));

-- 3. Student Security Policies
-- Public anonymous read access is permitted strictly for non-archived active students
DROP POLICY IF EXISTS "allow_anon_read_active_students" ON public."Student";
CREATE POLICY "allow_anon_read_active_students"
ON public."Student"
FOR SELECT
TO anon
USING ("isArchived" = false);

-- Authenticated staff can read all records (including archived history)
DROP POLICY IF EXISTS "allow_staff_read_students" ON public."Student";
CREATE POLICY "allow_staff_read_students"
ON public."Student"
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated staff with REGISTRAR or ADMIN roles can mutate student records
DROP POLICY IF EXISTS "allow_staff_insert_students" ON public."Student";
CREATE POLICY "allow_staff_insert_students"
ON public."Student"
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));

DROP POLICY IF EXISTS "allow_staff_update_students" ON public."Student";
CREATE POLICY "allow_staff_update_students"
ON public."Student"
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'))
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));

DROP POLICY IF EXISTS "allow_staff_delete_students" ON public."Student";
CREATE POLICY "allow_staff_delete_students"
ON public."Student"
FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));

-- 4. AuditLog Security Policies & Compliance Immutability Trigger
-- Authenticated staff can read audit histories
DROP POLICY IF EXISTS "allow_staff_read_audit_logs" ON public."AuditLog";
CREATE POLICY "allow_staff_read_audit_logs"
ON public."AuditLog"
FOR SELECT
TO authenticated
USING (true);

-- Authenticated staff and system processes can append audit logs
DROP POLICY IF EXISTS "allow_insert_audit_logs" ON public."AuditLog";
CREATE POLICY "allow_insert_audit_logs"
ON public."AuditLog"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Immutable Append-Only Ledger Trigger
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'FERPA / Compliance Error: AuditLog entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public."AuditLog";
CREATE TRIGGER trg_prevent_audit_log_modification
BEFORE UPDATE OR DELETE ON public."AuditLog"
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_log_modification();

-- 5. Realtime CDC Publication
-- Adds Student table to the supabase_realtime publication for live WebSocket streaming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'Student'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public."Student";
  END IF;
END $$;
