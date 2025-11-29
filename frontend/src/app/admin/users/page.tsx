'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, Shield, ShieldAlert, Edit } from 'lucide-react';
import styles from './Users.module.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
interface User {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  isProtected: boolean;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'USER'
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handleEdit = (user: User) => {
    setNewUser({
      username: user.username,
      fullName: user.fullName || '',
      password: '', // Password optional on edit
      role: user.role
    });
    setEditingUserId(user.id);
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingUserId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${editingUserId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`;
    
    const method = editingUserId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ username: '', fullName: '', password: '', role: 'USER' });
        setEditingUserId(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={16} /> افزودن کاربر
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>نام کاربری</th>
              <th>نام کامل</th>
              <th>نقش</th>
              <th>تاریخ ایجاد</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullName || '-'}</td>
                <td>
                  <span className={`${styles.badge} ${user.role === 'ADMIN' ? styles.admin : styles.user}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    {user.isProtected ? (
                      <Shield size={18} className="text-gray-400" />
                    ) : (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className="text-xl font-bold mb-4">
              {editingUserId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
            </h2>
            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label>نام کاربری</label>
                <Input 
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>نام کامل</label>
                <Input 
                  value={newUser.fullName}
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>رمز عبور {editingUserId && '(خالی بگذارید تا تغییر نکند)'}</label>
                <Input 
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required={!editingUserId}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label>نقش</label>
                <select 
                  className={styles.select}
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="USER">کاربر</option>
                  <option value="ADMIN">مدیر</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="ghost" onClick={() => {
                  setShowAddModal(false);
                  setEditingUserId(null);
                  setNewUser({ username: '', fullName: '', password: '', role: 'USER' });
                }}>انصراف</Button>
                <Button type="submit">
                  {editingUserId ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
