import React from "react";

const JobRoleFilter = ({ selectedJobRole, onJobRoleChange, jobRoles }) => {
  return (
    <select value={selectedJobRole} onChange={(e) => onJobRoleChange(e.target.value)}>
      <option value="">All Job Roles</option>
      {jobRoles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default JobRoleFilter;