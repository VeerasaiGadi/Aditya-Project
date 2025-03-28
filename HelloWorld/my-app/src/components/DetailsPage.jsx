import { useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../components/DetailsPage.css";

const DetailsPage = () => {
    const location = useLocation();
    const row = location.state?.row;
    const [predictedSalary, setPredictedSalary] = useState(null);
    const [decision, setDecision] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const fileInputRef = useRef(null); // Fixed missing useRef

    if (!row) {
        return <p className="no-details">No details available.</p>;
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePredict = async () => {
        console.log("📤 Sending data to API:", row);

        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(row)
            });

            const data = await response.json();
            console.log("✅ Prediction Response:", data);

            if (response.ok) {
                if (data.predicted_salary !== undefined) {
                    setPredictedSalary(data.predicted_salary);
                } else {
                    console.error("⚠️ Unexpected API response:", data);
                }
            } else {
                console.error("❌ API Error:", data.error || "Unknown error");
            }
        } catch (error) {
            console.error("❌ Error fetching prediction:", error);
        }
    };

    const handleDecision = (userDecision) => {
        setDecision(userDecision);
        console.log(`User decision: ${userDecision}`);
    };

    const actualSalary = row.MonthlyIncome;
    const difference = predictedSalary !== null ? predictedSalary - actualSalary : null;
    const salaryComparisonData = predictedSalary !== null ? [
        { name: "Actual Salary", salary: actualSalary },
        { name: "Predicted Salary", salary: predictedSalary }
    ] : [];

    return (
        <div className="details-container">
            <h2 className="details-title">Row Details</h2>
            <div className="profile-section">
                <div className="image-upload-container">
                    {uploadedImage ? (
                        <img 
                            src={uploadedImage} 
                            alt="Uploaded profile" 
                            className="uploaded-image"
                        />
                    ) : (
                        <div className="image-placeholder">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                ref={fileInputRef} // Fixed file input reference
                                className="file-input"
                            />
                            <p>Upload Profile Picture</p>
                        </div>
                    )}
                </div>

                {uploadedImage && (
                    <button 
                        className="remove-image-button" 
                        onClick={handleRemoveImage}
                    >
                        Remove
                    </button>
                )}

                <table className="details-table">
                    <tbody>
                        {Object.entries(row).map(([key, value]) => (
                            <tr key={key}>
                                <td className="details-key">{key}</td>
                                <td className="details-value">
                                    {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <button className="predict-button" onClick={handlePredict}>Predict Salary</button>
            </div>

            {predictedSalary !== null && (
                <div>
                    <h3 className="chart-title">Actual vs Predicted Salary</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salaryComparisonData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="salary" fill="#8884d8" name="Salary" />
                        </BarChart>
                    </ResponsiveContainer>

                    <p className="predicted-salary">Predicted Salary: ${predictedSalary.toFixed(2)}</p>
                    <p className="actual-salary">Actual Salary: ${actualSalary?.toFixed(2) ?? "N/A"}</p>

                    {difference !== null && (
                        <p 
                            className="salary-difference"
                            style={{ color: difference >= 0 ? "green" : "red", fontWeight: "bold" }}
                        >
                            Difference: {difference >= 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2)}
                        </p>
                    )}

                    {/* Accept and Decline Buttons */}
                    <div className="decision-buttons">
                        <button className="accept-button" onClick={() => handleDecision("Accepted")}>Accept</button>
                        <button className="decline-button" onClick={() => handleDecision("Declined")}>Decline</button>
                    </div>

                    {decision && <p className="decision-message">You have {decision} the predicted salary.</p>}
                </div>
            )}

            <button className="back-button" onClick={() => window.history.back()}>Go Back</button>
        </div>
    );
};

export default DetailsPage;
