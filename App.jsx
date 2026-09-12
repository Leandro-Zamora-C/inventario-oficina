import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Package, CheckCircle, AlertTriangle } from 'lucide-react';

const AIRTABLE_API_KEY = 'patnJwrOEJcK7DrQv.23e4e2a2983a718d19acc1f972074e307111767fd936b9e40d7ab78dc1227bcf';
const AIRTABLE_BASE_ID = 'appwTybfpd4lPV26K';
const TABLE_NAME = 'Productos';

export default function InventoryApp() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    SKU: '',
    Categoria: '',
    PersonalAsignado: '',
    Producto: '',
    Cantidad: '',
    EstadoStock: 'Stock Adecuado',
    Observaciones: ''
  });

  const fetchRecords = async () => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      });
      const data = await response.json();
      if (data.records) {
        const formatted = data.records.map(record => ({
          id: record.id,
          ...record.fields
        }));
        setProductos(formatted);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            ...formData,
            Cantidad: Number(formData.Cantidad)
          }
        })
      });
      if (response.ok) {
        setFormData({ SKU: '', Categoria: '', PersonalAsignado: '', Producto: '', Cantidad: '', EstadoStock: 'Stock Adecuado', Observaciones: '' });
        fetchRecords();
      }
    } catch (error) {
      console.error('Error al crear registro:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      });
      fetchRecords();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleUpdateField = async (id, fieldName, value) => {
    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: { [fieldName]: fieldName === 'Cantidad' ? Number(value) : value }
        })
      });
      fetchRecords();
    } catch (error) {
      console.error('Error al actualizar campo:', error);
    }
  };

  const totalVariedad = productos.length;
  const totalUnidades = productos.reduce((acc, curr) => acc + (Number(curr.Cantidad) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Control de Inventario de Oficina</h1>
            <p className="text-sm text-slate-500">Sistema en la nube sincronizado con Airtable</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-center">
              <span className="block text-xs text-indigo-500 font-semibold uppercase">Variedad</span>
              <span className="text-xl font-bold text-indigo-700">{totalVariedad}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center">
              <span className="block text-xs text-emerald-500 font-semibold uppercase">Total Unidades</span>
              <span className="text-xl font-bold text-emerald-700">{totalUnidades}</span>
            </div>
          </div>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" /> Registrar Nuevo Elemento
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input 
              type="text" placeholder="Código SKU (ej. PROD-014)" 
              value={formData.SKU} onChange={e => setFormData({...formData, SKU: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required
            />
            <input 
              type="text" placeholder="Categoría" 
              value={formData.Categoria} onChange={e => setFormData({...formData, Categoria: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required
            />
            <input 
              type="text" placeholder="Producto" 
              value={formData.Producto} onChange={e => setFormData({...formData, Producto: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required
            />
            <input 
              type="number" placeholder="Cantidad" 
              value={formData.Cantidad} onChange={e => setFormData({...formData, Cantidad: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required
            />
            <input 
              type="text" placeholder="Personal Asignado (Nombres)" 
              value={formData.PersonalAsignado} onChange={e => setFormData({...formData, PersonalAsignado: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select 
              value={formData.EstadoStock} onChange={e => setFormData({...formData, EstadoStock: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Stock Adecuado">Stock Adecuado</option>
              <option value="Stock Bajo">Stock Bajo</option>
            </select>
            <input 
              type="text" placeholder="Observaciones" 
              value={formData.Observaciones} onChange={e => setFormData({...formData, Observaciones: e.target.value})}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:col-span-2"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl transition duration-200 sm:col-span-2 lg:col-span-4 flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Guardar en el Inventario
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Inventario General y Asignaciones
            </h2>
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Haz clic en cualquier celda para editar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Categoría</th>
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Cantidad</th>
                  <th className="p-4 font-semibold">Personal Asignado</th>
                  <th className="p-4 font-semibold">Estado Stock</th>
                  <th className="p-4 font-semibold">Observaciones</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan="8" className="p-6 text-center text-slate-400">Cargando datos desde Airtable...</td></tr>
                ) : productos.length === 0 ? (
                  <tr><td colSpan="8" className="p-6 text-center text-slate-400">No hay productos registrados.</td></tr>
                ) : (
                  productos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-medium text-slate-700">
                        <input 
                          type="text" defaultValue={item.SKU || ''} 
                          onBlur={(e) => handleUpdateField(item.id, 'SKU', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-4 text-slate-600">
                        <input 
                          type="text" defaultValue={item.Categoria || ''} 
                          onBlur={(e) => handleUpdateField(item.id, 'Categoria', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-4 text-slate-800 font-medium">
                        <input 
                          type="text" defaultValue={item.Producto || ''} 
                          onBlur={(e) => handleUpdateField(item.id, 'Producto', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-4 text-slate-600">
                        <input 
                          type="number" defaultValue={item.Cantidad || 0} 
                          onBlur={(e) => handleUpdateField(item.id, 'Cantidad', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-16"
                        />
                      </td>
                      <td className="p-4 text-slate-600">
                        <input 
                          type="text" defaultValue={item.PersonalAsignado || ''} 
                          onBlur={(e) => handleUpdateField(item.id, 'PersonalAsignado', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full text-indigo-600 font-medium"
                        />
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          item.EstadoStock === 'Stock Bajo' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.EstadoStock === 'Stock Bajo' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {item.EstadoStock}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        <input 
                          type="text" defaultValue={item.Observaciones || ''} 
                          onBlur={(e) => handleUpdateField(item.id, 'Observaciones', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Eliminar elemento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}