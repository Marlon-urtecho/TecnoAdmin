import Layout from "@/components/Layout";
import SupplierForm from "@/components/SupplierForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditSupplierPage() {
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    axios.get(`/api/suppliers?id=${id}`)
      .then(response => {
        setSupplierInfo(response.data);
      })
      .catch(error => {
        console.error('Error fetching supplier:', error);
        alert('Error al cargar el proveedor');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando proveedor...</span>
        </div>
      </Layout>
    );
  }

  if (!supplierInfo) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Proveedor No Encontrado</h1>
            <p className="text-gray-600 mb-6">
              El proveedor que intentas editar no existe o no se pudo cargar.
            </p>
            <button
              onClick={() => router.push('/suppliers')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Volver a Proveedores
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SupplierForm {...supplierInfo} />
    </Layout>
  );
}