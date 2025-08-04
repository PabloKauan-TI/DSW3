<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button 
            label="New" 
            icon="pi pi-plus" 
            class="mr-2" 
            @click="openNew" 
            :disabled="loading"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="confirmDeleteSelected"
            :disabled="!selectedProducts.length || loading"
          />
        </template>

        <template #end>
          <Button 
            label="Export" 
            icon="pi pi-upload" 
            severity="secondary" 
            @click="exportCSV" 
            :disabled="loading"
          />
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            severity="secondary"
            class="ml-2"
            @click="fetchProducts"
            :loading="loading"
          />
        </template>
      </Toolbar>

      <DataTable
        ref="dt"
        v-model:selection="selectedProducts"
        :value="products"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        :loading="loading"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Products</h4>
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters.global.value" placeholder="Search..." />
            </IconField>
          </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
        <Column field="name" header="Name" sortable style="min-width: 16rem" />
        <Column field="price" header="Price" sortable style="min-width: 8rem">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
          </template>
        </Column>
        <Column field="category" header="Category" sortable style="min-width: 10rem" />
        <Column field="quantity" header="Quantity" sortable style="min-width: 10rem" />
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editProduct(slotProps.data)"
              :disabled="loading"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteProduct(slotProps.data)"
              :disabled="loading"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Product Dialog -->
   <Dialog
    v-model:visible="productDialog"
    :style="{ width: '500px' }"
    header="Cadastro de Produto"
    :modal="true"
    class="product-form-dialog"
  >
    <div class="form-grid">
      <!-- Nome do Produto -->
      <div class="form-field">
        <label for="name" class="form-label">
          Nome do Produto <span class="required-asterisk">*</span>
        </label>
        <InputText
          id="name"
          v-model.trim="product.name"
          placeholder="Ex: Smartphone XYZ"
          :class="{ 'p-invalid': submitted && !product.name }"
          class="form-input"
        />
        <small class="error-message" v-if="submitted && !product.name">
          Campo obrigatório
        </small>
      </div>

      <!-- Descrição -->
      <div class="form-field">
        <label for="description" class="form-label">Descrição</label>
        <Textarea
          id="description"
          v-model="product.description"
          rows="3"
          placeholder="Descreva as características do produto..."
          class="form-input"
          autoResize
        />
      </div>

      <!-- Categoria -->
      <div class="form-field">
        <label for="category" class="form-label">
          Categoria <span class="required-asterisk">*</span>
        </label>
        <InputText
          id="category"
          v-model.trim="product.category"
          placeholder="Ex: Smartphone XYZ"
          :class="{ 'p-invalid': submitted && !product.category }"
          class="form-input"
        />
        <small class="error-message" v-if="submitted && !product.category">
          Digite uma categoria
        </small>
      </div>

      <div class="form-row">
        <div class="form-field form-field-half">
          <label for="price" class="form-label">
            Preço <span class="required-asterisk">*</span>
          </label>
          <InputNumber
            id="price"
            v-model="product.price"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            :class="{ 'p-invalid': submitted && !product.price }"
            class="form-input"
          />
          <small class="error-message" v-if="submitted && !product.price">
            Valor inválido
          </small>
        </div>

        <div class="form-field form-field-half">
          <label for="quantity" class="form-label">
            Quantidade <span class="required-asterisk">*</span>
          </label>
          <InputNumber
            id="quantity"
            v-model="product.quantity"
            integeronly
            :class="{ 'p-invalid': submitted && !product.quantity }"
            class="form-input"
          />
          <small class="error-message" v-if="submitted && !product.quantity">
            Quantidade inválida
          </small>
        </div>
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
          @click="saveProduct"
          :loading="loading"
          class="form-button"
        />
      </div>
    </template>
  </Dialog>
    <!-- Delete Product Dialog -->
    <Dialog
      v-model:visible="deleteProductDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span v-if="product">
          Are you sure you want to delete <b>{{ product.name }}</b>?
        </span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteProductDialog = false"
          :disabled="loading"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="deleteProduct"
          severity="danger"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Delete Selected Products Dialog -->
    <Dialog
      v-model:visible="deleteProductsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteProductsDialog = false"
          :disabled="loading"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          @click="deleteSelectedProducts"
          severity="danger"
          :loading="loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { storeToRefs } from 'pinia'

// Componentes do PrimeVue
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Toolbar from 'primevue/toolbar'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const dt = ref(null)
const store = useProductStore()

// Estados do store
const {
  products,
  productDialog,
  deleteProductDialog,
  deleteProductsDialog,
  selectedProducts,
  product,
  submitted,
  filters,
  loading,
  statuses
} = storeToRefs(store)

// Métodos do store
const {
  formatCurrency,
  fetchProducts,
  openNew,
  hideDialog,
  saveProduct,
  editProduct,
  confirmDeleteProduct,
  deleteProduct,
  confirmDeleteSelected,
  deleteSelectedProducts
} = store

const exportCSV = () => {
  dt.value?.exportCSV()
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
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

.form-row {
  display: flex;
  gap: 1rem;
}

.form-field-half {
  flex: 1;
}

.form-label {
  font-weight: 600;
  color: var(--surface-900);
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
}

.form-upload {
  width: 100%;
}

.required-asterisk {
  color: var(--red-500);
}

.error-message {
  color: var(--red-500);
  font-size: 0.85rem;
}

.upload-hint {
  color: var(--text-color-secondary);
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

.product-form-dialog .p-dialog-content {
  padding: 1.5rem;
}
</style>