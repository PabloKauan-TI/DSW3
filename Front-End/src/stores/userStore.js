import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

export const useUserStore = defineStore(
  'userStore',
  () => {
    const toast = useToast()
    const apiUrl = 'http://localhost:8000/api/users'

    const users = ref([])
    const selectedUsers = ref([])
    const userDialog = ref(false)
    const deleteUserDialog = ref(false)
    const deleteUsersDialog = ref(false)
    const user = ref({})
    const submitted = ref(false)
    const loading = ref(false)

    const filters = ref({
      global: { value: null, matchMode: 'contains' },
    })

    const fetchUsers = async () => {
      loading.value = true
      try {
        const response = await axios.get(apiUrl)
        users.value = response.data
      } catch (error) {
        showError('Erro ao buscar usuários')
      } finally {
        loading.value = false
      }
    }

    const openNew = () => {
      user.value = {}
      submitted.value = false
      userDialog.value = true
    }

    const hideDialog = () => {
      userDialog.value = false
      submitted.value = false
    }

    const saveUser = async () => {
      submitted.value = true

      if (!user.value.name || !user.value.email || !user.value.telefone) {
        showError('Preencha todos os campos')
        return
      }

      try {
        if (user.value.id) {
          const response = await axios.put(`${apiUrl}/${user.value.id}`, user.value)
          const index = users.value.findIndex((u) => u.id === user.value.id)
          if (index !== -1) {
            users.value[index] = response.data
          }
          showSuccess('Usuário atualizado')
        } else {
          const response = await axios.post(apiUrl, user.value)
          users.value.push(response.data)
          showSuccess('Usuário criado')
        }
        userDialog.value = false
        user.value = {}
      } catch (error) {
        showError(error.response?.data?.message || 'Erro na operação')
      }
    }

    const editUser = (u) => {
      user.value = { ...u }
      userDialog.value = true
    }

    const confirmDeleteUser = (u) => {
      user.value = u
      deleteUserDialog.value = true
    }

    const deleteUser = async () => {
      try {
        await axios.delete(`${apiUrl}/${user.value.id}`)
        users.value = users.value.filter((u) => u.id !== user.value.id)
        deleteUserDialog.value = false
        showSuccess('Usuário removido')
      } catch (error) {
        showError(error.response?.data?.message || 'Erro ao remover usuário')
      }
    }

    const confirmDeleteSelected = () => {
      deleteUsersDialog.value = true
    }

    const deleteSelectedUsers = async () => {
      try {
        await Promise.all(
          selectedUsers.value.map((u) => axios.delete(`${apiUrl}/${u.id}`))
        )
        users.value = users.value.filter(
          (u) => !selectedUsers.value.some((su) => su.id === u.id)
        )
        selectedUsers.value = []
        deleteUsersDialog.value = false
        showSuccess('Usuários removidos')
      } catch (error) {
        showError(error.response?.data?.message || 'Erro ao remover usuários')
      }
    }

    const showSuccess = (message) => {
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: message,
        life: 3000,
      })
    }

    const showError = (message) => {
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: message,
        life: 3000,
      })
    }

    fetchUsers()

    return {
      users,
      selectedUsers,
      userDialog,
      deleteUserDialog,
      deleteUsersDialog,
      user,
      submitted,
      filters,
      loading,

      fetchUsers,
      openNew,
      hideDialog,
      saveUser,
      editUser,
      confirmDeleteUser,
      deleteUser,
      confirmDeleteSelected,
      deleteSelectedUsers,
    }
  }
)
