import React from "react";

const salaryRanges = [
  { min: 10000, max: 20000 },
  { min: 20000, max: 30000 },
  { min: 30000, max: 40000 },
  { min: 40000, max: 50000 },
  { min: 50000, max: 60000 },
  { min: 60000, max: 70000 },
  { min: 70000, max: 80000 },
  { min: 80000, max: 90000 },
  { min: 90000, max: 100000 },
];

const SalaryFilter = ({ selectedRange, onFilterChange }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg mb-4">
      {/* <h2 className="text-lg font-semibold mb-2">Filter by Salary Range</h2> */}
      <select
        className="w-full p-2 border rounded"
        value={selectedRange}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="">All Salaries</option>
        {salaryRanges.map((range, index) => (
          <option key={index} value={`${range.min}-${range.max}`}>
            {range.min} - {range.max}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SalaryFilter;
