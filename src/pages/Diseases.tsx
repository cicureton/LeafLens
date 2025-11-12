import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

interface Disease {
  disease_id: number;
  name: string;
  symptoms: string;
  treatments: string;
  prevention: string;
}

const Diseases: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getDiseases();
      setDiseases(response.data || []);
    } catch (error: any) {
      console.error("Error fetching diseases:", error);
      setError(`Failed to load diseases: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading diseases...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button className="retry-button" onClick={fetchDiseases}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <h1>🌿 Plant Diseases</h1>
        <p>Complete database of plant diseases ({diseases.length} total)</p>
      </header>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Disease Name</th>
              <th>Symptoms</th>
              <th>Treatments</th>
              <th>Prevention</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map((disease) => (
              <tr key={disease.disease_id}>
                <td>#{disease.disease_id}</td>
                <td>
                  <strong>{disease.name}</strong>
                </td>
                <td>
                  {disease.symptoms.length > 100 
                    ? `${disease.symptoms.substring(0, 100)}...` 
                    : disease.symptoms
                  }
                </td>
                <td>
                  {disease.treatments.length > 100 
                    ? `${disease.treatments.substring(0, 100)}...` 
                    : disease.treatments
                  }
                </td>
                <td>
                  {disease.prevention.length > 100 
                    ? `${disease.prevention.substring(0, 100)}...` 
                    : disease.prevention
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {diseases.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No diseases found in the database.
          </div>
        )}
      </div>
    </div>
  );
};

export default Diseases;