import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

interface Scan {
  scan_id: number;
  user_id: number;
  plant_id: number | null;
  disease_id: number | null;
  confidence_score: number | null;
  date: string;
  user_name?: string;
  plant_name?: string;
  disease_name?: string;
}

interface User {
  user_id: number;
  name: string;
}

interface Plant {
  plant_id: number;
  name: string;
}

interface Disease {
  disease_id: number;
  name: string;
}

const Scans: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<number | "">("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scansResponse, usersResponse, plantsResponse, diseasesResponse] = await Promise.all([
        adminAPI.getScans(),
        adminAPI.getUsers(),
        adminAPI.getPlants(),
        adminAPI.getDiseases()
      ]);

      setScans(scansResponse.data || []);
      setUsers(usersResponse.data || []);
      setPlants(plantsResponse.data || []);
      setDiseases(diseasesResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId: number) => {
    if (window.confirm("Are you sure you want to delete this scan? This action cannot be undone.")) {
      try {
        await adminAPI.deleteScan(scanId);
        setScans(scans.filter(scan => scan.scan_id !== scanId));
        alert("Scan deleted successfully");
      } catch (error) {
        console.error("Error deleting scan:", error);
        alert("Error deleting scan");
      }
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const getPlantName = (plantId: number | null) => {
    if (!plantId) return "Not identified";
    const plant = plants.find(p => p.plant_id === plantId);
    return plant ? plant.name : `Plant ${plantId}`;
  };

  const getDiseaseName = (diseaseId: number | null) => {
    if (!diseaseId) return "Not identified";
    const disease = diseases.find(d => d.disease_id === diseaseId);
    return disease ? disease.name : `Disease ${diseaseId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredScans = filterUser 
    ? scans.filter(scan => scan.user_id === filterUser)
    : scans;

  if (loading) {
    return <div className="loading">Loading scans...</div>;
  }

  return (
    <div>
      <header className="page-header">
        <h1>🔍 Scan History</h1>
        <p>View and manage plant disease scan records</p>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="userFilter">Filter by User:</label>
          <select
            id="userFilter"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="scan-stats">
          <span>Total Scans: {scans.length}</span>
          {filterUser && <span>Filtered: {filteredScans.length}</span>}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Scan ID</th>
              <th>User</th>
              <th>Plant</th>
              <th>Disease</th>
              <th>Confidence</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  No scans found
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => (
                <tr key={scan.scan_id}>
                  <td>#{scan.scan_id}</td>
                  <td>{getUserName(scan.user_id)}</td>
                  <td>
                    <span className={`plant-badge ${scan.plant_id ? 'identified' : 'unknown'}`}>
                      {getPlantName(scan.plant_id)}
                    </span>
                  </td>
                  <td>
                    <span className={`disease-badge ${scan.disease_id ? 'identified' : 'unknown'}`}>
                      {getDiseaseName(scan.disease_id)}
                    </span>
                  </td>
                  <td>
                    {scan.confidence_score ? (
                      <span className={`confidence-score ${scan.confidence_score > 80 ? 'high' : scan.confidence_score > 60 ? 'medium' : 'low'}`}>
                        {scan.confidence_score.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="confidence-score unknown">N/A</span>
                    )}
                  </td>
                  <td>{formatDate(scan.date)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleDeleteScan(scan.scan_id)}
                        className="btn-delete"
                        title="Delete Scan"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scans;