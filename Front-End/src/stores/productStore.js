import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

export const useProductStore = defineStore(
  'productStore',
  () => {
    const toast = useToast()
    const apiUrl = 'http://localhost:8000/api/products' // Ajuste para sua URL

    // Estados reativos
    const products = ref([])
    const selectedProducts = ref([])
    const productDialog = ref(false)
    const deleteProductDialog = ref(false)
    const deleteProductsDialog = ref(false)
    const product = ref({})
    const submitted = ref(false)
    const loading = ref(false)

    const filters = ref({
      global: { value: null, matchMode: 'contains' },
    })

    const statuses = ref([
      { label: 'INSTOCK', value: 'INSTOCK' },
      { label: 'LOWSTOCK', value: 'LOWSTOCK' },
      { label: 'OUTOFSTOCK', value: 'OUTOFSTOCK' },
    ])

    // Métodos
    const formatCurrency = (value) => {
      return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || ''
    }

    // Operações CRUD
    const fetchProducts = async () => {
      loading.value = true
      try {
        const response = await axios.get(apiUrl)
        products.value = response.data
      } catch (error) {
        showError('Failed to fetch products')
      } finally {
        loading.value = false
      }
    }

    const openNew = () => {
      product.value = {}
      submitted.value = false
      productDialog.value = true
    }

    const hideDialog = () => {
      productDialog.value = false
      submitted.value = false
    }

    const saveProduct = async () => {
      submitted.value = true
      
      if (!product.value.name?.trim()) {
        showError('Name is required')
        return
      }

      try {
        if (product.value.id) {
          // Atualizar
          const response = await axios.put(`${apiUrl}/${product.value.id}`, product.value)
          const index = products.value.findIndex(p => p.id === product.value.id)
          if (index !== -1) {
            products.value[index] = response.data
          }
          showSuccess('Product updated')
        } else {
          // Criar
          const response = await axios.post(apiUrl, product.value)
          products.value.push(response.data)
          showSuccess('Product created')
        }
        productDialog.value = false
      } catch (error) {
        showError(error.response?.data?.message || 'Operation failed')
      }
    }

    const editProduct = (prod) => {
      product.value = { ...prod }
      productDialog.value = true
    }

    const confirmDeleteProduct = (prod) => {
      product.value = prod
      deleteProductDialog.value = true
    }

    const deleteProduct = async () => {
      try {
        await axios.delete(`${apiUrl}/${product.value.id}`)
        products.value = products.value.filter(p => p.id !== product.value.id)
        deleteProductDialog.value = false
        showSuccess('Product deleted')
      } catch (error) {
        showError(error.response?.data?.message || 'Delete failed')
      }
    }

    const confirmDeleteSelected = () => {
      deleteProductsDialog.value = true
    }

    const deleteSelectedProducts = async () => {
      try {
        await Promise.all(
          selectedProducts.value.map(p => 
            axios.delete(`${apiUrl}/${p.id}`)
          )
        )
        products.value = products.value.filter(
          p => !selectedProducts.value.some(sp => sp.id === p.id)
        )
        selectedProducts.value = []
        deleteProductsDialog.value = false
        showSuccess('Products deleted')
      } catch (error) {
        showError(error.response?.data?.message || 'Delete failed')
      }
    }

    // Helpers
    const showSuccess = (message) => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 3000,
      })
    }

    const showError = (message) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000,
      })
    }

    // Carrega dados iniciais
    fetchProducts()

    return {
      products,
      selectedProducts,
      productDialog,
      deleteProductDialog,
      deleteProductsDialog,
      product,
      submitted,
      filters,
      statuses,
      loading,

      formatCurrency,
      fetchProducts,
      openNew,
      hideDialog,
      saveProduct,
      editProduct,
      confirmDeleteProduct,
      deleteProduct,
      confirmDeleteSelected,
      deleteSelectedProducts,
    }
  }
)