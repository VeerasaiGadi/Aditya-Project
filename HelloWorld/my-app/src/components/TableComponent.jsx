import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/TableComponent.css";
import DepartmentFilter from "./filters/DepartmentFilter";
import JobRoleFilter from "./filters/JobRoleFilter";
import SalaryFilter from "./filters/salary";

// Mappings for Department and JobRole
const departmentMapping = {
  1: "Human Resources (HR)",
  2: "Business Analysis",
  3: "Software Engineering",
  4: "Project Management",
  5: "Quality Assurance (QA)",
};

const jobRoleMapping = {
  1: "Intern",
  2: "Junior Developer",
  3: "Developer",
  4: "Senior Developer",
  5: "Team Lead",
  6: "Project Manager",
  7: "Architect",
  8: "Technical Manager",
  9: "Director",
  10: "CTO",
};

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("");
  const rowsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/data")
      .then((response) => {
        console.log("Fetched Data:", response.data);
        
        // Convert numeric values to mapped names
        const mappedData = response.data.map((emp) => ({
          ...emp,
          Department: departmentMapping[emp.Department] || emp.Department,
          JobRole: jobRoleMapping[emp.JobRole] || emp.JobRole,
        }));

        // Sort by Department and JobRole
        const sortedData = mappedData
        .filter((item) => item && item.Department && item.JobRole) // Filter out undefined values
        .sort((a, b) => {
          const deptA = a.Department || "";
          const deptB = b.Department || "";
          const jobA = a.JobRole || "";
          const jobB = b.JobRole || "";

          return deptA.localeCompare(deptB) || jobA.localeCompare(jobB);
        });


        setData(sortedData);
        setFilteredData(sortedData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    let filteredEmployees = data;

    // Search Filter
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Department Filter (case-insensitive)
    if (selectedDepartment) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.Department.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    // Job Role Filter (case-insensitive)
    if (selectedJobRole) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.JobRole.toLowerCase() === selectedJobRole.toLowerCase()
      );
    }

    // Salary Range Filter
    if (selectedSalaryRange) {
      const [min, max] = selectedSalaryRange.split("-").map(Number);
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.MonthlyIncome >= min && emp.MonthlyIncome <= max
      );
    }

    setFilteredData(filteredEmployees);
    setCurrentPage(1);
  }, [search, selectedDepartment, selectedJobRole, selectedSalaryRange, data]);

  const handleViewDetails = (row) => {
    navigate("/details", { state: { row } });
  };

  const handleCompareColumns = () => {
    navigate("/compare", { state: { data } });
  };

  const handleCompareRows = () => {
    navigate("/compare-rows", { state: { data } });
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Unique sorted values for filters
  const uniqueDepartments = data.length 
    ? [...new Set(data.map((emp) => emp.Department))].sort() 
    : [];

  const uniqueJobRoles = data.length 
    ? [...new Set(data.map((emp) => emp.JobRole))].sort() 
    : [];

  return (
    <div className="container">
      <h2 className="title">Data Table</h2>

      {/* Filters */}
      <div className="filters-container">
        <DepartmentFilter
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={uniqueDepartments}
        />
        <JobRoleFilter
          selectedJobRole={selectedJobRole}
          onJobRoleChange={setSelectedJobRole}
          jobRoles={uniqueJobRoles}
        />
        <SalaryFilter
          selectedRange={selectedSalaryRange}
          onFilterChange={setSelectedSalaryRange}
        />
      </div>

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      {/* Compare Buttons */}
      <div className="buttons-container">
        <button className="compare-button stylish-button" onClick={handleCompareColumns}>
          🔍 Compare Columns
        </button >
        <button className="compare-button stylish-button" onClick={handleCompareRows}>
          📊 Compare Rows
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Job Role</th>
              <th>Performance Rating</th>
              <th>Salary in Rs.</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.EmployeeNumber}</td>
                  <td>{row.Name}</td>
                  <td>{row.Department}</td>
                  <td>{row.JobRole}</td>
                  <td>{row.PerformanceRating}</td>
                  <td>{row.MonthlyIncome}</td>
                  <td>
                    <button className="details-button" onClick={() => handleViewDetails(row)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Previous
        </button>
        <span className="pagination-text">
          Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}
        </span>
        <button onClick={nextPage} disabled={currentPage >= Math.ceil(filteredData.length / rowsPerPage)} className="pagination-button">
          Next
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
