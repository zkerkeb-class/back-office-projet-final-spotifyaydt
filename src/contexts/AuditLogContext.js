import React, { createContext, useContext, useState } from 'react';

const AuditLogContext = createContext(null);

export const AuditLogProvider = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState([]);

  const addLog = (action) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...action
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  };

  return (
    <AuditLogContext.Provider value={{ auditLogs, addLog }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = () => useContext(AuditLogContext); 