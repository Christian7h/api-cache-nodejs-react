import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Car } from './types';
import { CarFront, ChevronDown, ChevronUp, Search, Plus, Trash2, RefreshCw } from 'lucide-react';

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Car>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    horsepower: 0,
    price: 0
  });

  
  const fetchCars = async () => {
    try {
      const response = await axios.get('https://nodejs-express-autos-df92ea4e8677.herokuapp.com/api/cars');
      setCars(response.data);
      setLoading(false);
      setError(null);
  
    } catch (err) {
      setError('Failed to fetch cars. Please try again later.');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCars();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); 
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://nodejs-express-autos-df92ea4e8677.herokuapp.com/api/cars', newCar);
      if (response.data) {
        setShowAddForm(false);
        setNewCar({
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          horsepower: 0,
          price: 0
        });
        fetchCars();
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add car. Please try again.');
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        setError(null);
        const response = await axios.delete(`https://nodejs-express-autos-df92ea4e8677.herokuapp.com/api/cars/${id}`);
        
        if (response.status === 200) {
          setCars(prevCars => prevCars.filter(car => car._id !== id)); // Eliminación local
          fetchCars();  // Refrescar los autos desde el backend
  
          // Hacer un "full refresh" de la página
          window.location.reload();
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Failed to delete car. Please try again.';
        setError(errorMessage);
      }
    }
  };
  

  const filteredCars = cars.filter(car =>
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCars = [...filteredCars].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (field: keyof Car) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <CarFront className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Car Catalog</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleRefresh}
              className={`p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              title="Refresh data"
              disabled={isRefreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Car
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Car</h2>
            <form onSubmit={handleAddCar} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={newCar.brand}
                  onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={newCar.model}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horsepower</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newCar.horsepower}
                  onChange={(e) => setNewCar({ ...newCar, horsepower: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newCar.price}
                  onChange={(e) => setNewCar({ ...newCar, price: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Car
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['brand', 'model', 'year', 'horsepower', 'price', 'actions'].map((field) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => field !== 'actions' && handleSort(field as keyof Car)}
                  >
                    <div className="flex items-center gap-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                      {field !== 'actions' && sortField === field && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCars.map((car) => (
                <tr key={car._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {car.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.horsepower} hp
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${car.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteCar(car._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete car"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;