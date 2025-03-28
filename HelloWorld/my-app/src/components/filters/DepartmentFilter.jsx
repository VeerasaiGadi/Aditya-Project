import React from "react";

const DepartmentFilter = ({ selectedDepartment, onDepartmentChange, departments }) => {
  return (
    <select value={selectedDepartment} onChange={(e) => onDepartmentChange(e.target.value)}>
      <option value="">All Departments</option>
      {departments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>
  );
};

export default DepartmentFilter;
