import axios from "axios";
import React, { useEffect, useState } from "react";

const IncomingRequestsSection: React.FC = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/friends/requests');
      setRequests(res.data.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const respondToRequest = async (requesterId: string, action: 'accept' | 'reject') => {
    try {
      await axios.post(`/api/friends/request/${action}`, {
        fromUserId: requesterId
      });
      fetchRequests(); // Refresh list
    } catch (err) {
      alert(`Could not ${action} request`);
    }
  };

  return (
    <div className="mt-4">
      <h4>Friend Requests</h4>
      {requests.length === 0 ? <p>No new requests.</p> : (
        <ul className="list-group">
          {requests.map((req: any) => (
            <li key={req.from._id} className="list-group-item d-flex justify-content-between align-items-center">
              {req.from.name}
              <div>
                <button className="btn btn-sm btn-primary me-2" onClick={() => respondToRequest(req.from._id, 'accept')}>Accept</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => respondToRequest(req.from._id, 'reject')}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IncomingRequestsSection