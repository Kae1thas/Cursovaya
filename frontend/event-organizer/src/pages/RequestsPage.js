import React, { useState, useEffect } from "react";
import axiosClient, { getUserRole } from "../api/axiosClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsRes, userRole] = await Promise.all([
          axiosClient.get("/requests/"),
          getUserRole(),
        ]);
        setRequests(requestsRes.data);
        setRole(userRole);
      } catch (error) {
        console.error("Ошибка загрузки заявок:", error);
        toast.error("Ошибка при загрузке заявок.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (requestId, status) => {
    try {
      await axiosClient.patch(`/requests/${requestId}/`, { status });
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      );
      toast.success(`Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}!`);
    } catch (error) {
      toast.error("Ошибка при обновлении статуса.");
    }
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Заявки</h1>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse p-4 rounded-lg">
              <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500">Нет заявок</p>
          ) : (
            requests.map((request) => (
              <motion.div
                key={request.id}
                className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h2 className="text-xl font-semibold">{request.request_type}</h2>
                  <p className="text-gray-500">Пользователь: {request.user.username}</p>
                  <p className="text-gray-500">Статус: {request.status}</p>
                  <p className="text-gray-500">Данные: {JSON.stringify(request.data)}</p>
                </div>
                {role === 'moderator' || role === 'admin' ? (
                  <div className="flex space-x-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request.id, 'approved')}
                          className="text-green-500 hover:text-green-700"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'rejected')}
                          className="text-red-500 hover:text-red-700"
                        >
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RequestsPage;