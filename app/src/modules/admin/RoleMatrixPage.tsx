import React from 'react';
import { Card, Table, Tag, Typography, Alert, Descriptions, Divider, Row, Col } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function RoleMatrixPage() {
  const appRoles = [
    { role: 'SYSTEM_ADMIN', color: 'red', scope: 'System-wide', desc: 'Full system administration, user provisioning, security config, PAM, break-glass root. Dormant by default, JIT elevation 2h with reason, auto-revoked.', defaultFor: 'Explicit assignment only — DON/DEPUTY_DON/ADMIN never auto-confer' },
    { role: 'HR_ADMIN', color: 'blue', scope: 'Scoped (unit/dept or system-wide)', desc: 'Employee onboarding (contract-first V36), departments/units/bed capacity CRUD, position directory CRUD, credential catalog CRUD, contract lifecycle (create/approve/renew/terminate), credential review.', defaultFor: 'Explicit assignment — HR staff, DON may receive system-wide scope' },
    { role: 'SUPERVISOR / SCHEDULER', color: 'green', scope: 'Scoped (assigned units)', desc: 'Scoped baseline/compliance view, no evidence downloads, scoped draft and publish roster, coverage monitoring, emergency waivers (72h max), attendance gap alerts.', defaultFor: 'Explicit assignment — NS, ACTING_HEAD, HN may receive multi-unit or unit-scoped supervisor' },
    { role: 'EMPLOYEE (Staff Self-Service)', color: 'default', scope: 'Personal data scope', desc: 'Claim invited account, own password, own profile phone update, own credential submission/evidence/alerts, published personal/home-unit view, own notifications.', defaultFor: 'Default at registration — all positions receive this, does NOT grant supervisor authority' },
  ];

  const accessMatrix = [
    { area: 'Accounts', hrAdmin: 'Provision and administer within assigned scope', supervisor: 'No account admin by default', employee: 'Claim invited account; own password' },
    { area: 'Employee Master', hrAdmin: 'Maintain source fields within scope', supervisor: 'Assigned-unit baseline/compliance view; private fields suppressed', employee: 'Own profile; phone update' },
    { area: 'Contracts', hrAdmin: 'Scoped create, approval, renewal, termination; full history + attachments', supervisor: 'Scoped reduced read: identifiers, employee/position, unit, status, dates', employee: 'Own reduced read view' },
    { area: 'Credentials', hrAdmin: 'Scoped upload, review, validity decisions', supervisor: 'Scoped compliance view; no evidence downloads', employee: 'Own submission, evidence, alerts' },
    { area: 'Scheduling', hrAdmin: 'Coverage/read view by default', supervisor: 'Scoped draft and publish', employee: 'Published personal/home-unit view' },
    { area: 'Notifications', hrAdmin: 'Own recipient rows', supervisor: 'Own recipient rows', employee: 'Own recipient rows' },
    { area: 'Departments / Units / Beds', hrAdmin: 'Full CRUD + bulk API + CSV import + history logs', supervisor: 'Read + bed-history (SUPERVISOR allowed)', employee: 'No access' },
    { area: 'Positions Directory', hrAdmin: 'Full CRUD (POST/PUT/DELETE) + audit trail + revalidation on schedulability toggle', supervisor: 'List and read only', employee: 'List and read only' },
    { area: 'Credential Catalog', hrAdmin: 'Full CRUD categories/templates/requirements + bulk set', supervisor: 'Read only', employee: 'Read only' },
    { area: 'Eligibility', hrAdmin: 'View all + refresh + grace management', supervisor: 'View scoped + waivers 72h', employee: 'Own eligibility view' },
    { area: 'Audit and Compliance', hrAdmin: 'Read scoped audit + export', supervisor: 'No audit by default', employee: 'Own history only' },
    { area: 'Backup and PITR', hrAdmin: 'No backup by default (operations owner)', supervisor: 'No backup', employee: 'No backup' },
    { area: 'PAM / Four-Eyes / Break-Glass', hrAdmin: 'Request elevation + initiate approvals', supervisor: 'Request elevation (if supervisor elevated)', employee: 'No admin' },
    { area: 'FHIR / Portability', hrAdmin: 'FHIR export + exit package', supervisor: 'FHIR read scoped', employee: 'Own FHIR resource' },
  ];

  const positionMapping = [
    { position: 'DON', code: 'Director of Nursing', tier: 'Executive', sched: 'No', defaultAuth: 'Staff self-service', elevated: 'HR Admin (system-wide)', notes: 'Requires explicit HR assignment — title never auto-confers admin' },
    { position: 'DEPUTY_DON', code: 'Deputy Director of Nursing', tier: 'Executive', sched: 'No', defaultAuth: 'Staff self-service', elevated: 'HR Admin (scoped)', notes: 'Requires explicit HR assignment' },
    { position: 'ADMIN', code: 'Administrator', tier: 'Administrative', sched: 'No', defaultAuth: 'Staff self-service', elevated: 'HR Admin or Scheduler', notes: 'Non-clinical; scope per hospital policy' },
    { position: 'NS', code: 'Nursing Supervisor', tier: 'Management', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'Supervisor (multi-unit)', notes: 'NS = Nursing Supervisor, not Nurse Specialist (SCFHS classification) - F-26' },
    { position: 'ACTING_HEAD', code: 'Acting Head Nurse', tier: 'Management', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'Supervisor (unit-scoped, temporary)', notes: 'Review grant on assignment end' },
    { position: 'NURSE_EDUCATOR', code: 'Clinical Nurse Educator', tier: 'Specialist', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'Read-only credential view (scoped)', notes: 'May need cross-unit read for training — explicit scope, not position code' },
    { position: 'PRACTITIONER', code: 'Nurse Practitioner', tier: 'Advanced Practice', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None additional', notes: 'Advanced clinical, not administrative' },
    { position: 'HN', code: 'Head Nurse', tier: 'Management', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'Supervisor (unit-scoped)', notes: 'Unit-specific management' },
    { position: 'CN', code: 'Charge Nurse', tier: 'Clinical Lead', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None / Supervisor if assigned', notes: 'Shift-lead' },
    { position: 'SN', code: 'Staff Nurse', tier: 'Clinical', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None', notes: 'Frontline registered nurse' },
    { position: 'PCT', code: 'Patient Care Technician', tier: 'Support', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None', notes: 'Support staff' },
    { position: 'TEC', code: 'Technician', tier: 'Support', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None', notes: 'Legacy retained' },
    { position: 'HCA', code: 'Healthcare Assistant', tier: 'Support', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None', notes: 'Legacy retained' },
    { position: 'MW', code: 'Midwife', tier: 'Clinical Specialist', sched: 'Yes', defaultAuth: 'Staff self-service', elevated: 'None', notes: 'Legacy retained' },
  ];

  const dbRoles = [
    { role: 'nurseapp_owner', purpose: 'Database owner, initial provisioning', grants: 'All privileges on database and schemas', denied: 'Never used at runtime or by application code', env: 'Manual provisioning', color: 'red' },
    { role: 'nurseapp_migration', purpose: 'Schema changes via Prisma Migrate', grants: 'CREATE/ALTER/DROP tables/indexes/sequences/types, SELECT/INSERT/UPDATE/DELETE _prisma_migrations, USAGE schemas, ALTER DEFAULT PRIVILEGES', denied: 'No runtime data beyond migration journal — control is credential custody + pipeline scope, not SQL-level read isolation (DDL implies read)', env: 'MIGRATION_DATABASE_URL — CI/CD pipeline only', color: 'orange' },
    { role: 'nurseapp_runtime', purpose: 'NestJS API + Worker', grants: 'SELECT/INSERT/UPDATE/DELETE business tables, USAGE/SELECT sequences, EXECUTE functions, fn_onboard_employee_with_contract', denied: 'No CREATE/ALTER/DROP/TRUNCATE, no DELETE/UPDATE audit_entries (append-only), no direct INSERT employees (REVOKE INSERT — must use fn), contracts writable under trg_contract_status_guard', env: 'DATABASE_URL — app runtime only', color: 'blue' },
    { role: 'nurseapp_backup', purpose: 'pg_basebackup + WAL archiving', grants: 'pg_read_all_data (PG14+ built-in) + REPLICATION attribute, SELECT all tables, stream WAL', denied: 'No INSERT/UPDATE/DELETE, no schema modification', env: 'DB_BACKUP_USER — backup scripts only', color: 'green' },
    { role: 'nurseapp_audit_reader', purpose: 'Compliance and audit export', grants: 'SELECT audit_entries, audit_batches, audit_snapshots, scfhs_verification_log, grace_period_log, push_delivery_log, idempotency_keys', denied: 'No access to business tables (employees, contracts, credentials), no write', env: 'AUDIT_DATABASE_URL — audit tooling only', color: 'purple' },
    { role: 'nurseapp_migration_admin (temporary)', purpose: 'Legacy migration bridge cutover', grants: 'Bypasses REVOKE INSERT on employees/contracts for cutover window', denied: 'Deleted immediately after commitValidatedData()', env: 'Created 48h before go-live, deleted after commit, every action logged in migration_audit_log', color: 'volcano' },
  ];

  return (
    <div>
      <Title level={3}><SafetyCertificateOutlined /> User Role Matrix — Application + Position + Database + Guardrails</Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Role and Data-Scope Policy (Section 8) — Default Deny, Explicit Assignment, Position Never Auto-Confors Admin"
        description="Every operation evaluates role permission, record scope, permitted response fields. Default access denied. Employee title never automatically confers administrative role — HR must explicitly assign elevated roles and scopes. Executive DON/DEPUTY_DON and ADMIN do not automatically confer system privileges — staff self-service at registration, requires explicit HR assignment. NS and ACTING_HEAD do not automatically grant Supervisor — explicit assignment with unit scope. NURSE_EDUCATOR may need cross-unit read for training — explicit scope config, not position code. Same permission checks apply to exports, document versions, reports, background actions. Legacy clinical-only scopes narrowed to personal access, removes default supervisor contract writes and account-admin rights."
      />

      <Card title={<span><KeyOutlined /> Application Authorization Roles (4 Roles) — Section 8.1</span>} style={{ marginBottom: 16 }}>
        <Table
          dataSource={appRoles}
          rowKey="role"
          pagination={false}
          size="small"
          columns={[
            { title: 'Role', dataIndex: 'role', key: 'role', width: 220, render: (r: string, row: any) => <Tag color={row.color}>{r}</Tag> },
            { title: 'Scope', dataIndex: 'scope', key: 'scope', width: 200 },
            { title: 'Description', dataIndex: 'desc', key: 'desc' },
            { title: 'Default For', dataIndex: 'defaultFor', key: 'defaultFor', width: 300, render: (t: string) => <Text style={{ fontSize: 12 }}>{t}</Text> },
          ] as any}
        />
      </Card>

      <Card title={<span><TeamOutlined /> Full Access Matrix — Area x Role (Section 8.1)</span>} style={{ marginBottom: 16 }}>
        <Table
          dataSource={accessMatrix}
          rowKey="area"
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          columns={[
            { title: 'Area', dataIndex: 'area', key: 'area', width: 220, fixed: 'left' as any, render: (a: string) => <Text strong>{a}</Text> },
            { title: 'HR Admin / System Admin', dataIndex: 'hrAdmin', key: 'hrAdmin', width: 380, render: (t: string) => <Text style={{ fontSize: 12 }}>{t}</Text> },
            { title: 'Supervisor / Scheduler', dataIndex: 'supervisor', key: 'supervisor', width: 380, render: (t: string) => <Text style={{ fontSize: 12 }}>{t}</Text> },
            { title: 'Employee (Self-Service)', dataIndex: 'employee', key: 'employee', width: 300, render: (t: string) => <Text style={{ fontSize: 12 }}>{t}</Text> },
          ] as any}
        />
        <Alert type="warning" showIcon style={{ marginTop: 12 }} message="Access Rules" description="Apply same permission checks to exports, document versions, reports, background actions. Server-evaluated scope — passing nurse ID from browser does NOT establish access. Database errors deny access. Authorization decisions, full-access matrices, accessible menus read current PostgreSQL state so stale cache cannot preserve revoked access. Redis non-authoritative — sensitive ops always verify against PostgreSQL regardless of circuit state, Redis only accelerates read-heavy (menu rendering, roster view). Cache invalidation events (role changes, scope changes, revocation) write PostgreSQL first, Redis invalidation best-effort — next cache population after recovery fetches fresh data. Permission revocation invalidates cache immediately next request uses fresh DB permissions." />
      </Card>

      <Card title={<span><TeamOutlined /> Position to Auth Role Recommended Mapping (Section 8.2)</span>} style={{ marginBottom: 16 }}>
        <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Naming Caution" description="In position directory NS = Nursing Supervisor (Section 3.1.1). Nurse Specialist is an SCFHS professional classification, not a position code. Workshop row explicitly Nursing Supervisor with caution about SCFHS Nurse Specialist classification (F-26)." />
        <Table
          dataSource={positionMapping}
          rowKey="position"
          pagination={false}
          size="small"
          scroll={{ x: 1400 }}
          columns={[
            { title: 'Code', dataIndex: 'position', key: 'position', width: 120, fixed: 'left' as any, render: (c: string) => <Tag>{c}</Tag> },
            { title: 'Full Title', dataIndex: 'code', key: 'code', width: 200 },
            { title: 'Tier', dataIndex: 'tier', key: 'tier', width: 130, render: (t: string) => <Tag color={t === 'Executive' ? 'red' : t === 'Management' ? 'blue' : t === 'Clinical' ? 'green' : 'default'}>{t}</Tag> },
            { title: 'Schedulable', dataIndex: 'sched', key: 'sched', width: 100, render: (v: string) => <Tag color={v === 'Yes' ? 'green' : 'red'}>{v}</Tag> },
            { title: 'Default Auth Role', dataIndex: 'defaultAuth', key: 'defaultAuth', width: 160 },
            { title: 'Typical Elevated Role', dataIndex: 'elevated', key: 'elevated', width: 220, render: (t: string) => <Tag color={t.includes('HR Admin') ? 'blue' : t.includes('Supervisor') ? 'green' : 'default'}>{t}</Tag> },
            { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (t: string) => <Text style={{ fontSize: 11 }}>{t}</Text> },
          ] as any}
        />
      </Card>

      <Card title={<span><LockOutlined /> Database Privilege Separation — Least Privilege (Section 10.7) — 5 Roles + 1 Temporary</span>} style={{ marginBottom: 16 }}>
        <Table
          dataSource={dbRoles}
          rowKey="role"
          pagination={false}
          size="small"
          columns={[
            { title: 'DB Role', dataIndex: 'role', key: 'role', width: 240, render: (r: string, row: any) => <Tag color={row.color}>{r}</Tag> },
            { title: 'Purpose', dataIndex: 'purpose', key: 'purpose', width: 220 },
            { title: 'Grants', dataIndex: 'grants', key: 'grants', render: (t: string) => <Text style={{ fontSize: 11 }}>{t}</Text> },
            { title: 'Explicitly Denied', dataIndex: 'denied', key: 'denied', render: (t: string) => <Text style={{ fontSize: 11 }} type="danger">{t}</Text> },
            { title: 'Connection String / Lifecycle', dataIndex: 'env', key: 'env', render: (t: string) => <Text code style={{ fontSize: 11 }}>{t}</Text> },
          ] as any}
        />
        <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
          <Descriptions.Item label="Post-Migration Hook">{'After each prisma migrate deploy, privilege grant script runs as nurseapp_owner to re-apply grants on new objects + verify runtime cannot ALTER/DROP tables and cannot DELETE audit entries — returns permission denied, else FAIL'}</Descriptions.Item>
          <Descriptions.Item label="Connection Strings">{'DATABASE_URL nurseapp_runtime app runtime only, MIGRATION_DATABASE_URL nurseapp_migration CI/CD only, DB_BACKUP_USER nurseapp_backup backup scripts only, AUDIT_DATABASE_URL nurseapp_audit_reader audit tooling only — app runtime env contains only runtime string, migration+owner credentials absent, password independence each role separate password separate secret rotating one does not affect others'}</Descriptions.Item>
          <Descriptions.Item label="Onboarding Lockdown V36">{'REVOKE INSERT employees only — employee creation must go via fn_onboard_employee_with_contract atomic employee+approved contract+audit. Contracts remain writable HR must create draft renew terminate — contract-first guarantee from employees restriction+FK+status trigger not banning contract inserts would break renewal. Guard every contract insert/update valid initial status sane dates via fn_contract_status_guard BEFORE INSERT/UPDATE trigger'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Administrative Guardrails — Four-Eyes and PAM (Sections 3.5, 8.1, V42)" size="small">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Four-Eyes Principle (Dual-Auth)">{'High-impact actions cannot be executed by single admin — promoting user to System Admin, modifying global eligibility rules, changing encryption keys. Workflow: Admin A initiates to PENDING state to Admin B different user reviews approves to system executes change. Table admin_approval_requests id initiator_id approver_id action_type payload JSONB status PENDING/APPROVED/REJECTED/EXECUTED, partial unique index uq_admin_request_pending ON initiator_id+action_type WHERE status=PENDING prevents duplicate pending, SELECT FOR UPDATE locks row so two approvers cannot both proceed, PENDING precondition blocks replay/re-approval, self-approval forbidden 403, executeAction(tx,...) same transaction client so failure rolls back both action+status change, terminal state EXECUTED recorded approver_id approved_at'}</Descriptions.Item>
              <Descriptions.Item label="Just-In-Time Elevation (PAM)">{'Privileged access not permanent — System Admin rights dormant by default, user must request elevation granted limited window e.g. 2h requires documented reason, expires_at reached session automatically revoked by PamExpiryWorker, table privileged_sessions user_id PK elevated_at expires_at reason authorized_by check_expiry expires_at greater than elevated_at, isElevated() checks expiry revokes if expired, requestElevation() upsert expires_at now+durationHrs*3600000 reason'}</Descriptions.Item>
              <Descriptions.Item label="Acceptance Criteria">{'Attempting to promote user to Admin without second signature returns PENDING_APPROVAL, attempting to approve own high-impact request returns 403 Forbidden, admin access revoked immediately upon privileged_sessions.expires_at, every elevation request+approval recorded in audit_entries initiator+approver IDs'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Break-Glass Root Account — Siren Protocol (Section 3.6, V44)" size="small">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Account">{'Single high-privilege account credentials split into 2 halves stored physically in separate hospital safes'}</Descriptions.Item>
              <Descriptions.Item label="Bypass">{'Bypasses PamService JIT elevation and AdminApprovalService Four-Eyes granting immediate root access — prevents system deadlock if PAM DB corrupted or only admin unavailable'}</Descriptions.Item>
              <Descriptions.Item label="Siren">{'Any login triggers irrevocable break_glass_events entry (actor_id, access_timestamp, reason, ip_address INET, event_type Siren_Activated, resolved_at non-deletable), emergency SMS/email alert to Hospital CEO + IT Director, session limited to 4h then forcibly revoked'}</Descriptions.Item>
              <Descriptions.Item label="Implementation">{'breakGlassEvents.create actor_id reason ip_address, notificationService.sendEmergencyAlert title SYSTEM BREAK-GLASS ACTIVATED message Root access granted to userId reason IP priority CRITICAL non-blocking broadcast'}</Descriptions.Item>
              <Descriptions.Item label="Acceptance Criteria">{'Root login triggers Siren alert creates non-deletable audit entry, break-glass session automatically revoked after 4h, /api/v1 remains functional after /api/v2 deployed'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Contract Lifecycle Roles (Section 4.1)" size="small" style={{ marginTop: 16 }}>
            <Table
              size="small"
              pagination={false}
              dataSource={[
                { role: 'HR / System Admin', access: 'Scoped create, approval, renewal, termination; full contract history and attachments' },
                { role: 'Supervisor', access: 'Scoped reduced read view: identifiers, employee/position, unit, status, dates' },
                { role: 'Employee', access: 'Own reduced read view' },
              ]}
              columns={[
                { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={r.includes('HR') ? 'blue' : r.includes('Supervisor') ? 'green' : 'default'}>{r}</Tag> },
                { title: 'Access Level', dataIndex: 'access', key: 'access' },
              ] as any}
            />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>{'All contract operations enforce server-evaluated scope for authenticated caller. Passing nurse ID from browser does NOT establish access. Draft and PendingApproval do NOT provide coverage. Approving contract covering today makes it Active immediately. Future-period Approved until start date approval does NOT supersede current. Approved+Active participate in exclusion constraint GiST daterange overlaps WHERE status IN Approved,Active — overlapping periods same employee rejected at DB level. Approved future can satisfy eligibility for shift within that future. Start/end inclusive next nonoverlapping renewal starts after previous end. Expired/Suspended/Terminated/Superseded do NOT provide coverage. No concurrent secondary contracts deliberate replacement requires explicit HR handling silent superseding removed.'}</Text>
          </Card>
        </Col>
      </Row>

      <Card title="Waiver Authority (Section 6.1.2, V48)" size="small" style={{ marginTop: 16 }}>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Authority">{'Only users with Supervisor or HR_Admin role can issue waiver — application-level check, other roles receive 403'}</Descriptions.Item>
          <Descriptions.Item label="Enforcement in DB">{'72h maximum and future-expiry enforced by chk_waiver_max_window and chk_waiver_future on credential_waivers V48 — API same checks so callers receive clear error before constraint fires, role authority remains application-level'}</Descriptions.Item>
          <Descriptions.Item label="Acceptance Criteria">{'Authority check verify only Supervisor and HR_Admin can issue waivers other roles 403, 72h+ waiver rejected at DB, expiry reverts eligibility, waiver audit entry raised high-priority'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider>Demo Accounts in This Web App</Divider>

      <Row gutter={[16, 16]}>
        <Col span={6}><Card size="small"><Tag color="red">SYSTEM_ADMIN</Tag><br /><Text code>admin@aigh.sa</Text><br /><Text style={{ fontSize: 11 }}>Full access, PAM, break-glass, FHIR, backup, privilege separation, PDPL, all CRUD</Text></Card></Col>
        <Col span={6}><Card size="small"><Tag color="blue">HR_ADMIN</Tag><br /><Text code>hr.admin@aigh.sa</Text><br /><Text style={{ fontSize: 11 }}>Onboarding V36, departments/units/beds CRUD + bulk + CSV import, positions CRUD, credential catalog CRUD, contracts lifecycle, eligibility view, audit scoped</Text></Card></Col>
        <Col span={6}><Card size="small"><Tag color="green">SUPERVISOR</Tag><br /><Text code>supervisor@aigh.sa</Text><br /><Text style={{ fontSize: 11 }}>Scoped compliance view no evidence downloads, draft and publish roster, coverage monitoring, waivers 72h, attendance gap alerts, bed-history read</Text></Card></Col>
        <Col span={6}><Card size="small"><Tag>EMPLOYEE</Tag><br /><Text code>employee@aigh.sa</Text><br /><Text style={{ fontSize: 11 }}>Own profile phone update, own credential submission evidence alerts, published personal/home-unit view, own notifications, own eligibility, own FHIR resource</Text></Card></Col>
      </Row>

      <Alert type="success" showIcon style={{ marginTop: 16 }} message="Position Never Auto-Confors Admin — Explicit Assignment Required" description="All 14 active positions receive staff self-service at registration. Executive DON/DEPUTY_DON non-schedulable and ADMIN non-schedulable do NOT automatically confer system privileges. NS and ACTING_HEAD do NOT automatically grant Supervisor. HR must explicitly assign elevated roles with appropriate unit scope. This is enforced in the web app — login role is determined by email pattern for demo, but in production HR Admin assigns roles via explicit API with audit trail." />
    </div>
  );
}
