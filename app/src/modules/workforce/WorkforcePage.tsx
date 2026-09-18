import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, Modal, Form, message, Typography, Alert, Tooltip, Badge, Row, Col, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { useStore } from '../../lib/store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function WorkforcePage() {
  const { employees, units, positions, contracts, credentials, eligibilityStates, addEmployee, deleteEmployee } = useStore();
  const [search, setSearch] = useState('');
  const [filterUnit, setFilterUnit] = useState<number | undefined>();
  const [filterPosition, setFilterPosition] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = employees.filter(e => {
    if ((e as any).deletedAt) return false;
    if (search && !(`${e.name} ${e.jobNumber} ${e.contactEmail}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterUnit && e.unitId !== filterUnit) return false;
    if (filterPosition && e.position !== filterPosition) return false;
    return true;
  });

  const handleOnboard = async () => {
    try {
      const values = await form.validateFields();
      const id = addEmployee({
        name: values.name,
        jobNumber: values.jobNumber,
        unitId: values.unitId,
        position: values.position,
        contactEmail: values.contactEmail,
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0],
        contractStart: values.contractStart.format('YYYY-MM-DD'),
        contractEnd: values.contractEnd.format('YYYY-MM-DD'),
      } as any);
      message.success(`Employee onboarded atomically with contract — ID ${id} (fn_onboard_employee_with_contract)`);
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Onboarding failed - transaction rolled back');
    }
  };

  const columns = [
    { title: 'Job Number', dataIndex: 'jobNumber', key: 'jobNumber', width: 130, sorter: (a: any, b: any) => a.jobNumber.localeCompare(b.jobNumber) },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => a.name.localeCompare(b.name) },
    {
      title: 'Unit', key: 'unit', render: (_: any, r: any) => {
        const unit = units.find(u => u.id === r.unitId);
        return unit ? <Tag>{unit.code}</Tag> : '-';
      }
    },
    {
      title: 'Position', dataIndex: 'position', key: 'position',
      render: (pos: string) => {
        const p = positions.find(pp => pp.code === pos);
        return <Tag color={p?.isSchedulable ? 'blue' : 'default'}>{pos} {p?.isSchedulable ? '' : '(Non-sched)'}</Tag>;
      }
    },
    {
      title: 'Contract', key: 'contract', render: (_: any, r: any) => {
        const c = contracts.find(cc => cc.employeeId === r.id && (cc.status === 'Active' || cc.status === 'Approved'));
        return c ? <Tag color="green">{c.status}: {c.startDate} → {c.endDate}</Tag> : <Tag color="red">No coverage</Tag>;
      }
    },
    {
      title: 'Eligibility', key: 'eligibility', render: (_: any, r: any) => {
        const e = eligibilityStates.find(es => es.employeeId === r.id);
        if (!e) return <Tag>Unknown</Tag>;
        const color = e.status === 'ELIGIBLE' ? 'green' : e.status === 'ELIGIBLE_WITH_GRACE' ? 'orange' : 'red';
        return (
          <Tooltip title={e.reasons.join(', ') || 'Eligible'}>
            <Tag color={color}>{e.status}</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Creds', key: 'creds', render: (_: any, r: any) => {
        const creds = credentials.filter(c => c.employeeId === r.id);
        return <Badge count={creds.length} showZero color={creds.some(c => c.validityStatus === 'Expired') ? 'red' : 'blue'} />;
      }
    },
    {
      title: 'Actions', key: 'actions', render: (_: any, r: any) => (
        <Space>
          <Button size="small" danger onClick={() => {
            Modal.confirm({
              title: 'Soft delete employee?',
              content: 'Employee will be marked deleted but remain in audit history.',
              onOk: () => { deleteEmployee(r.id); message.success('Employee soft-deleted'); }
            });
          }}>Delete</Button>
        </Space>
      )
    }
  ];

  const activePositions = positions.filter(p => p.isActive);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}><TeamOutlined /> Workforce — Contract-First Onboarding (Bulletproof V36)</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalOpen(true); }}>Onboard Employee</Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Bulletproof Onboarding (Section 3.1)"
        description="Direct INSERT into employees is revoked from nurseapp_runtime. All onboarding must go via fn_onboard_employee_with_contract (SECURITY DEFINER) which creates employee + approved contract + audit entry atomically. Duplicate job number or invalid position triggers full rollback with specific error code."
      />

      <Card>
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }} size="middle">
          <Input placeholder="Search name, job number, email" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select placeholder="Filter by unit" allowClear style={{ width: 200 }} value={filterUnit} onChange={setFilterUnit} options={units.filter(u => u.isActive).map(u => ({ label: `${u.code} - ${u.name}`, value: u.id }))} showSearch />
          <Select placeholder="Filter by position" allowClear style={{ width: 200 }} value={filterPosition} onChange={setFilterPosition} options={activePositions.map(p => ({ label: `${p.code} - ${p.fullTitle}`, value: p.code }))} showSearch />
          <Text type="secondary">{filtered.length} / {employees.filter(e => !(e as any).deletedAt).length} employees</Text>
        </Space>

        <Table rowKey="id" dataSource={filtered} columns={columns as any} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" scroll={{ x: 1000 }} />
      </Card>

      <Modal
        title="Onboard New Employee — Contract-First (V36)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOnboard}
        okText="Onboard Atomically"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="Database-Enforced Atomic Onboarding" description="This form calls fn_onboard_employee_with_contract. If contract creation fails, zero rows remain in employees." />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobNumber" label="Job Number (Unique)" rules={[{ required: true, pattern: /^AIGH-\d{4}$/, message: 'Format: AIGH-0001' }]}><Input placeholder="AIGH-0001" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unitId" label="Nursing Unit (FK → nursing_units)" rules={[{ required: true }]}><Select showSearch options={units.filter(u => u.isActive).map(u => ({ label: `${u.code} - ${u.name} (${u.bedCount} beds)`, value: u.id }))} /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Position (FK → position_directory, active only)" rules={[{ required: true }]}><Select showSearch options={activePositions.map(p => ({ label: `${p.code} - ${p.fullTitle} [${p.tier}] ${p.isSchedulable ? '' : '(Non-sched)'}`, value: p.code }))} /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="contactEmail" label="Contact Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contractStart" label="Contract Start Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contractEnd" label="Contract End Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
