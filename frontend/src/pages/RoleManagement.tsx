import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Modal, Input, TextArea, Checkbox, Tabs, TabsList, TabsTrigger, TabsContent, SearchableSelect } from '../components/ui/Components';
import { DataTable } from '../components/ui/DataTable';
import { MOCK_PERMISSIONS, MOCK_SYSTEM_ROLES, MOCK_USERS } from '../constants';
import { SystemRole, Permission, User } from '../types';
import { Shield, Plus, Edit2, Trash2, Search, Info, Lock, Users, CheckCircle2, UserPlus, X, AlertTriangle, Key } from 'lucide-react';
import { useToast } from '../App';
import { ColumnDef } from '@tanstack/react-table';

const RoleManagement = () => {
    const { toast } = useToast();
    const [roles, setRoles] = useState<SystemRole[]>(MOCK_SYSTEM_ROLES);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    // Modals Visibility
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Active Context
    const [activeRole, setActiveRole] = useState<SystemRole | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    // --- Handlers ---

    const handleOpenAdd = () => {
        setActiveRole(null);
        setFormData({ name: '', description: '', permissions: [] });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (role: SystemRole) => {
        setActiveRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: [...role.permissions]
        });
        setIsEditModalOpen(true);
    };

    const handleOpenAssign = (role: SystemRole) => {
        setActiveRole(role);
        setIsAssignModalOpen(true);
    };

    const handleOpenPermissions = (role: SystemRole) => {
        setActiveRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: [...role.permissions]
        });
        setIsPermissionModalOpen(true);
    };

    const handleOpenDelete = (role: SystemRole) => {
        if (role.isSystem) {
            toast('error', 'System roles cannot be deleted.', 'Action Denied');
            return;
        }
        setActiveRole(role);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (activeRole) {
            setRoles(roles.filter(r => r.id !== activeRole.id));
            toast('success', `Role "${activeRole.name}" deleted successfully.`);
            setIsDeleteModalOpen(false);
            setActiveRole(null);
        }
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(id => id !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const savePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeRole) {
            setRoles(roles.map(r => r.id === activeRole.id ? { ...r, permissions: formData.permissions } : r));
            toast('success', 'Permissions updated successfully.');
            setIsPermissionModalOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeRole) {
            setRoles(roles.map(r => r.id === activeRole.id ? { ...r, ...formData } : r));
            toast('success', 'Role details updated.');
        } else {
            const newRole: SystemRole = {
                id: `r${Date.now()}`,
                ...formData,
                userCount: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setRoles([newRole, ...roles]);
            toast('success', 'New system role created.');
        }
        setIsEditModalOpen(false);
    };

    // --- Table Configuration ---

    const columns: ColumnDef<SystemRole>[] = [
        {
            accessorKey: 'name',
            header: 'Role & Description',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 dark:text-white">{row.original.name}</span>
                        {row.original.isSystem && (
                            <Badge variant="default" className="text-[9px] py-0 bg-slate-100 dark:bg-navy-800 text-slate-500 font-bold border-none uppercase">
                                <Lock className="w-2.5 h-2.5 mr-1" /> System
                            </Badge>
                        )}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs italic">{row.original.description}</span>
                </div>
            )
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions List',
            cell: ({ row }) => {
                const rolePerms = row.original.permissions;
                const displayPerms = MOCK_PERMISSIONS.filter(p => rolePerms.includes(p.id));

                return (
                    <div className="flex flex-wrap gap-1 max-w-md">
                        {displayPerms.slice(0, 3).map(p => (
                            <Badge key={p.id} variant="outline" className="text-[9px] py-0 px-1.5 border-slate-200 text-slate-500 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50">
                                {p.name}
                            </Badge>
                        ))}
                        {displayPerms.length > 3 && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-gold-500">
                                +{displayPerms.length - 3} More
                            </Badge>
                        )}
                        {displayPerms.length === 0 && <span className="text-xs text-slate-400 italic">No permissions</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: 'userCount',
            header: 'Assigned',
            cell: ({ row }) => (
                <button
                    onClick={() => handleOpenAssign(row.original)}
                    className="flex items-center gap-2 text-navy-600 dark:text-gold-500 hover:underline font-medium"
                >
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-sm">{row.original.userCount} Users</span>
                </button>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenPermissions(row.original)} title="Manage Permissions">
                        <Shield className="w-4 h-4 text-emerald-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenAssign(row.original)} title="Assign Users">
                        <UserPlus className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row.original)} title="Edit Role">
                        <Edit2 className="w-4 h-4 text-slate-400" />
                    </Button>
                    {!row.original.isSystem && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(row.original)} title="Delete Role">
                            <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const permissionGroups = useMemo(() => {
        return MOCK_PERMISSIONS.reduce((acc, perm) => {
            if (!acc[perm.category]) acc[perm.category] = [];
            acc[perm.category].push(perm);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-medium text-navy-900 dark:text-white">Access Control</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure system roles and granular security permissions</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-2" /> Create New Role
                </Button>
            </div>

            <Card noPadding className="overflow-hidden border-navy-100 dark:border-navy-800 p-2">
                <DataTable columns={columns} data={roles} searchKey="name" searchPlaceholder="Search system roles..." />
            </Card>

            {/* --- Create/Edit Basic Details Modal --- */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={activeRole ? `Edit Role: ${activeRole.name}` : 'Create New System Role'}
                className="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Role Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={activeRole?.isSystem}
                            placeholder="e.g. Finance Admin"
                        />
                        <TextArea
                            label="Role Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Briefly explain the responsibilities of this role..."
                            rows={3}
                        />
                    </div>

                    {!activeRole && (
                        <div className="p-4 bg-navy-50 dark:bg-navy-900/50 rounded-xl border border-navy-100 dark:border-navy-700 flex gap-3">
                            <Info className="w-5 h-5 text-navy-600 dark:text-gold-500 flex-shrink-0" />
                            <p className="text-xs text-navy-800 dark:text-slate-300 leading-relaxed">
                                After creating the role, you can assign granular permissions and add users from the main table actions.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-navy-700">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit">
                            {activeRole ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* --- Dedicated Manage Permissions Modal --- */}
            <Modal
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                title={activeRole ? `Permissions: ${activeRole.name}` : 'Manage Permissions'}
                className="max-w-4xl"
            >
                <form onSubmit={savePermissions}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {Object.entries(permissionGroups).map(([category, perms]) => (
                            <div key={category} className="space-y-4">
                                <h4 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-navy-800 uppercase tracking-widest text-[10px]">
                                    <Shield className="w-3.5 h-3.5 text-gold-500" />
                                    {category}
                                </h4>
                                <div className="space-y-2">
                                    {(perms as Permission[]).map(perm => (
                                        <div
                                            key={perm.id}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${formData.permissions.includes(perm.id)
                                                ? 'bg-navy-50 border-navy-200 dark:bg-navy-900/50 dark:border-navy-700'
                                                : 'bg-white border-slate-200 dark:bg-navy-950 dark:border-navy-900 hover:border-slate-300'
                                                }`}
                                            onClick={() => togglePermission(perm.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(perm.id)
                                                    ? 'bg-navy-900 border-navy-900 dark:bg-gold-500 dark:border-gold-500'
                                                    : 'border-slate-300 dark:border-navy-700 group-hover:border-slate-400'
                                                    }`}>
                                                    {formData.permissions.includes(perm.id) && <CheckCircle2 className="w-3 h-3 text-white dark:text-navy-900" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold leading-none ${formData.permissions.includes(perm.id) ? 'text-navy-900 dark:text-gold-500' : 'text-slate-700 dark:text-slate-300'
                                                        }`}>{perm.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">{perm.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-navy-700 mt-8">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>{formData.permissions.length} Permissions Active for this Role</span>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsPermissionModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Update Permissions</Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* --- Assign Role to Users Modal --- */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title={`Assign Users to ${activeRole?.name}`}
                className="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Filter users by name or department..." className="pl-9" />
                    </div>

                    <div className="border border-slate-100 dark:border-navy-700 rounded-xl overflow-hidden">
                        <div className="max-h-[40vh] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-navy-900 border-b border-slate-100 dark:border-navy-700">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">User</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Department</th>
                                        <th className="px-4 py-3 text-right">Assign</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-navy-800">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-slate-100 dark:border-navy-700" />
                                                    <div>
                                                        <p className="font-bold text-navy-900 dark:text-white leading-none">{u.firstName} {u.surname}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{u.department}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Checkbox defaultChecked={u.role === activeRole?.name.toLowerCase()} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-navy-700">
                        <p className="text-xs text-slate-400 italic">Note: Changing a user's role affects their entire system access immediately.</p>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => { toast('success', 'User assignments updated.'); setIsAssignModalOpen(false); }}>Update Assignments</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* --- Delete Confirmation Modal --- */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Role"
                className="max-w-md"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/30">
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-navy-900 dark:text-white">Are you absolutely sure?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            You are about to delete the <span className="font-bold text-rose-600 dark:text-rose-400">"{activeRole?.name}"</span> role.
                            This will leave <span className="font-bold text-navy-900 dark:text-white">{activeRole?.userCount} users</span> without an assigned role.
                        </p>
                    </div>

                    <div className="w-full p-4 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-navy-800 flex gap-3 text-left">
                        <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Deleted roles cannot be recovered. Users currently assigned to this role will lose their special permissions until a new role is assigned.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>No, Keep Role</Button>
                        <Button variant="danger" onClick={confirmDelete}>Yes, Delete Role</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default RoleManagement;