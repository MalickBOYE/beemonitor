import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsersAndHives();
  }, []);

  const fetchUsersAndHives = async () => {
    // On récupère les profils ET on compte leurs ruches
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        email, 
        is_approved,
        hives (id, name)
      `);
    if (!error) setUsers(data);
  };

  const approveUser = async (userId) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    fetchUsersAndHives();
  };

  const deleteUser = async (userId) => {
    if(confirm("Supprimer cet utilisateur ?")) {
      // Note: Pour supprimer l'auth, il faut passer par une "Edge Function" 
      // ou supprimer manuellement dans le dashboard Supabase
      await supabase.from('profiles').delete().eq('id', userId);
      fetchUsersAndHives();
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>
      <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-700 text-left">
            <th className="p-4">Email</th>
            <th className="p-4">Ruches</th>
            <th className="p-4">Statut</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-slate-700">
              <td className="p-4">{u.email}</td>
              <td className="p-4">
                {u.hives?.map(h => <span key={h.id} className="block text-xs text-amber-500">{h.name}</span>)}
              </td>
              <td className="p-4">
                {u.is_approved ? '✅ Approuvé' : '⏳ En attente'}
              </td>
              <td className="p-4 flex gap-2">
                {!u.is_approved && (
                  <button onClick={() => approveUser(u.id)} className="bg-green-600 px-3 py-1 rounded text-xs">Accepter</button>
                )}
                <button onClick={() => deleteUser(u.id)} className="bg-red-600 px-3 py-1 rounded text-xs">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}