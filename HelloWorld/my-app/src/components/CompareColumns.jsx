import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./CompareColumns.css";

const CompareColumns = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.data || [];

    const [mainColumn, setMainColumn] = useState("");
    const [comparisonType, setComparisonType] = useState("column"); // "column" or "value"
    const [compareColumn, setCompareColumn] = useState("");
    const [compareValue, setCompareValue] = useState("");

    if (data.length === 0) {
        return <p className="no-data">No data available for comparison.</p>;
    }

    const columns = Object.keys(data[0]);
    const uniqueValues = mainColumn ? [...new Set(data.map(row => row[mainColumn]))] : [];

    return (
        <div className="compare-container">
            <h2 className="compare-title">Compare Columns & Values</h2>

            {/* Select Main Column */}
            <div className="dropdown-container">
                <label>Select Main Column:</label>
                <select onChange={(e) => setMainColumn(e.target.value)} value={mainColumn}>
                    <option value="">Select Column</option>
                    {columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                    ))}
                </select>
            </div>

            {/* Comparison Type Selection */}
            <div className="dropdown-container">
                <label>Compare With:</label>
                <select onChange={(e) => setComparisonType(e.target.value)} value={comparisonType}>
                    <option value="column">Another Column</option>
                    <option value="value">A Specific Value</option>
                </select>
            </div>

            {/* Column or Value Selection */}
            {comparisonType === "column" ? (
                <div className="dropdown-container">
                    <label>Select Column to Compare:</label>
                    <select onChange={(e) => setCompareColumn(e.target.value)} value={compareColumn}>
                        <option value="">Select Column</option>
                        {columns.filter(col => col !== mainColumn).map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="dropdown-container">
                    <label>Select Specific Value:</label>
                    <select onChange={(e) => setCompareValue(e.target.value)} value={compareValue}>
                        <option value="">Select Value</option>
                        {uniqueValues.map((val, index) => (
                            <option key={index} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Comparison Table */}
            {mainColumn && ((comparisonType === "column" && compareColumn) || (comparisonType === "value" && compareValue)) && (
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>{mainColumn}</th>
                            <th>{comparisonType === "column" ? compareColumn : "Selected Value"}</th>
                            <th>Comparison</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row[mainColumn] ?? "N/A"}</td>
                                <td>{comparisonType === "column" ? row[compareColumn] ?? "N/A" : compareValue}</td>
                                <td className={(comparisonType === "column" && row[mainColumn] === row[compareColumn]) ||
                                               (comparisonType === "value" && row[mainColumn] === compareValue) 
                                               ? "match" : "mismatch"}>
                                    {(comparisonType === "column" && row[mainColumn] === row[compareColumn]) ||
                                     (comparisonType === "value" && row[mainColumn] === compareValue)
                                     ? "✅ Match" : "❌ Mismatch"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default CompareColumns;
