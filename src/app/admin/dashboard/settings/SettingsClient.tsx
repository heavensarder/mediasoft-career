'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, UserPlus, Key, Trash2, AlertTriangle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { createAdmin, getAdmins, deleteAdmin, updateAdminCredentials, verifyAdminPassword } from '@/lib/admin-settings-actions';

interface Admin {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

export default function SettingsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);

    // New Admin Form
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [confirmCurrentPasswordForCreate, setConfirmCurrentPasswordForCreate] = useState('');
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    // Change Credentials Form
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPasswords, setShowNewPasswords] = useState(false);
    const [updatingCredentials, setUpdatingCredentials] = useState(false);

    // Delete Confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
    const [deletePassword, setDeletePassword] = useState('');

    // Access Password Gate
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [accessPassword, setAccessPassword] = useState('');
    const [verifyingAccess, setVerifyingAccess] = useState(false);

    useEffect(() => {
        // Only load admins once unlocked
        if (isUnlocked) {
            loadAdmins();
        }
    }, [isUnlocked]);

    const loadAdmins = async () => {
        setLoading(true);
        const result = await getAdmins();
        if (result.success) {
            setAdmins(result.admins || []);
        }
        setLoading(false);
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminName || !newAdminEmail || !newAdminPassword || !confirmCurrentPasswordForCreate) {
            toast.error('Please fill in all fields including your current password');
            return;
        }

        setCreatingAdmin(true);
        const result = await createAdmin(newAdminName, newAdminEmail, newAdminPassword, confirmCurrentPasswordForCreate);

        if (result.success) {
            toast.success('Super Admin created successfully');
            setNewAdminName('');
            setNewAdminEmail('');
            setNewAdminPassword('');
            setConfirmCurrentPasswordForCreate('');
            loadAdmins();
        } else {
            toast.error(result.error || 'Failed to create admin');
        }
        setCreatingAdmin(false);
    };

    const handleDeleteAdmin = async () => {
        if (!adminToDelete) return;

        if (!deletePassword) {
            toast.error('Please enter your current password to confirm deletion');
            return;
        }

        const result = await deleteAdmin(adminToDelete.id, deletePassword);
        if (result.success) {
            toast.success('Admin deleted successfully');
            loadAdmins();
        } else {
            toast.error(result.error || 'Failed to delete admin');
        }
        setDeleteDialogOpen(false);
        setAdminToDelete(null);
        setDeletePassword('');
    };

    const handleUpdateCredentials = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Please enter your current password');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        setUpdatingCredentials(true);
        const result = await updateAdminCredentials(
            currentPassword,
            newEmail || undefined,
            newPassword || undefined
        );

        if (result.success) {
            toast.success('Credentials updated successfully. Please sign out and sign in again.');
            setNewEmail('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast.error(result.error || 'Failed to update credentials');
        }
        setUpdatingCredentials(false);
    };

    const handleAccessVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessPassword) {
            toast.error('Please enter your password');
            return;
        }

        setVerifyingAccess(true);
        const result = await verifyAdminPassword(accessPassword);
        if (result.success) {
            setIsUnlocked(true);
            setAccessPassword('');
            toast.success('Access granted');
        } else {
            toast.error(result.error || 'Verification failed');
        }
        setVerifyingAccess(false);
    };

    // Show access gate if not unlocked
    if (!isUnlocked) {
        return (
            <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12 flex items-center justify-center">
                <Card className="premium-glass-card max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Admin Settings</CardTitle>
                        <CardDescription>
                            Enter your password to access settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-6 border-amber-300 bg-amber-50">
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 text-sm">
                                This area contains sensitive admin controls. Password verification is required.
                            </AlertDescription>
                        </Alert>
                        <form onSubmit={handleAccessVerification} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="accessPassword">Current Password</Label>
                                <Input
                                    id="accessPassword"
                                    type="password"
                                    value={accessPassword}
                                    onChange={(e) => setAccessPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoFocus
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={verifyingAccess} className="w-full">
                                {verifyingAccess ? 'Verifying...' : 'Unlock Settings'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="premium-bg min-h-screen text-slate-800 p-4 sm:p-8 -m-4 sm:-m-6 md:-m-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text drop-shadow-sm">
                    Admin Settings
                </h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">
                    Manage super admins and update access credentials
                </p>
            </div>

            {/* Warning Alert */}
            <Alert variant="destructive" className="mb-8 border-red-300 bg-red-50">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">Important Security Notice</AlertTitle>
                <AlertDescription className="mt-2">
                    <strong>Record your access information in a safe place!</strong> If you forget your login credentials,
                    you will lose access to the admin dashboard. There is no password recovery option.
                    If you are locked out, contact the developer for assistance.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Super Admin Management */}
                <div className="space-y-6">
                    {/* Add New Super Admin */}
                    <Card className="premium-glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-primary" />
                                Add Super Admin
                            </CardTitle>
                            <CardDescription>
                                Create a new super admin account with full access
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminName">Name</Label>
                                    <Input
                                        id="adminName"
                                        value={newAdminName}
                                        onChange={(e) => setNewAdminName(e.target.value)}
                                        placeholder="Admin Name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminEmail">Email</Label>
                                    <Input
                                        id="adminEmail"
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminPassword">Password for New Admin</Label>
                                    <Input
                                        id="adminPassword"
                                        type="password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        minLength={8}
                                        required
                                    />
                                </div>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <Label htmlFor="confirmCurrentPasswordCreate" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Your Current Password <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="confirmCurrentPasswordCreate"
                                        type="password"
                                        value={confirmCurrentPasswordForCreate}
                                        onChange={(e) => setConfirmCurrentPasswordForCreate(e.target.value)}
                                        placeholder="Enter YOUR password to authorize"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">For security, enter your own password to create a new admin.</p>
                                </div>
                                <Button type="submit" disabled={creatingAdmin} className="w-full">
                                    {creatingAdmin ? 'Creating...' : 'Create Super Admin'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Existing Admins */}
                    <Card className="premium-glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Super Admin Accounts
                            </CardTitle>
                            <CardDescription>
                                {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-4 text-muted-foreground">Loading...</div>
                            ) : admins.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">No admins found</div>
                            ) : (
                                <div className="space-y-3">
                                    {admins.map((admin) => (
                                        <div
                                            key={admin.id}
                                            className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/60"
                                        >
                                            <div>
                                                <div className="font-medium text-slate-800">{admin.name}</div>
                                                <div className="text-sm text-slate-500">{admin.email}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    Super Admin
                                                </Badge>
                                                {admins.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            setAdminToDelete(admin);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Change Credentials */}
                <div>
                    <Card className="premium-glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Update Your Credentials
                            </CardTitle>
                            <CardDescription>
                                Change your email address and/or password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Warning */}
                            <Alert className="mb-6 border-amber-300 bg-amber-50">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800">
                                    <strong>Warning:</strong> Make sure to write down your new credentials
                                    before saving. You cannot recover access if you forget them.
                                </AlertDescription>
                            </Alert>

                            <form onSubmit={handleUpdateCredentials} className="space-y-4">
                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Current Password <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowNewPasswords(!showNewPasswords)}
                                        >
                                            {showNewPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Separator className="my-4" />
                                <p className="text-sm text-muted-foreground">Fill in the fields you want to change:</p>

                                <div className="space-y-2">
                                    <Label htmlFor="newEmail" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        New Email Address
                                    </Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter new email (optional)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        New Password
                                    </Label>
                                    <Input
                                        id="newPassword"
                                        type={showNewPasswords ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (optional)"
                                        minLength={8}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showNewPasswords ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        minLength={8}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={updatingCredentials || (!newEmail && !newPassword)}
                                    className="w-full mt-4"
                                >
                                    {updatingCredentials ? 'Updating...' : 'Update Credentials'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Developer Contact */}
                    <Card className="premium-glass-card mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                If you are locked out of your account or need technical assistance,
                                contact the developer at: <strong>enquiry@mediasoftbd.com</strong>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletePassword(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Super Admin</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{adminToDelete?.name}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="deletePassword" className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4" />
                            Your Current Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="deletePassword"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password to confirm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">For security, enter your password to authorize this deletion.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletePassword(''); }}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAdmin} disabled={!deletePassword}>
                            Delete Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
