import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState("");
    const [status, setStatus] = useState("idle"); // "idle" | "loading" | "done"
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setStatus("idle");
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus("idle");
    };

    const handleUpload = async () => {
        if (!file) {
            console.error("No file selected");
            return;
        }

        setStatus("loading"); // Show spinner while uploading
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAnalysis(response.data.analysis);
            setStatus("done");
        } catch (error) {
            console.error("Error uploading file:", error);
            setStatus("idle");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow-lg" style={{ width: "450px" }}>
                <h2 className="text-center mb-3">Upload Portfolio</h2>

                {/* File Upload State */}
                {status === "idle" && (
                    <div
                        className={`border border-dashed p-4 text-center rounded ${dragging ? "border-primary bg-light" : "border-secondary"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <p className="text-muted mb-2">Drag & Drop your file here</p>
                        <p className="text-muted">or</p>
                        <label className="btn btn-outline-primary">
                            Click to Upload
                            <input type="file" className="d-none" onChange={handleFileChange} />
                        </label>
                        {file && <p className="mt-2 text-success">Selected File: {file.name}</p>}
                        {file && (
                            <button className="btn btn-primary mt-3 w-100" onClick={handleUpload}>
                                Upload & Analyze
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {status === "loading" && (
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Analyzing your portfolio...</p>
                    </div>
                )}

                {/* Result State */}
                {status === "done" && (
                    <div className="text-center">
                        <h4 className="mb-3">Analysis Result</h4>
                        <div
                            className="border p-3 rounded bg-white text-start"
                            style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd" }}
                            dangerouslySetInnerHTML={{ __html: analysis }}
                        ></div>
                        <button
                            className="btn btn-secondary mt-3 w-100"
                            onClick={() => {
                                setStatus("idle");
                                setFile(null);
                                setAnalysis("");
                            }}
                        >
                            Upload Another File
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
    