import React, { useState } from "react";
import axios from "axios";

const UploadImage = ({ employeeNumber }) => {
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("EmployeeNumber", employeeNumber);

    try {
      const res = await axios.post("http://localhost:5000/api/employees/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Image uploaded successfully!");
      console.log(res.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadImage;
