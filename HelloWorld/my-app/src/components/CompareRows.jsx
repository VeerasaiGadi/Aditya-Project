import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./CompareRows.css";

const CompareRows = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.data || [];

    const [row1Index, setRow1Index] = useState("");
    const [row2Index, setRow2Index] = useState("");

    if (data.length === 0) {
        return <p className="no-data">No data available for comparison.</p>;
    }

    return (
        <div className="compare-container">
            <h2 className="compare-title">Compare Two Rows</h2>

            {/* Dropdowns to select rows */}
            <div className="dropdown-container">
                <label>Select First Row:</label>
                <select onChange={(e) => setRow1Index(e.target.value)} value={row1Index}>
                    <option value="">Select Row</option>
                    {data.map((row, index) => (
                        <option key={index} value={index}>Row {index + 1}</option>
                    ))}
                </select>

                <label>Select Second Row:</label>
                <select onChange={(e) => setRow2Index(e.target.value)} value={row2Index}>
                    <option value="">Select Row</option>
                    {data.map((row, index) => (
                        <option key={index} value={index}>Row {index + 1}</option>
                    ))}
                </select>
            </div>

            {/* Comparison Table */}
            {row1Index !== "" && row2Index !== "" && (
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th>Column Name</th>
                            <th>Row {parseInt(row1Index) + 1}</th>
                            <th>Row {parseInt(row2Index) + 1}</th>
                            <th>Comparison</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(data[0]).map((key) => (
                            <tr key={key}>
                                <td className="column-name">{key}</td>
                                <td>{data[row1Index][key] ?? "N/A"}</td>
                                <td>{data[row2Index][key] ?? "N/A"}</td>
                                <td className={data[row1Index][key] === data[row2Index][key] ? "match" : "mismatch"}>
                                    {data[row1Index][key] === data[row2Index][key] ? "✅ Match" : "❌ Mismatch"}
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

export default CompareRows;
