'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function InventoryTable({ items: initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [editingSku, setEditingSku] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    quantity: 0,
    minStock: 5
  });
  // Sort based on the live state
  const sortedItems = [...items].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const handleEditClick = (item) => {
    setEditingSku(item.sku);
    setEditFormData({
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock
    });
  };

  const handleCancelEdit = () => {
    setEditingSku(null);
    setEditFormData({ name: '', quantity: 0, minStock: 5 });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'minStock')
        ? Math.max(0, parseInt(value) || 0)   // ← added missing “)” here :contentReference[oaicite:0]{index=0}
        : value
    }));
  };
  const handleSaveEdit = async (sku) => {
    try {
      const response = await fetch(`/api/items/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) throw new Error('Update failed');

      const updatedItem = await response.json();
      
      setItems(prev => prev.map(item => 
        item.sku === sku ? { ...item, ...updatedItem } : item
      ));

      toast.success('Item updated successfully');
      setEditingSku(null);
    } catch (error) {
      toast.error(error.message);
      setItems(initialItems);
    }
  };
  

  const requestSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    

  const handleDelete = async (sku) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    // Optimistically remove from UI
    setItems((prev) => prev.filter((i) => i.sku !== sku));

    try {
      const res = await fetch(`/api/items/${sku}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');

      toast.success('Item deleted');
      // If you prefer a server-backed refresh instead of optimistic:
      // router.refresh();
    } catch (err) {
      toast.error(err.message);
      // Roll back on error
      setItems(initialItems);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table headers remain the same */}
          <tbody className="divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.sku} className={item.quantity <= item.minStock ? 'bg-red-50' : ''}>
                {/* Name */}
                <td className="px-6 py-4 text-sm">
                  {editingSku === item.sku ? (
                    <input
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    <span className="text-gray-900">{item.name}</span>
                  )}
                </td>

                {/* SKU (non-editable) */}
                <td className="px-6 py-4 text-sm font-mono text-gray-600">
                  {item.sku}
                </td>

                {/* Quantity */}
                <td className="px-6 py-4 text-sm">
                  {editingSku === item.sku ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity}
                      onChange={handleEditChange}
                      className="w-20 p-1 border rounded"
                      min="0"
                    />
                  ) : (
                    <span className={`font-medium ${
                      item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {item.quantity}
                    </span>
                  )}
                </td>

                {/* Minimum Stock */}
                <td className="px-6 py-4 text-sm">
                  {editingSku === item.sku ? (
                    <input
                      type="number"
                      name="minStock"
                      value={editFormData.minStock}
                      onChange={handleEditChange}
                      className="w-20 p-1 border rounded"
                      min="0"
                    />
                  ) : (
                    <span className="text-gray-700">{item.minStock}</span>
                  )}
                </td>

                {/* Last Updated */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(item.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  {editingSku === item.sku ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(item.sku)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.sku)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
