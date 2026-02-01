import { useAuth } from "@/hooks/useAuthContext";
import { getDisplayName } from "@/lib/api/auth";
import {
  Building2,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Map,
  MapPin,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useDashboardStats } from "../../lib/api/dashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 animate-pulse">
            <div className="w-48 h-8 mb-2 rounded bg-slate-200"></div>
            <div className="w-64 h-4 rounded bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white border rounded-xl border-slate-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-5 h-5" />
                <p className="font-medium">
                  Failed to load dashboard data: {error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = data?.data;

  const statCards = [
    {
      title: "Total Staff",
      value: stats?.staff.total || 0,
      subtitle: `${stats?.staff.active || 0} active`,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Active Staff",
      value: stats?.staff.active || 0,
      subtitle: `${(((stats?.staff.active || 0) / (stats?.staff.total || 1)) * 100).toFixed(1)}% of total`,
      icon: UserCheck,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Admin Users",
      value: stats?.users.total || 0,
      subtitle: "Total Admin users",
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Zones",
      value: stats?.zones || 0,
      subtitle: "Geographic zones",
      icon: Map,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      textColor: "text-amber-600",
    },
    {
      title: "States",
      value: stats?.states || 0,
      subtitle: "States covered",
      icon: MapPin,
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-50 to-cyan-100",
      textColor: "text-cyan-600",
    },
    {
      title: "Prisons",
      value: stats?.prisons || 0,
      subtitle: "Total facilities",
      icon: Building2,
      gradient: "from-slate-500 to-slate-600",
      bgGradient: "from-slate-50 to-slate-100",
      textColor: "text-slate-600",
    },
  ];

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">
            Dashboard Overview
          </h1>
          <p className="text-slate-600">
            Welcome back {getDisplayName(user)}! Here's what's happening with
            your system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const showButton =
              stat.title === "Total Staff" || stat.title === "Admin Users";

            return (
              <Card
                key={index}
                className="relative overflow-hidden transition-all duration-300 bg-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${stat.bgGradient} opacity-40 group-hover:opacity-60 transition-opacity duration-300`}
                />
                <CardHeader className="relative pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardDescription className="mb-1 text-xs font-medium tracking-wider uppercase text-slate-500">
                        {stat.title}
                      </CardDescription>
                      <CardTitle className="text-4xl font-bold text-slate-800">
                        {stat.value.toLocaleString()}
                      </CardTitle>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div
                    className={`flex items-center gap-1 mb-3 ${stat.textColor}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <p className="text-sm font-medium">{stat.subtitle}</p>
                  </div>
                  {showButton && (
                    <Button
                      onClick={() =>
                        navigate(
                          stat.title === "Total Staff"
                            ? "/staff"
                            : "/admin-users",
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      View {stat.title === "Total Staff" ? "Staff" : "Users"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Change Requests Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Change Requests Overview */}
          <Card className="relative overflow-hidden bg-white border-0 shadow-lg">
            <div className="absolute inset-0 opacity-50 bg-linear-to-br from-indigo-50 to-indigo-100" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 shadow-lg rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Change Requests</CardTitle>
                  <CardDescription>Total submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="mb-2 text-5xl font-bold text-indigo-600">
                {(stats?.change_requests.total || 0).toLocaleString()}
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Requests tracked in the system
              </p>
              <Button
                onClick={() => navigate("/approvals")}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Approvals
              </Button>
            </CardContent>
          </Card>

          {/* Change Requests Breakdown */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Request Status Breakdown</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-amber-600">
                        {stats?.change_requests.pending || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-right text-slate-500">
                    {(
                      ((stats?.change_requests.pending || 0) /
                        (stats?.change_requests.total || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/approvals?status=pending")}
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <Eye className="w-3 h-3 mr-2" />
                  View Pending
                </Button>
              </div>

              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Approved
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.change_requests.approved || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-right text-slate-500">
                    {(
                      ((stats?.change_requests.approved || 0) /
                        (stats?.change_requests.total || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/approvals?status=approved")}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Eye className="w-3 h-3 mr-2" />
                  View Approved
                </Button>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Rejected
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.change_requests.rejected || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-right text-slate-500">
                    {(
                      ((stats?.change_requests.rejected || 0) /
                        (stats?.change_requests.total || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/approvals?status=rejected")}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Eye className="w-3 h-3 mr-2" />
                  View Rejected
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
