import React, { useState } from 'react';
import { 
  BarChart2, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Download, 
  Clock, 
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Settings,
  Loader2,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import './Reports.css';

// Mock Data
const powerData = [
  { name: 'Mon', consumption: 4000, savings: 2400 },
  { name: 'Tue', consumption: 3000, savings: 1398 },
  { name: 'Wed', consumption: 2000, savings: 9800 },
  { name: 'Thu', consumption: 2780, savings: 3908 },
  { name: 'Fri', consumption: 1890, savings: 4800 },
  { name: 'Sat', consumption: 2390, savings: 3800 },
  { name: 'Sun', consumption: 3490, savings: 4300 },
];

const alarmsData = [
  { name: 'High Temp', count: 45 },
  { name: 'Comm Loss', count: 32 },
  { name: 'Power Fail', count: 18 },
  { name: 'Lamp Fail', count: 85 },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('power');
  const [entityLevel, setEntityLevel] = useState('project');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateRange, setDateRange] = useState('last7days');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const handleAutomateSchedule = () => {
    setIsScheduleOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleEmail) return alert('Please enter an email address');
    setIsScheduleOpen(false);
    setTimeout(() => alert('Schedule saved successfully!'), 100);
  };

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const content = "Report Type, Date Range, Status\nMock Data, Last 7 Days, Generated Successfully";
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="reports-container">
      {/* Header Section */}
      <header className="reports-header glass-panel">
        <div className="header-content">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart2 className="text-secondary" />
              Intelligence Reports
            </h1>
            <p className="text-gray-400 mt-1">Configure, extract, and automate advanced analytics</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn-glass flex items-center gap-2"
              onClick={handleAutomateSchedule}
            >
              <Clock size={16} />
              Automate Schedule
            </button>
            <button 
              className="btn-primary flex items-center gap-2"
              onClick={handleExportReport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>
      </header>

      <div className="reports-layout">
        {/* Configuration Sidebar */}
        <div className="reports-sidebar glass-panel">
          <div className="sidebar-section">
            <h3 className="section-title flex items-center gap-2">
              <Settings size={18} />
              Configuration
            </h3>
            
            <div className="form-group">
              <label>Report Type</label>
              <div className="type-selector">
                <button 
                  className={`type-btn ${reportType === 'power' ? 'active' : ''}`}
                  onClick={() => setReportType('power')}
                >
                  <Zap size={16} />
                  <span>Power Metrics</span>
                </button>
                <button 
                  className={`type-btn ${reportType === 'alarms' ? 'active' : ''}`}
                  onClick={() => setReportType('alarms')}
                >
                  <AlertTriangle size={16} />
                  <span>Alarms & Events</span>
                </button>
                <button 
                  className={`type-btn ${reportType === 'devices' ? 'active' : ''}`}
                  onClick={() => setReportType('devices')}
                >
                  <Activity size={16} />
                  <span>Device Status</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Entity Level</label>
              <select 
                className="glass-select"
                value={entityLevel}
                onChange={(e) => {
                  setEntityLevel(e.target.value);
                  setSelectedDevice(''); 
                }}
              >
                <option value="project">Entire Project</option>
                <option value="gateway">Per Gateway</option>
                <option value="lamp">Per Lamp</option>
              </select>
            </div>

            {(entityLevel === 'gateway' || entityLevel === 'lamp') && (
              <div className="form-group">
                <label>Select {entityLevel === 'gateway' ? 'Gateway' : 'Lamp'}</label>
                <select 
                  className="glass-select"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  <option value="" disabled>Select a {entityLevel}...</option>
                  {entityLevel === 'gateway' ? (
                    <>
                      <option value="gw-001">Gateway Alpha (North District)</option>
                      <option value="gw-002">Gateway Beta (South District)</option>
                      <option value="gw-003">Gateway Gamma (East District)</option>
                    </>
                  ) : (
                    <>
                      <option value="lamp-101">Lamp 101 (Main Street)</option>
                      <option value="lamp-102">Lamp 102 (Park Ave)</option>
                      <option value="lamp-103">Lamp 103 (5th Avenue)</option>
                      <option value="lamp-104">Lamp 104 (Broadway)</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Date Range</label>
              <select 
                className="glass-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="last24h">Last 24 Hours</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>
            
            <div className="mt-8 flex justify-center">
                <button 
                  className="btn-primary w-full flex justify-center items-center gap-2"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {isGenerating ? 'Analyzing Data...' : 'Generate Report'}
                </button>
            </div>
          </div>
        </div>

        {/* Report Content Area */}
        <div className="reports-content">
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card glass-panel flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Total Consumption</p>
                  <h3 className="text-2xl font-bold mt-1 text-primary">124.5 kWh</h3>
                </div>
                <div className="icon-wrapper bg-primary/20 text-primary">
                  <Zap size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-400">
                <Activity size={14} className="mr-1" />
                <span>-12% from last period</span>
              </div>
            </div>

            <div className="summary-card glass-panel flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Active Alarms</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-500">18</h3>
                </div>
                <div className="icon-wrapper bg-red-500/20 text-red-500">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-400">
                <Activity size={14} className="mr-1" />
                <span>+3 from last period</span>
              </div>
            </div>

            <div className="summary-card glass-panel flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Network Uptime</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-400">99.9%</h3>
                </div>
                <div className="icon-wrapper bg-green-500/20 text-green-500">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <Clock size={14} className="mr-1" />
                <span>Last 30 days</span>
              </div>
            </div>
          </div>

          {/* Main Charts Area */}
          <div className="charts-grid mt-6">
            <div className="chart-card glass-panel full-width">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Power Consumption Trend</h3>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#50E3C2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#50E3C2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                    <XAxis dataKey="name" stroke="#A0AEC0" tick={{fill: '#A0AEC0'}} />
                    <YAxis stroke="#A0AEC0" tick={{fill: '#A0AEC0'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                    <Area type="monotone" dataKey="consumption" stroke="#4A90E2" fillOpacity={1} fill="url(#colorConsumption)" />
                    <Area type="monotone" dataKey="savings" stroke="#50E3C2" fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card glass-panel">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Alarm Distribution</h3>
              </div>
              <div className="chart-container" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alarmsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {alarmsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="custom-legend mt-4">
                {alarmsData.map((entry, index) => (
                  <div key={entry.name} className="legend-item flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <div className="legend-color w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-300">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-white">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card glass-panel">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">Performance by Time</h3>
                </div>
                <div className="chart-container" style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={powerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                            <XAxis dataKey="name" stroke="#A0AEC0" tick={{fill: '#A0AEC0'}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px' }}
                                cursor={{fill: '#2D3748', opacity: 0.4}}
                            />
                            <Bar dataKey="consumption" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automate Schedule Modal */}
      {isScheduleOpen && (
        <div className="modal-overlay" onClick={() => setIsScheduleOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-primary" />
                Schedule Automation
              </h3>
              <button className="btn-icon" onClick={() => setIsScheduleOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="form-group">
              <label>Delivery Frequency</label>
              <select 
                className="glass-select"
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
              >
                <option value="daily">Daily Report Summary</option>
                <option value="weekly">Weekly Analysis Report</option>
                <option value="monthly">Monthly Executive Summary</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Recipient Email Addresses</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Ex: admin@saudisensors.com, it-team@saudisensors.com" 
                value={scheduleEmail}
                onChange={(e) => setScheduleEmail(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2">Separate multiple emails with commas</p>
            </div>
            
            <div className="modal-actions">
              <button className="btn-glass" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveSchedule}>
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
