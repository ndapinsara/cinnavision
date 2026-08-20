import { redirect } from "next/navigation";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import { getCurrentUserWithRole } from "@/lib/auth";

const DashboardPage = async () => {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/");
  }

  if (user.role === "farmer") {
    return <FarmerDashboard userName={user.firstName ?? undefined} />;
  }

  if (user.role === "buyer") {
    return <BuyerDashboard />;
  }

  redirect("/");
};

export default DashboardPage;
