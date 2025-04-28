import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Card, Statistic, Space, Tag, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

// Use correct API endpoint format
const API_URL = 'https://hospitalbackend-eight.vercel.app/api/emergency'; // Adjust this to match your actual API endpoint

const EmergencyBed = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBed, setCurrentBed] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({ totalBeds: 0, availableBeds: 0 });

  const bedTypes = [
    'General ICU',
    'Cardiac ICU',
    'Pediatric ICU',
    'Ventilator',
    'General Ward'
  ];

  const departments = [
    'Emergency',
    'Cardiology',
    'Pediatrics',
    'ICU',
    'General Medicine'
  ];

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setBeds(response.data.data || []);
      calculateStats(response.data.data || []);
      message.success('Bed data loaded successfully');
    } catch (error) {
      console.error('Error fetching beds:', error);
      message.error('Failed to load bed data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bedData) => {
    const total = bedData.reduce((sum, bed) => sum + (bed.totalBeds || 0), 0);
    const available = bedData.reduce((sum, bed) => sum + (bed.availableBeds || 0), 0);
    setStats({ totalBeds: total, availableBeds: available });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (currentBed) {
        // Update existing bed
        const response = await axios.put(`${API_URL}/${currentBed._id}`, {
          ...values,
          lastUpdated: new Date().toISOString()
        });
        setBeds(beds.map(bed => bed._id === currentBed._id ? response.data.data : bed));
        message.success('Bed updated successfully');
      } else {
        // Create new bed
        const response = await axios.post(API_URL, {
          ...values,
          lastUpdated: new Date().toISOString()
        });
        setBeds([response.data.data, ...beds]);
        message.success('Bed created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchBeds(); // Refresh data
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      message.success('Bed deleted successfully');
      fetchBeds();
    } catch (error) {
      console.error('Error deleting bed:', error);
      message.error('Failed to delete bed');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (bed = null) => {
    setCurrentBed(bed);
    form.resetFields();
    if (bed) {
      form.setFieldsValue({
        ...bed,
        // Ensure numbers are properly set
        totalBeds: bed.totalBeds,
        availableBeds: bed.availableBeds
      });
    }
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  const columns = [
    {
      title: 'Bed Type',
      dataIndex: 'bedType',
      key: 'bedType',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Total Beds',
      dataIndex: 'totalBeds',
      key: 'totalBeds',
    },
    {
      title: 'Available',
      dataIndex: 'availableBeds',
      key: 'availableBeds',
      render: (text) => (
        <span style={{ color: text > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <Card>
          <Statistic title="Total Beds" value={stats.totalBeds} />
        </Card>
        <Card>
          <Statistic
            title="Available Beds"
            value={stats.availableBeds}
            valueStyle={{ color: stats.availableBeds > 0 ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ marginRight: '10px' }}
        >
          Add New Bed
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchBeds}
        >
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={beds}
        rowKey="_id"
        loading={loading}
        bordered
        scroll={{ x: true }}
      />

      <Modal
        title={currentBed ? 'Edit Bed' : 'Add New Bed'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="bedType"
            label="Bed Type"
            rules={[{ required: true, message: 'Please select bed type' }]}
          >
            <Select placeholder="Select bed type">
              {bedTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              {departments.map(dept => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="totalBeds"
            label="Total Beds"
            rules={[
              { required: true, message: 'Please enter total beds' },
              { type: 'number', min: 1, message: 'Must be at least 1' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="availableBeds"
            label="Available Beds"
            rules={[
              { required: true, message: 'Please enter available beds' },
              { type: 'number', min: 0, message: 'Cannot be negative' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value <= getFieldValue('totalBeds')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Available beds cannot exceed total beds'));
                },
              }),
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmergencyBed;