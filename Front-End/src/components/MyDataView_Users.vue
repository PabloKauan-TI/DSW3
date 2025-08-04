<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button
            label="Novo"
            icon="pi pi-plus"
            class="mr-2"
            @click="openNew"
            :disabled="loading"
          />
          <Button
            label="Excluir"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDeleteSelected"
            :disabled="!selectedUsers.length || loading"
          />
        </template>

        <template #end>
          <Button
            label="Exportar"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV"
            :disabled="loading"
          />
          <Button
            label="Recarregar"
            icon="pi pi-refresh"
            severity="secondary"
            class="ml-2"
            @click="fetchUsers"
            :loading="loading"
          />
        </template>
      </Toolbar>

      <DataTable
        ref="dt"
        v-model:selection="selectedUsers"
        :value="users"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        :loading="loading"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Gerenciar Usuários</h4>
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters.global.value" placeholder="Pesquisar..." />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
        <Column field="name" header="Nome" sortable style="min-width: 16rem" />
        <Column field="email" header="E-mail" sortable style="min-width: 20rem" />
        <Column field="telefone" header="Telefone" sortable style="min-width: 14rem" /> <!-- Corrigido aqui -->
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editUser(slotProps.data)"
              :disabled="loading"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteUser(slotProps.data)"
              :disabled="loading"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- User Dialog -->
    <Dialog
      v-model:visible="userDialog"
      :style="{ width: '500px' }"
      header="Cadastro de Usuário"
      :modal="true"
      class="user-form-dialog"
    >
      <div class="form-grid">
        <div class="form-field">
          <label for="name" class="form-label">
            Nome <span class="required-asterisk">*</span>
          </label>
          <InputText
            id="name"
            v-model.trim="user.name"
            placeholder="Ex: João da Silva"
            :class="{ 'p-invalid': submitted && !user.name }"
            class="form-input"
          />
          <small class="error-message" v-if="submitted && !user.name">
            Campo obrigatório
          </small>
        </div>

        <div class="form-field">
          <label for="email" class="form-label">
            E-mail <span class="required-asterisk">*</span>
          </label>
          <InputText
            id="email"
            v-model.trim="user.email"
            placeholder="Ex: joao@email.com"
            :class="{ 'p-invalid': submitted && !user.email }"
            class="form-input"
          />
          <small class="error-message" v-if="submitted && !user.email">
            Campo obrigatório
          </small>
        </div>

        <div class="form-field">
          <label for="telefone" class="form-label">
            Telefone <span class="required-asterisk">*</span>
          </label>
          <InputText
            id="telefone"
            v-model.trim="user.telefone"
            placeholder="Ex: (11) 99999-9999"
            :class="{ 'p-invalid': submitted && !user.telefone }"
            class="form-input"
          />
          <small class="error-message" v-if="submitted && !user.telefone">
            Campo obrigatório
          </small>
        </div>
      </div>

      <template #footer>
        <div class="form-footer">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            @click="hideDialog"
            :disabled="loading"
            class="form-button"
            outlined
          />
          <Button
            label="Salvar"
            icon="pi pi-check"
            @click="saveUser"
            :loading="loading"
            class="form-button"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete User Dialog -->
    <Dialog
      v-model:visible="deleteUserDialog"
      :style="{ width: '450px' }"
      header="Confirmar"
      :modal="true"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span v-if="user">
          Tem certeza que deseja excluir <b>{{ user.name }}</b>?
        </span>
      </div>
      <template #footer>
        <Button
          label="Não"
          icon="pi pi-times"
          text
          @click="deleteUserDialog = false"
          :disabled="loading"
        />
        <Button
          label="Sim"
          icon="pi pi-check"
          @click="deleteUser"
          severity="danger"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Delete Selected Users Dialog -->
    <Dialog
      v-model:visible="deleteUsersDialog"
      :style="{ width: '450px' }"
      header="Confirmar"
      :modal="true"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>Tem certeza que deseja excluir os usuários selecionados?</span>
      </div>
      <template #footer>
        <Button
          label="Não"
          icon="pi pi-times"
          text
          @click="deleteUsersDialog = false"
          :disabled="loading"
        />
        <Button
          label="Sim"
          icon="pi pi-check"
          @click="deleteSelectedUsers"
          severity="danger"
          :loading="loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'

import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toolbar from 'primevue/toolbar'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const dt = ref(null)
const store = useUserStore()

const {
  users,
  userDialog,
  deleteUserDialog,
  deleteUsersDialog,
  selectedUsers,
  user,
  submitted,
  filters,
  loading
} = storeToRefs(store)

const {
  fetchUsers,
  openNew,
  hideDialog,
  saveUser,
  editUser,
  confirmDeleteUser,
  deleteUser,
  confirmDeleteSelected,
  deleteSelectedUsers
} = store

const exportCSV = () => {
  dt.value?.exportCSV()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Mesmo estilo do MyDataView.vue */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--surface-900);
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
}

.required-asterisk {
  color: var(--red-500);
}

.error-message {
  color: var(--red-500);
  font-size: 0.85rem;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.form-button {
  min-width: 100px;
}

.user-form-dialog .p-dialog-content {
  padding: 1.5rem;
}
</style>
