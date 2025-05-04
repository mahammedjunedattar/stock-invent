'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import BarcodeScanner from './Barcodescanner';

export default function AddItemForm({ onSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: 0,
    minStock: 5
  });
  const [showScanner, setShowScanner] = useState(false);

  // Handle barcode scan result
  const handleBarcodeScan = (barcode) => {
    setFormData(prev => ({
      ...prev,
      sku: barcode.toUpperCase()
    }));
    setShowScanner(false);
    toast.success(`Scanned barcode: ${barcode}`);
  };

  // Update individual form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['quantity', 'minStock'].includes(name)
        ? Math.max(0, parseInt(value, 10) || 0)
        : value
    }));
  };

  // Ensure SKU is uppercase and valid on blur
  const handleSkuBlur = () => {
    setFormData(prev => ({
      ...prev,
      sku: prev.sku.toUpperCase().replace(/[^A-Z0-9_]/g, '')
    }));
  };

  // Submit new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add item');

      toast.success('Item added');
      // Reset form fields
      setFormData({ name: '', sku: '', quantity: 0, minStock: 5 });

      // Notify parent or refresh page data
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Add failed');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Item Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter item name"
            required
          />
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            SKU (Stock Keeping Unit)
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            onBlur={handleSkuBlur}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="E.g., ITEM_123"
            pattern="[A-Z0-9_]+"
            title="Uppercase letters, numbers, and underscores only"
            required
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Current Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="1"
            required
          />
        </div>

        {/* Minimum Stock */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Minimum Stock Level
          </label>
          <input
            type="number"
            name="minStock"
            value={formData.minStock}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="1"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Add Item
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Barcode Scanner */}
      <div className="md:col-span-2 mt-4">
        <button
          type="button"
          onClick={() => setShowScanner(!showScanner)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showScanner ? 'Hide Scanner' : 'Scan Barcode'}
        </button>

        {showScanner && (
          <div className="relative mt-4">
            <BarcodeScanner onScan={handleBarcodeScan} />
            <div className="absolute inset-0 border-4 border-blue-400 rounded-lg pointer-events-none" />
          </div>
        )}
      </div>
    </div>
);
}
