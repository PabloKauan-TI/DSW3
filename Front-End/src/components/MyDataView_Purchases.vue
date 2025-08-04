<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nova Compra" icon="pi pi-plus" @click="store.openNew" />
      </template>
    </Toolbar>

    <DataTable
      :value="store.purchases"
      dataKey="id"
      :loading="store.loading"
      paginator
      :rows="10"
    >
      <Column field="user.name" header="Usuário" />
      <Column field="product.name" header="Produto" />
      <Column field="quantity" header="Quantidade" />
      <Column field="price" header="Preço Unitário" />
      <Column field="total" header="Total" />
      <Column header="Ações" bodyStyle="text-align: center;">
        <template #body="{ data }">
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="store.confirmDeletePurchase(data)" />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog Nova/Editar Compra -->
    <Dialog v-model:visible="store.purchaseDialog" :modal="true" header="Nova Compra" style="width: 450px">
      <div class="p-fluid">
        <div class="field">
          <label>Usuário</label>
          <Dropdown
            v-model="store.purchase.user_id"
            :options="store.users"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecione um usuário"
          />
        </div>

        <div class="field">
          <label>Produto</label>
          <Dropdown
            v-model="store.purchase.product_id"
            :options="store.products"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecione um produto"
          />
        </div>

        <div class="field">
          <label>Quantidade</label>
          <InputNumber v-model="store.purchase.quantity" :min="1" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="store.hideDialog" class="p-button-text" />
        <Button label="Salvar" icon="pi pi-check" @click="store.savePurchase" class="p-button-text" />
      </template>
    </Dialog>

    <!-- Dialog Confirmação Exclusão -->
    <Dialog v-model:visible="store.deletePurchaseDialog" header="Confirmação" :modal="true" style="width: 350px">
      <p>Tem certeza que deseja excluir esta compra?</p>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="store.hideDeleteDialog" class="p-button-text" />
        <Button label="Excluir" icon="pi pi-trash" @click="store.deletePurchase" severity="danger" class="p-button-text" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePurchaseStore } from '@/stores/purchaseStore'

const store = usePurchaseStore()

onMounted(() => {
  store.fetchPurchases()
  store.fetchUsers()
  store.fetchProducts()
})
</script>

<style scoped>
.card {
  padding: 2rem;
}
</style>
