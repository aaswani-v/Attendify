import { useEffect, useState } from 'react';
import { userService, type UserRecord } from '../services/userService';
import type { UserRole } from '../types/auth.types';
import './ManageUsersPage.css';

const defaultNewUser = { username: '', password: '', role: 'STUDENT' as UserRole, email: '', full_name: '' };

const ManageUsersPage = () => {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({ ...defaultNewUser });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.list();
            setUsers(data);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            setError('Username and password are required');
            return;
        }
        try {
            setCreating(true);
            setError(null);
            const created = await userService.create({
                username: newUser.username.trim(),
                password: newUser.password,
                role: newUser.role,
                email: newUser.email || undefined,
                full_name: newUser.full_name || undefined,
                is_active: true,
            });
            setUsers(prev => [...prev, created]);
            setNewUser({ ...defaultNewUser });
        } catch (err: any) {
            setError(err?.response?.data?.detail || err?.message || 'Create failed');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this user?')) return;
        try {
            await userService.remove(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Delete failed');
        }
    };

    return (
        <div className="manage-users-page">
            <div className="mup-header">
                <div>
                    <h1>Manage Users</h1>
                    <p>Admin only: Add or remove users.</p>
                </div>
            </div>

            <div className="mup-grid">
                <section className="mup-card">
                    <h3>Current Users</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <div className="mup-table-wrapper">
                            <table className="mup-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Active</th>
                                        <th>Created</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.username}</td>
                                            <td><span className="role-pill">{user.role}</span></td>
                                            <td>{user.email || '-'}</td>
                                            <td>{user.is_active ? 'Yes' : 'No'}</td>
                                            <td>{new Date(user.created_at).toLocaleString()}</td>
                                            <td>
                                                <button className="btn-danger" onClick={() => handleDelete(user.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {error && <div className="mup-error">{error}</div>}
                </section>

                <section className="mup-card">
                    <h3>Create User</h3>
                    <form className="mup-form" onSubmit={handleCreate}>
                        <div className="form-row">
                            <label>Username</label>
                            <input
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Password</label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Role</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                            >
                                <option value="ADMIN">ADMIN</option>
                                <option value="FACULTY">FACULTY</option>
                                <option value="STUDENT">STUDENT</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Email</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Full Name</label>
                            <input
                                value={newUser.full_name}
                                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                        </div>
                        <button className="btn-primary" type="submit" disabled={creating}>
                            {creating ? 'Creating...' : 'Create User'}
                        </button>
                        {error && <div className="mup-error">{error}</div>}
                    </form>
                </section>
            </div>
        </div>
    );
};

export default ManageUsersPage;
