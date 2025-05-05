'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LowStockAlert from '../components/LowStockAlert';
import InventoryTable from '../components/InventoryTable';
import AddItemForm from '../components/AddItemForm';
import { Suspense } from 'react';
import LoadingSkeleton from '../components/Loadingskeleton';
import { redirect } from 'next/navigation';


export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

// When fetching items
const fetchItems = async () => {
  try {
    const res = await fetch('/api/items', {
      credentials: 'include' // Required for cookies
    });
    if (!res.ok) throw new Error('Failed to fetch items');
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  let user = localStorage.getItem('user')
  console.log(user)
  if(!user){
    redirect('/login');
  }
  (async () => {
    setLoading(true);
    const data = await fetchItems();
    console.log(data)
    
    setItems(data ?? []);
    setLoading(false);
  })();
}, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Store Inventory Manager
        </h1>
        
        <LowStockAlert items={items} />
        
        <AddItemForm onSuccess={fetchItems} />
        
        {loading ? (
          <div className="text-center py-8">Loading inventory...</div>

        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
          <InventoryTable items={items} refresh={fetchItems} />
          </Suspense>
    
        )}
      </div>
    </main>
  );
}
