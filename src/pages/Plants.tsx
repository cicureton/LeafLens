import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

interface Plant {
  plant_id: number;
  name: string;
  common_name: string | null;
  species: string | null;
}

const Plants: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getPlants();
      setPlants(response.data || []);
    } catch (error: any) {
      console.error("Error fetching plants:", error);
      setError(`Failed to load plants: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading plants...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button className="retry-button" onClick={fetchPlants}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <h1>🌱 Plants Database</h1>
        <p>Complete database of plants ({plants.length} total)</p>
      </header>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Scientific Name</th>
              <th>Common Name</th>
              <th>Species</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.plant_id}>
                <td>#{plant.plant_id}</td>
                <td>
                  <strong>{plant.name}</strong>
                </td>
                <td>
                  {plant.common_name || 'N/A'}
                </td>
                <td>
                  {plant.species || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {plants.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No plants found in the database.
          </div>
        )}
      </div>
    </div>
  );
};

export default Plants;