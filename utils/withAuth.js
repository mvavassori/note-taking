//! PROBLEM ON RELOAD, IT DOESN'T LET THE COMPONENT TIME TO GRAB THE user, IT REDIRECTS IMMEDIATELY.

import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { useEffect } from "react";

function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
      if (!user) {
        // Redirect to the home page if user is not authenticated
        router.replace("/");
      }
    }, [user, router]);

    if (loading) {
      // Show loading spinner or something similar
      <div>Loading...</div>;
      return null;
    }

    // Render the component if the user is authenticated
    return user ? <Component {...props} /> : null;
  };
}

export default withAuth;
