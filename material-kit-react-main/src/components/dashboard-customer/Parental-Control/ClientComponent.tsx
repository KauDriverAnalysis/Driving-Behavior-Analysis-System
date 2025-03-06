'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Phone, Shield, AlertTriangle, Check } from 'lucide-react';

// Mock data for visualizations
const drivingHistoryData = [
  { date: 'Mon', speed: 65, hardBrakes: 2, suddenAccelerations: 1, score: 87 },
  { date: 'Tue', speed: 58, hardBrakes: 1, suddenAccelerations: 0, score: 92 },
  { date: 'Wed', speed: 72, hardBrakes: 3, suddenAccelerations: 2, score: 78 },
  { date: 'Thu', speed: 63, hardBrakes: 0, suddenAccelerations: 1, score: 89 },
  { date: 'Fri', speed: 67, hardBrakes: 2, suddenAccelerations: 2, score: 82 },
  { date: 'Sat', speed: 61, hardBrakes: 1, suddenAccelerations: 0, score: 90 },
  { date: 'Sun', speed: 70, hardBrakes: 4, suddenAccelerations: 3, score: 75 },
];

const recentAlerts = [
  { id: 1, type: 'Speeding', message: 'Exceeded speed limit by 15mph on Main Street', time: '2 hours ago', severity: 'high' },
  { id: 2, type: 'Hard Brake', message: 'Sudden braking detected on Highway 101', time: '5 hours ago', severity: 'medium' },
  { id: 3, type: 'Late Night', message: 'Driving detected after curfew at 11:30 PM', time: 'Yesterday', severity: 'medium' },
  { id: 4, type: 'Geofence', message: 'Vehicle left designated safe area', time: 'Yesterday', severity: 'low' },
];

const ParentalControlDashboard = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Mom', phone: '(555) 123-4567' },
    { id: 2, name: 'Dad', phone: '(555) 987-6543' }
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add emergency contact
  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setEmergencyContacts([
        ...emergencyContacts,
        { id: emergencyContacts.length + 1, ...newContact }
      ]);
      setNewContact({ name: '', phone: '' });
      showNotification('Emergency contact added successfully');
    } else {
      showNotification('Please fill in all fields', 'error');
    }
  };

  // Remove emergency contact
  const handleRemoveContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    showNotification('Emergency contact removed');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Parental Control Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-blue-50 rounded-full text-blue-600">
            <Bell size={20} />
          </button>
          <div className="bg-blue-600 text-white p-1 px-3 rounded-full text-sm font-medium">
            Active
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.type === 'error' ? 
            <AlertTriangle size={18} className="mr-2" /> : 
            <Check size={18} className="mr-2" />
          }
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`py-2 px-4 font-medium ${activeTab === 'contacts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Emergency Contacts
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`py-2 px-4 font-medium ${activeTab === 'alerts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Alerts
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-500 font-medium">Safety Score</h3>
                <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                  <Shield size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold mt-2">82/100</p>
              <p className="text-sm text-gray-500 mt-1">↓ 4% from last week</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-500 font-medium">Top Speed</h3>
                <div className="p-2 bg-red-50 rounded-full text-red-600">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold mt-2">72 mph</p>
              <p className="text-sm text-gray-500 mt-1">Highway 101 on Wednesday</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-500 font-medium">Recent Alerts</h3>
                <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                  <Bell size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold mt-2">4</p>
              <p className="text-sm text-gray-500 mt-1">Past 48 hours</p>
            </div>
          </div>
          
          {/* Driving Score Chart */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Weekly Driving Score</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={drivingHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Driving Metrics */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Driving Metrics</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={drivingHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hardBrakes" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="suddenAccelerations" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Emergency Contacts</h2>
            <p className="text-gray-500 mb-4">These contacts will be notified in case of emergencies or severe driving alerts.</p>
            
            {/* Add New Contact Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Contact Name"
                className="p-2 border rounded"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="p-2 border rounded"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
              />
              <button 
                onClick={handleAddContact}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add Contact
              </button>
            </div>
            
            {/* Contacts List */}
            <div className="space-y-3">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-gray-500 text-sm">{contact.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg flex items-start ${
                    alert.severity === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                    alert.severity === 'medium' ? 'bg-amber-50 border-l-4 border-amber-500' :
                    'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <div className={`p-2 rounded-full mr-3 ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{alert.type} Alert</h3>
                      <span className="text-sm text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Alert Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Speeding Alerts</p>
                  <p className="text-gray-500 text-sm">Notify when speed exceeds limit by 10+ mph</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Hard Braking</p>
                  <p className="text-gray-500 text-sm">Notify on sudden deceleration events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Geofence Boundary</p>
                  <p className="text-gray-500 text-sm">Notify when vehicle leaves designated area</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Curfew Monitoring</p>
                  <p className="text-gray-500 text-sm">Notify of driving between 11PM and 5AM</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentalControlDashboard;