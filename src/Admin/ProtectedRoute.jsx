import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Components/firebase";

function ProtectedRoute({ children }) {
    const [user, loading] = useAuthState(auth);

    if (loading) return <p>Yuklanmoqda...</p>;

    if (!user) {
        return <Navigate to="/AdminLoginPage" replace />;
    }

    return children;
}

export default ProtectedRoute;
