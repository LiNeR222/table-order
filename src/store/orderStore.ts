import { create } from 'zustand';
import { api } from '@/lib/api';
import type { 
  Warehouse, 
  Paybox, 
  Organization, 
  PriceType,
  Contragent,
  OrderItem,
  CreateOrderPayload
} from '@/types';

interface OrderStore {
  // Справочники
  warehouses: Warehouse[];
  payboxes: Paybox[];
  organizations: Organization[];
  priceTypes: PriceType[];
  
  // Состояние загрузки
  isLoadingWarehouses: boolean;
  isLoadingPayboxes: boolean;
  isLoadingOrganizations: boolean;
  isLoadingPriceTypes: boolean;
  isSubmitting: boolean;
  
  // Данные формы
  selectedWarehouse: number | null;
  selectedPaybox: number | null;
  selectedOrganization: number | null;
  selectedPriceType: number | null;
  selectedContragent: Contragent | null;
  items: OrderItem[];
  
  // Экшены для загрузки справочников
  fetchWarehouses: () => Promise<void>;
  fetchPayboxes: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  fetchPriceTypes: () => Promise<void>;
  
  // Экшены для формы
  setSelectedWarehouse: (id: number | null) => void;
  setSelectedPaybox: (id: number | null) => void;
  setSelectedOrganization: (id: number | null) => void;
  setSelectedPriceType: (id: number | null) => void;
  setSelectedContragent: (contragent: Contragent | null) => void;
  addItem: (item: OrderItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: Partial<OrderItem>) => void;
  
  // Отправка заказа
  submitOrder: (status: boolean) => Promise<boolean>;
  
  // Сброс формы
  resetOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // Начальное состояние
  warehouses: [],
  payboxes: [],
  organizations: [],
  priceTypes: [],
  
  isLoadingWarehouses: false,
  isLoadingPayboxes: false,
  isLoadingOrganizations: false,
  isLoadingPriceTypes: false,
  isSubmitting: false,
  
  selectedWarehouse: null,
  selectedPaybox: null,
  selectedOrganization: null,
  selectedPriceType: null,
  selectedContragent: null,
  items: [],
  
  // Загрузка складов
  fetchWarehouses: async () => {
    const { warehouses, isLoadingWarehouses } = get();
    if (warehouses.length > 0 || isLoadingWarehouses) return;
    
    set({ isLoadingWarehouses: true });
    try {
      const data = await api.get<Warehouse>('/warehouses');
      set({ warehouses: data });
    } catch (error) {
      console.error('Ошибка загрузки складов:', error);
    } finally {
      set({ isLoadingWarehouses: false });
    }
  },
  
  // Загрузка касс
  fetchPayboxes: async () => {
    const { payboxes, isLoadingPayboxes } = get();
    if (payboxes.length > 0 || isLoadingPayboxes) return;
    
    set({ isLoadingPayboxes: true });
    try {
      const data = await api.get<Paybox>('/payboxes');
      set({ payboxes: data });
    } catch (error) {
      console.error('Ошибка загрузки касс:', error);
    } finally {
      set({ isLoadingPayboxes: false });
    }
  },
  
  // Загрузка организаций
  fetchOrganizations: async () => {
    const { organizations, isLoadingOrganizations } = get();
    if (organizations.length > 0 || isLoadingOrganizations) return;
    
    set({ isLoadingOrganizations: true });
    try {
      const data = await api.get<Organization>('/organizations');
      set({ organizations: data });
    } catch (error) {
      console.error('Ошибка загрузки организаций:', error);
    } finally {
      set({ isLoadingOrganizations: false });
    }
  },
  
  // Загрузка типов цен
  fetchPriceTypes: async () => {
    const { priceTypes, isLoadingPriceTypes } = get();
    if (priceTypes.length > 0 || isLoadingPriceTypes) return;
    
    set({ isLoadingPriceTypes: true });
    try {
      const data = await api.get<PriceType>('/price_types');
      set({ priceTypes: data });
    } catch (error) {
      console.error('Ошибка загрузки типов цен:', error);
    } finally {
      set({ isLoadingPriceTypes: false });
    }
  },
  
  // Сеттеры для формы
  setSelectedWarehouse: (id) => set({ selectedWarehouse: id }),
  setSelectedPaybox: (id) => set({ selectedPaybox: id }),
  setSelectedOrganization: (id) => set({ selectedOrganization: id }),
  setSelectedPriceType: (id) => set({ selectedPriceType: id }),
  setSelectedContragent: (contragent) => set({ selectedContragent: contragent }),
  
  // Работа с товарами
  addItem: (item) => {
    const { items } = get();
    set({ items: [...items, item] });
  },
  
  removeItem: (index) => {
    const { items } = get();
    set({ items: items.filter((_, i) => i !== index) });
  },
  
  updateItem: (index, updatedFields) => {
    const { items } = get();
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updatedFields };
    set({ items: newItems });
  },
  
  // Отправка заказа
  submitOrder: async (status: boolean) => {
    const { 
      selectedWarehouse, 
      selectedPaybox, 
      selectedOrganization, 
      selectedContragent, 
      items 
    } = get();
    
    // Валидация
    if (!selectedContragent) {
      alert('Выберите клиента');
      return false;
    }
    if (!selectedWarehouse) {
      alert('Выберите склад');
      return false;
    }
    if (!selectedPaybox) {
      alert('Выберите кассу');
      return false;
    }
    if (!selectedOrganization) {
      alert('Выберите организацию');
      return false;
    }
    if (items.length === 0) {
      alert('Добавьте хотя бы один товар');
      return false;
    }
    
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity) - item.discount;
    }, 0);
    
    const payload: CreateOrderPayload[] = [{
      priority: 0,
      dated: Math.floor(Date.now() / 1000),
      operation: "Заказ",
      tax_included: true,
      tax_active: true,
      goods: items.map(item => ({
        ...item,
        sum_discounted: item.discount,
      })),
      settings: {},
      warehouse: selectedWarehouse,
      contragent: selectedContragent.id,
      paybox: selectedPaybox,
      organization: selectedOrganization,
      status: status,
      paid_rubles: total.toFixed(2),
      paid_lt: 0,
    }];
    
    set({ isSubmitting: true });
    
    try {
      const response = await api.post('/docs_sales', payload);
      console.log('Заказ создан:', response);
      return true;
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка при создании заказа');
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },
  
  resetOrder: () => set({
    selectedWarehouse: null,
    selectedPaybox: null,
    selectedOrganization: null,
    selectedPriceType: null,
    selectedContragent: null,
    items: [],
  }),
}));