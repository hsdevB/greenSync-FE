// src/Components/Sidebar.jsx
import { User, BarChart3, Settings, Bell, Users } from "lucide-react";
import './Sidebar.css';

const Sidebar = ({ selected }) => (
  <aside className="sidebar">
    {/* 프로필 */}
    <div className="sidebar-profile">
      <div className="sidebar-avatar">
        <User className="sidebar-avatar-icon" />
      </div>
      <div className="sidebar-username">○○○님</div>
    </div>
    {/* 메뉴 */}
    <nav className="sidebar-nav">
      <ul>
        <li>
          <button
            className={`sidebar-menu-btn${selected === 'dashboard' ? ' selected' : ''}`}
          >
            <BarChart3 className="sidebar-menu-icon" /> 대시보드
          </button>
        </li>
        <li>
          <button
            className={`sidebar-menu-btn${selected === 'remote' ? ' selected' : ''}`}
          >
            <Settings className="sidebar-menu-icon" /> 원격제어
          </button>
        </li>
        <li>
          <button
            className={`sidebar-menu-btn${selected === 'alarm' ? ' selected' : ''}`}
          >
            <Bell className="sidebar-menu-icon" /> 알림
          </button>
        </li>
      </ul>
    </nav>
    <div className="sidebar-divider"></div>
    {/* 로그아웃 */}
    <div className="sidebar-logout">
      <button className="sidebar-logout-btn">
        <Users className="sidebar-menu-icon" /> 로그아웃
      </button>
    </div>
  </aside>
);

export default Sidebar;