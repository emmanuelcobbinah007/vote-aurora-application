"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  Admin,
  AdminDashboardData,
  BulkInviteResult,
} from "@/services/adminApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Users,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react";

interface BulkInviteForm {
  emails: string;
  full_names: string;
}

export default function AdminManagementPage() {
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [bulkInviteModalOpen, setBulkInviteModalOpen] = useState(false);
  const [singleInviteForm, setSingleInviteForm] = useState({
    email: "",
    full_name: "",
  });
  const [bulkInviteForm, setBulkInviteForm] = useState<BulkInviteForm>({
    emails: "",
    full_names: "",
  });
  const [bulkInviteResult, setBulkInviteResult] =
    useState<BulkInviteResult | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: adminApi.getAdmins,
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getAdminDashboard,
  });

  // Mutations
  const inviteAdminMutation = useMutation({
    mutationFn: adminApi.inviteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setInviteModalOpen(false);
      setSingleInviteForm({ email: "", full_name: "" });
    },
  });

  const bulkInviteMutation = useMutation({
    mutationFn: ({
      emails,
      full_names,
    }: {
      emails: string[];
      full_names: string[];
    }) =>
      adminApi.bulkInviteAdmins(
        emails.map((email) => adminApi.createAdminEmail(email)),
        full_names
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setBulkInviteResult(result);
    },
  });

  const bulkSuspendMutation = useMutation({
    mutationFn: adminApi.bulkSuspendAdmins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelectedAdmins([]);
    },
  });

  const bulkActivateMutation = useMutation({
    mutationFn: adminApi.bulkActivateAdmins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelectedAdmins([]);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: adminApi.bulkDeleteAdmins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelectedAdmins([]);
    },
  });

  // Handlers
  const handleSingleInvite = () => {
    if (singleInviteForm.email && singleInviteForm.full_name) {
      inviteAdminMutation.mutate(singleInviteForm);
    }
  };

  const handleBulkInvite = () => {
    const emails = bulkInviteForm.emails
      .split("\n")
      .map((e) => e.trim())
      .filter(Boolean);
    const full_names = bulkInviteForm.full_names
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (emails.length === full_names.length && emails.length > 0) {
      bulkInviteMutation.mutate({ emails, full_names });
    }
  };

  const handleAdminSelection = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedAdmins([...selectedAdmins, adminId]);
    } else {
      setSelectedAdmins(selectedAdmins.filter((id) => id !== adminId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdmins(admins.map((admin) => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="success" className="bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  if (adminsLoading || dashboardLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading admin management...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-600 mt-2">
            Manage administrator accounts and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Admin
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkInviteModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Invite
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admins">All Admins</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Admins
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.statistics.totalAdmins || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Admins
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData?.statistics.activeAdmins || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assignments
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.statistics.totalAssignments || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Invites
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData?.statistics.pendingInvitations || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Assignments</CardTitle>
              <CardDescription>
                Latest administrator assignments to elections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{assignment.admin_name}</p>
                      <p className="text-sm text-gray-600">
                        {assignment.admin_email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{assignment.election_title}</p>
                      <p className="text-sm text-gray-600">
                        Assigned by {assignment.assigned_by} •{" "}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!dashboardData?.recentAssignments.length && (
                  <p className="text-center text-gray-500 py-4">
                    No recent assignments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          {/* Bulk Actions */}
          {selectedAdmins.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedAdmins.length} admin(s) selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        bulkActivateMutation.mutate(
                          selectedAdmins.map((id) => adminApi.createAdminId(id))
                        )
                      }
                      disabled={bulkActivateMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        bulkSuspendMutation.mutate(
                          selectedAdmins.map((id) => adminApi.createAdminId(id))
                        )
                      }
                      disabled={bulkSuspendMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <ShieldOff className="w-3 h-3" />
                      Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        bulkDeleteMutation.mutate(
                          selectedAdmins.map((id) => adminApi.createAdminId(id))
                        )
                      }
                      disabled={bulkDeleteMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admins Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Administrators</CardTitle>
                  <CardDescription>
                    Manage all administrator accounts
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={
                      selectedAdmins.length === admins.length &&
                      admins.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedAdmins.includes(admin.id)}
                        onCheckedChange={(checked) =>
                          handleAdminSelection(admin.id, checked as boolean)
                        }
                      />
                      <div>
                        <p className="font-medium">{admin.full_name}</p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-xs text-gray-500">
                          {admin.assignments_count} assignment(s) • Last login:{" "}
                          {admin.last_login
                            ? new Date(admin.last_login).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(admin.status)}
                      <p className="text-sm text-gray-500">
                        Created{" "}
                        {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!admins.length && (
                  <p className="text-center text-gray-500 py-8">
                    No administrators found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Invitations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invitations</CardTitle>
              <CardDescription>
                Latest admin invitation activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-gray-600">
                        Invited by {invitation.invited_by} •{" "}
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={invitation.used ? "success" : "secondary"}
                      >
                        {invitation.used ? "Accepted" : "Pending"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires:{" "}
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!dashboardData?.recentInvitations.length && (
                  <p className="text-center text-gray-500 py-4">
                    No recent invitations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Single Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Administrator</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new administrator
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={singleInviteForm.email}
                onChange={(e) =>
                  setSingleInviteForm({
                    ...singleInviteForm,
                    email: e.target.value,
                  })
                }
                placeholder="admin@university.edu"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={singleInviteForm.full_name}
                onChange={(e) =>
                  setSingleInviteForm({
                    ...singleInviteForm,
                    full_name: e.target.value,
                  })
                }
                placeholder="John Doe"
              />
            </div>
            {inviteAdminMutation.error && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {inviteAdminMutation.error.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSingleInvite}
              disabled={
                inviteAdminMutation.isPending ||
                !singleInviteForm.email ||
                !singleInviteForm.full_name
              }
            >
              {inviteAdminMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Modal */}
      <Dialog open={bulkInviteModalOpen} onOpenChange={setBulkInviteModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Invite Administrators</DialogTitle>
            <DialogDescription>
              Invite multiple administrators at once. Enter one email and name
              per line.
            </DialogDescription>
          </DialogHeader>

          {!bulkInviteResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emails">Email Addresses (one per line)</Label>
                  <Textarea
                    id="emails"
                    value={bulkInviteForm.emails}
                    onChange={(e) =>
                      setBulkInviteForm({
                        ...bulkInviteForm,
                        emails: e.target.value,
                      })
                    }
                    placeholder="admin1@university.edu&#10;admin2@university.edu&#10;admin3@university.edu"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="full_names">Full Names (one per line)</Label>
                  <Textarea
                    id="full_names"
                    value={bulkInviteForm.full_names}
                    onChange={(e) =>
                      setBulkInviteForm({
                        ...bulkInviteForm,
                        full_names: e.target.value,
                      })
                    }
                    placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
                    rows={6}
                  />
                </div>
              </div>

              {bulkInviteMutation.error && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {bulkInviteMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Bulk invitation completed:{" "}
                  {bulkInviteResult.summary.successful} successful,{" "}
                  {bulkInviteResult.summary.failed} failed
                </AlertDescription>
              </Alert>

              {bulkInviteResult.failed_invitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      Failed Invitations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {bulkInviteResult.failed_invitations.map(
                        (failed, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-red-50 rounded"
                          >
                            <span>{failed.email}</span>
                            <span className="text-sm text-red-600">
                              {failed.error}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkInviteModalOpen(false);
                setBulkInviteResult(null);
                setBulkInviteForm({ emails: "", full_names: "" });
              }}
            >
              {bulkInviteResult ? "Close" : "Cancel"}
            </Button>
            {!bulkInviteResult && (
              <Button
                onClick={handleBulkInvite}
                disabled={
                  bulkInviteMutation.isPending ||
                  !bulkInviteForm.emails ||
                  !bulkInviteForm.full_names
                }
              >
                {bulkInviteMutation.isPending
                  ? "Sending..."
                  : "Send Invitations"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
