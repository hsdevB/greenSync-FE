// src/Components/Sidebar.jsx
import { User, BarChart3, Settings, Bell, Users } from "lucide-react";

const Sidebar = ({ selected }) => (
  <div className="w-64 bg-gray-100 border-r border-blue-200 flex flex-col min-h-screen" style={{ background: '#f3f4f6' }}>
    <div className="flex flex-col items-start py-8 px-6">
      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
        <User className="w-8 h-8 text-gray-500" />
      </div>
      <div className="font-semibold text-gray-700 mb-8">○○○님</div>
    </div>
    <nav className="flex-1">
      <ul>
        <li className={`flex items-center px-6 py-3 cursor-pointer ${selected === 'dashboard' ? 'bg-blue-50 border-l-4 border-blue-500 font-bold' : 'hover:bg-gray-100'}`}>
          <BarChart3 className="mr-3" /> 대시보드
        </li>
        <li className={`flex items-center px-6 py-3 cursor-pointer ${selected === 'remote' ? 'bg-blue-50 border-l-4 border-blue-500 font-bold' : 'hover:bg-gray-100'}`}>
          <Settings className="mr-3" /> 원격제어
        </li>
        <li className={`flex items-center px-6 py-3 cursor-pointer ${selected === 'alarm' ? 'bg-blue-50 border-l-4 border-blue-500 font-bold' : 'hover:bg-gray-100'}`}>
          <Bell className="mr-3" /> 알림
        </li>
      </ul>
    </nav>
    <div className="mb-8 px-6">
      <div className="flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
        <Users className="mr-3" /> 로그아웃
      </div>
    </div>
  </div>
);

export default Sidebar;