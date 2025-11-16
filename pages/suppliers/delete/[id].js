import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DeleteSupplierPage() {
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    
    axios.get(`/api/suppliers?id=${id}`)
      .then(response => {
        setSupplierInfo(response.data);
      })
      .catch(error => {
        console.error('Error fetching supplier:', error);
      });
  }, [id]);

  async function deleteSupplier() {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/suppliers?id=${id}`);
      router.push('/suppliers');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(error.response?.data?.error || 'Error al eliminar el proveedor');
    } finally {
      setIsDeleting(false);
    }
  }

  function goBack() {
    router.push('/suppliers');
  }

  if (!supplierInfo) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando proveedor...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Eliminar Proveedor
        </h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800">¡Advertencia!</h3>
              <p className="text-red-700 text-sm mt-1">
                Esta acción no se puede deshacer. El proveedor será eliminado permanentemente.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Información del Proveedor</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {supplierInfo.nombre}
            </div>
            {supplierInfo.persona_contacto && (
              <div>
                <span className="font-medium">Contacto:</span> {supplierInfo.persona_contacto}
              </div>
            )}
            {supplierInfo.correo_electronico && (
              <div>
                <span className="font-medium">Email:</span> {supplierInfo.correo_electronico}
              </div>
            )}
            <div>
              <span className="font-medium">Productos asociados:</span> {supplierInfo._count?.productos || 0}
            </div>
          </div>
        </div>

        {supplierInfo._count?.productos > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="text-sm text-yellow-700">
                <strong>Importante:</strong> Este proveedor tiene {supplierInfo._count.productos} productos asociados. 
                No podrás eliminarlo hasta que transfieras o elimines estos productos.
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={deleteSupplier}
            disabled={isDeleting || supplierInfo._count?.productos > 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Eliminar Proveedor
              </>
            )}
          </button>
          
          <button
            onClick={goBack}
            disabled={isDeleting}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Layout>
  );
}