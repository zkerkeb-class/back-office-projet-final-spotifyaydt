import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserShield, FaUsers, FaChartLine, FaMusic, FaSearch, FaInfoCircle, FaUserEdit, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../components/Layout/Layout';
import { mockUsers } from '../../mocks/auth';
import './RoleList.scss';
import { useAuditLog } from '../../contexts/AuditLogContext';

// Composant pour l'audit log
const AuditLog = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const { auditLogs } = useAuditLog();

  const filteredLogs = filter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.severity === filter);

  return (
    <div className="audit-log">
      <div className="audit-log__header">
        <h3>
          <FaHistory />
          {t('roles.auditLog.title')}
        </h3>
        <div className="audit-log__filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('roles.auditLog.filters.all')}</option>
            <option value="high">{t('roles.auditLog.filters.high')}</option>
            <option value="medium">{t('roles.auditLog.filters.medium')}</option>
            <option value="low">{t('roles.auditLog.filters.low')}</option>
          </select>
        </div>
      </div>

      <div className="audit-log__list">
        {filteredLogs.map(log => (
          <div key={log.id} className={`audit-log__item severity-${log.severity}`}>
            <div className="audit-log__item-header">
              <span className="timestamp">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <span className={`severity severity-${log.severity}`}>
                <FaExclamationTriangle />
                {t(`roles.auditLog.severity.${log.severity}`)}
              </span>
            </div>
            <div className="audit-log__item-content">
              <h4>{t(`roles.auditLog.actions.${log.action}`)}</h4>
              <p className="user">
                <strong>{t('roles.auditLog.by')}:</strong> {log.user}
              </p>
              <p className="target">
                <strong>{t('roles.auditLog.target')}:</strong> {log.target}
              </p>
              <p className="details">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function RoleList() {
  const { t, i18n } = useTranslation();
  const { canManage } = usePermissions();
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);

  const roles = [
    {
      id: 'ADMIN',
      name: t('roles.admin.name'),
      description: t('roles.admin.description'),
      userCount: 2,
      lastActivity: '2024-03-15',
      icon: <FaUserShield />,
      permissions: [
        t('roles.permissions.manageUsers'),
        t('roles.permissions.manageRoles'),
        t('roles.permissions.manageContent'),
        t('roles.permissions.viewStats')
      ],
      stats: {
        actionsPerDay: 45,
        lastActions: [
          { type: 'content_edit', date: '2024-03-15', target: 'Album: Back in Black' },
          { type: 'user_management', date: '2024-03-14', target: 'User: john.doe' },
          { type: 'role_update', date: '2024-03-13', target: 'Role: Editor' }
        ]
      }
    },
    {
      id: 'EDITOR',
      name: t('roles.editor.name'),
      description: t('roles.editor.description'),
      userCount: 5,
      lastActivity: '2024-03-14',
      icon: <FaMusic />,
      permissions: [
        t('roles.permissions.editContent'),
        t('roles.permissions.viewStats')
      ],
      stats: {
        actionsPerDay: 28,
        lastActions: [
          { type: 'content_edit', date: '2024-03-14', target: 'Artist: AC/DC' },
          { type: 'content_edit', date: '2024-03-13', target: 'Album: Highway to Hell' }
        ]
      }
    },
    {
      id: 'VIEWER',
      name: t('roles.viewer.name'),
      description: t('roles.viewer.description'),
      userCount: 12,
      lastActivity: '2024-03-15',
      icon: <FaUsers />,
      permissions: [
        t('roles.permissions.viewContent'),
        t('roles.permissions.viewStats')
      ],
      stats: {
        actionsPerDay: 15,
        lastActions: [
          { type: 'content_view', date: '2024-03-15', target: 'Dashboard' },
          { type: 'content_view', date: '2024-03-15', target: 'Artists List' }
        ]
      }
    }
  ];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const RoleStats = ({ stats }) => (
    <div className="role-stats">
      <h4>{t('roles.stats.title')}</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <FaChartLine />
          <span>{t('roles.stats.actionsPerDay')}</span>
          <strong>{stats.actionsPerDay}</strong>
        </div>
      </div>
      <div className="recent-activity">
        <h5>{t('roles.stats.recentActivity')}</h5>
        <ul>
          {stats.lastActions.map((action, index) => (
            <li key={index}>
              <span className="date">{new Date(action.date).toLocaleDateString()}</span>
              <span className="action">{action.target}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const UserModal = ({ user, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{t('roles.users.editRole')}</h3>
        <div className="user-edit-form">
          <p>{t('roles.users.email')}: {user.email}</p>
          <div className="form-group">
            <label>{t('roles.users.selectRole')}</label>
            <select 
              value={user.role}
              onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn--secondary" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!canManage()) {
    return (
      <div className="access-denied">
        <FaUserShield />
        <h2>{t('common.accessDenied')}</h2>
        <p>{t('common.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="role-list">
      <div className="role-list__header">
        <h2>{t('roles.title')}</h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder={t('roles.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn--secondary"
            onClick={() => setShowStats(!showStats)}
            title={t('roles.toggle.stats')}
          >
            <FaChartLine />{' '}
            <span>{t('roles.toggleStats')}</span>
          </button>
        </div>
      </div>

      <div className="role-list__grid">
        {filteredRoles.map(role => (
          <div
            key={role.id}
            className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleClick(role)}
          >
            <div className="role-card__header">
              <div className="role-icon">{role.icon}</div>
              <h3>{role.name}</h3>
              <span className="user-count">
                <FaUsers /> {role.userCount}
              </span>
            </div>
            <div className="role-card__content">
              <p className="role-description">{role.description}</p>
              <div className="permissions-list">
                <h4>{t('roles.permissions.title')}</h4>
                <ul>
                  {role.permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
              {showStats && <RoleStats stats={role.stats} />}
            </div>
            <div className="role-card__footer">
              <span className="last-activity">
                <FaInfoCircle />
                {t('roles.lastActivity')}: {new Date(role.lastActivity).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="users-section">
        <h3>
          <FaUsers />
          {t('roles.users.title')}
        </h3>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>{t('roles.users.email')}</th>
                <th>{t('roles.users.role')}</th>
                <th>{t('roles.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {roles.find(r => r.id === user.role)?.name}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn--icon"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <FaUserEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Ajouter l'audit log après la section des utilisateurs */}
      {canManage() && <AuditLog />}
    </div>
  );
}

export default RoleList; 