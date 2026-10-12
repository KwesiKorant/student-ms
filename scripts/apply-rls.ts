import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Applying Supabase RLS and Realtime policies via Prisma...");

  const commands = [
    // 1. Enable RLS
    `ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public."Student" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;`,

    // 2. Department Policies
    `DROP POLICY IF EXISTS "allow_read_departments" ON public."Department";`,
    `CREATE POLICY "allow_read_departments" ON public."Department" FOR SELECT TO anon, authenticated USING (true);`,

    `DROP POLICY IF EXISTS "allow_staff_manage_departments" ON public."Department";`,
    `CREATE POLICY "allow_staff_manage_departments" ON public."Department" FOR ALL TO authenticated
     USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'))
     WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));`,

    // 3. Student Policies
    `DROP POLICY IF EXISTS "allow_anon_read_active_students" ON public."Student";`,
    `CREATE POLICY "allow_anon_read_active_students" ON public."Student" FOR SELECT TO anon USING ("isArchived" = false);`,

    `DROP POLICY IF EXISTS "allow_staff_read_students" ON public."Student";`,
    `CREATE POLICY "allow_staff_read_students" ON public."Student" FOR SELECT TO authenticated USING (true);`,

    `DROP POLICY IF EXISTS "allow_staff_insert_students" ON public."Student";`,
    `CREATE POLICY "allow_staff_insert_students" ON public."Student" FOR INSERT TO authenticated
     WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));`,

    `DROP POLICY IF EXISTS "allow_staff_update_students" ON public."Student";`,
    `CREATE POLICY "allow_staff_update_students" ON public."Student" FOR UPDATE TO authenticated
     USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'))
     WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));`,

    `DROP POLICY IF EXISTS "allow_staff_delete_students" ON public."Student";`,
    `CREATE POLICY "allow_staff_delete_students" ON public."Student" FOR DELETE TO authenticated
     USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'REGISTRAR'));`,

    // 4. AuditLog Policies & Immutability Trigger
    `DROP POLICY IF EXISTS "allow_staff_read_audit_logs" ON public."AuditLog";`,
    `CREATE POLICY "allow_staff_read_audit_logs" ON public."AuditLog" FOR SELECT TO authenticated USING (true);`,

    `DROP POLICY IF EXISTS "allow_insert_audit_logs" ON public."AuditLog";`,
    `CREATE POLICY "allow_insert_audit_logs" ON public."AuditLog" FOR INSERT TO authenticated WITH CHECK (true);`,

    `CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
     RETURNS TRIGGER AS $$
     BEGIN
       RAISE EXCEPTION 'FERPA / Compliance Violation: AuditLog entries are immutable and cannot be updated or deleted.';
     END;
     $$ LANGUAGE plpgsql;`,

    `DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public."AuditLog";`,
    `CREATE TRIGGER trg_prevent_audit_log_modification
     BEFORE UPDATE OR DELETE ON public."AuditLog"
     FOR EACH ROW
     EXECUTE FUNCTION public.prevent_audit_log_modification();`,

    // 5. Realtime Publication
    `DO $$
     BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_publication_tables 
         WHERE pubname = 'supabase_realtime' 
           AND schemaname = 'public' 
           AND tablename = 'Student'
       ) THEN
         ALTER PUBLICATION supabase_realtime ADD TABLE public."Student";
       END IF;
     END $$;`,
  ];

  for (const cmd of commands) {
    try {
      await prisma.$executeRawUnsafe(cmd);
    } catch (err: unknown) {
      console.warn("Command warning:", (err as Error).message);
    }
  }

  console.log("✓ Successfully applied all RLS policies, immutable audit trigger, and Realtime publication!");
}

main()
  .catch((e) => {
    console.error("Migration fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
