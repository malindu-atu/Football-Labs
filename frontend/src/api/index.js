import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const loginApi = (data) => api.post("/auth/login", data);

// Coaches
export const getCoaches = () => api.get("/coaches");
export const createCoach = (data) => api.post("/coaches", data);
export const updateCoach = (id, data) => api.put(`/coaches/${id}`, data);
export const deleteCoach = (id) => api.delete(`/coaches/${id}`);
export const addAvailability = (data) => api.post("/coaches/availability", data);
export const getAvailability = (id) => api.get(`/coaches/availability/${id}`);

// Sessions
export const getSessions = () => api.get("/sessions");
export const createSession = (data) => api.post("/sessions", data);
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);
export const getUnassignedSessions = () => api.get("/sessions/unassigned");

// Kids
export const getKids = () => api.get("/kids");
export const getKidsByAgeGroup = (ag) => api.get(`/kids/age-group/${ag}`);
export const createKid = (data) => api.post("/kids", data);

// Attendance
export const markAttendance = (data) => api.post("/attendance/bulk", data);
export const getSessionAttendance = (id) => api.get(`/attendance/session/${id}`);
export const getKidAttendance = (id) => api.get(`/attendance/kid/${id}`);

// Notifications
export const getNotifications = (id) => api.get(`/notifications/${id}`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Analytics
export const getOverviewAnalytics = () => api.get("/analytics/overview");
export const getCoachAnalytics = (id) => api.get(`/analytics/coach/${id}`);
export const getStudentAnalytics = (id) => api.get(`/analytics/student/${id}`);
export const getAgeGroupAnalytics = () => api.get("/analytics/age-group");
export const getLocationAnalytics = () => api.get("/analytics/location");
export const getRetentionAnalytics = () => api.get("/analytics/retention");
// Payments
export const getPayments = (month) => api.get(`/payments${month ? `?month=${month}` : ""}`);
export const getPaymentSummary = (month) => api.get(`/payments/summary/${month}`);
export const upsertPayment = (data) => api.post("/payments", data);
export const getKidPayments = (id) => api.get(`/payments/kid/${id}`);