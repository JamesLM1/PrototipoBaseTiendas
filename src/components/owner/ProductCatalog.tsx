import React, { useState } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/finance';

export const ProductCatalog: React.FC = () => {
  const { products, currentBazar, createProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState('Papelería Escolar');
  const [proveedor, setProveedor] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('Unidad');
  const [precioContado, setPrecioContado] = useState(10.0);
  const [precioCredito, setPrecioCredito] = useState(12.0);
  const [modalidadFinDeMes, setModalidadFinDeMes] = useState(true);
  const [modalidadCuotas, setModalidadCuotas] = useState(true);
  const [stockActual, setStockActual] = useState(50);
  const [stockMinimo, setStockMinimo] = useState(10);
  const [formError, setFormError] = useState('');

  const categories = [
    'todos',
    'Papelería Escolar',
    'Útiles de Oficina',
    'Mochilas y Accesorios',
    'Regalos y Arte',
  ];

  const openCreateModal = () => {
    setEditingProduct(null);
    setSku('ART-' + Math.floor(1000 + Math.random() * 9000));
    setNombre('');
    setDescripcion('');
    setMarca('');
    setCategoria('Papelería Escolar');
    setProveedor('');
    setUnidadMedida('Unidad');
    setPrecioContado(10.0);
    setPrecioCredito(11.5);
    setModalidadFinDeMes(true);
    setModalidadCuotas(true);
    setStockActual(50);
    setStockMinimo(10);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setMarca(p.marca);
    setCategoria(p.categoria);
    setProveedor(p.proveedor);
    setUnidadMedida(p.unidadMedida);
    setPrecioContado(p.precioContado);
    setPrecioCredito(p.precioCredito);
    setModalidadFinDeMes(p.modalidadFinDeMes);
    setModalidadCuotas(p.modalidadCuotas);
    setStockActual(p.stockActual);
    setStockMinimo(p.stockMinimo);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !nombre || !marca) {
      setFormError('Por favor complete el SKU, Nombre y Marca del artículo.');
      return;
    }

    if (precioContado <= 0) {
      setFormError('El precio al contado debe ser mayor a cero.');
      return;
    }

    // MANDATORY VALIDATION: precio_credito >= precio_contado
    if (precioCredito < precioContado) {
      setFormError('Regla de validación: El precio al crédito debe ser mayor o igual al precio al contado.');
      return;
    }

    if (!modalidadFinDeMes && !modalidadCuotas) {
      setFormError('Debe habilitar al menos una modalidad crediticia para el producto.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        sku,
        nombre,
        descripcion,
        marca,
        categoria,
        proveedor,
        unidadMedida,
        precioContado: Number(precioContado),
        precioCredito: Number(precioCredito),
        modalidadFinDeMes,
        modalidadCuotas,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
      });
    } else {
      createProduct({
        bazarId: currentBazar.id,
        sku,
        nombre,
        descripcion,
        marca,
        categoria,
        proveedor,
        unidadMedida,
        precioContado: Number(precioContado),
        precioCredito: Number(precioCredito),
        modalidadFinDeMes,
        modalidadCuotas,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products
    .filter((p) => p.bazarId === currentBazar.id)
    .filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'todos' ? true : p.categoria === selectedCategory;

      return matchesSearch && matchesCat;
    });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Catálogo de Artículos y Control de Existencias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diferenciación de precios al contado y crédito, stock físico y modalidades autorizadas
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Producto</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, producto o marca..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Categoría:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Artículo & Marca</th>
                <th className="px-4 py-3">Categoría & Proveedor</th>
                <th className="px-4 py-3 text-right">Precio Contado</th>
                <th className="px-4 py-3 text-right">Precio Crédito</th>
                <th className="px-4 py-3 text-center">Modalidades</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron artículos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isStockLow = p.stockActual <= p.stockMinimo;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-700">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{p.nombre}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Marca: {p.marca} · {p.unidadMedida}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="block font-medium">{p.categoria}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                          {p.proveedor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {formatCurrency(p.precioContado)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">
                        {formatCurrency(p.precioCredito)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.modalidadFinDeMes && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                              Fin Mes
                            </span>
                          )}
                          {p.modalidadCuotas && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700">
                              Cuotas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {isStockLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{p.stockActual} (Bajo)</span>
                          </span>
                        ) : (
                          <span className="font-medium text-slate-800">{p.stockActual}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Editar artículo"
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            title="Eliminar de catálogo"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              {editingProduct ? 'Editar Datos del Artículo' : 'Registrar Nuevo Artículo en Catálogo'}
            </h3>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Código SKU *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marca *</label>
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                    placeholder="Ej. Standford"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Cuaderno Espiral 100 Hojas Rayado A4"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Descripción Detallada</label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Tapa dura plastificada, papel 75g"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Papelería Escolar">Papelería Escolar</option>
                    <option value="Útiles de Oficina">Útiles de Oficina</option>
                    <option value="Mochilas y Accesorios">Mochilas y Accesorios</option>
                    <option value="Regalos y Arte">Regalos y Arte</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unidad de Medida</label>
                  <select
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Docena">Docena</option>
                    <option value="Caja">Caja</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    placeholder="Distribuidora Continental"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Existencias Iniciales (Stock)</label>
                  <input
                    type="number"
                    value={stockActual}
                    onChange={(e) => setStockActual(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                {/* Precios con validación obligatoria precioCredito >= precioContado */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 space-y-2">
                  <span className="font-bold text-slate-900 block">Esquema de Precios (PEN)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Precio al Contado (S/) *
                      </label>
                      <input
                        type="number"
                        value={precioContado}
                        onChange={(e) => setPrecioContado(Number(e.target.value))}
                        step={0.1}
                        min={0.1}
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Precio al Crédito (S/) *
                      </label>
                      <input
                        type="number"
                        value={precioCredito}
                        onChange={(e) => setPrecioCredito(Number(e.target.value))}
                        step={0.1}
                        min={0.1}
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Regla de validación: El precio de venta al crédito debe ser mayor o igual al precio al contado (financiamiento de lista).
                  </p>
                </div>

                {/* Modalidades de pago permitidas */}
                <div className="col-span-2 space-y-1.5 pt-1">
                  <span className="font-semibold text-slate-700 block">
                    Modalidades Crediticias Autorizadas:
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalidadFinDeMes}
                        onChange={(e) => setModalidadFinDeMes(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Permitir Pago a Fin de Mes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalidadCuotas}
                        onChange={(e) => setModalidadCuotas(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Permitir Financiamiento en Cuotas</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Guardar Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
