import {useAuth} from "../context/AuthContext";
import {Navigate} from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return children;
};

export default AdminRoute;