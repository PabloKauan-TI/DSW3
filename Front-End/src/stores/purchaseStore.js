import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// Configurar baseURL global do Axios
axios.defaults.baseURL = 'http://localhost:8000/api'

export const usePurchaseStore = defineStore('purchaseStore', () => {
  const purchases = ref([])
  const users = ref([])
  const products = ref([])

  const purchase = ref({
    user_id: null,
    product_id: null,
    quantity: 1,
    price: 0,
    total: 0,
  })

  const purchaseDialog = ref(false)
  const deletePurchaseDialog = ref(false)
  const selectedPurchase = ref(null)
  const selectedPurchases = ref([])
  const loading = ref(false)
  const filters = ref({})

  const fetchPurchases = async () => {
    try {
      loading.value = true
      const res = await axios.get('/purchases')
      purchases.value = res.data
    } catch (error) {
      console.error('Erro ao buscar compras:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users')
      users.value = res.data
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products')
      products.value = res.data
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }

  const openNew = () => {
    purchase.value = {
      user_id: null,
      product_id: null,
      quantity: 1,
      price: 0,
      total: 0,
    }
    purchaseDialog.value = true
  }

  const editPurchase = (p) => {
    purchase.value = { ...p }
    purchaseDialog.value = true
  }

  const savePurchase = async () => {
    try {
      if (!purchase.value.user_id || !purchase.value.product_id) {
        console.warn('Preencha todos os campos obrigatórios!')
        return
      }

      const product = products.value.find(p => p.id === purchase.value.product_id)
      if (product) {
        purchase.value.price = product.price
        purchase.value.total = purchase.value.quantity * product.price
      }

      if (purchase.value.id) {
        await axios.put(`/purchases/${purchase.value.id}`, purchase.value)
      } else {
        await axios.post('/purchases', purchase.value)
      }

      purchaseDialog.value = false
      await fetchPurchases()
    } catch (error) {
      console.error('Erro ao salvar compra:', error)
    }
  }

  const confirmDeletePurchase = (p) => {
    selectedPurchase.value = p
    deletePurchaseDialog.value = true
  }

  const deletePurchase = async () => {
    try {
      await axios.delete(`/purchases/${selectedPurchase.value.id}`)
      deletePurchaseDialog.value = false
      selectedPurchase.value = null
      await fetchPurchases()
    } catch (error) {
      console.error('Erro ao excluir compra:', error)
    }
  }

  const hideDialog = () => {
    purchaseDialog.value = false
  }

  const hideDeleteDialog = () => {
    deletePurchaseDialog.value = false
  }

  return {
    purchases,
    users,
    products,
    purchase,
    purchaseDialog,
    deletePurchaseDialog,
    selectedPurchase,
    selectedPurchases,
    loading,
    filters,

    fetchPurchases,
    fetchUsers,
    fetchProducts,
    openNew,
    editPurchase,
    savePurchase,
    confirmDeletePurchase,
    deletePurchase,
    hideDialog,
    hideDeleteDialog,
  }
})
