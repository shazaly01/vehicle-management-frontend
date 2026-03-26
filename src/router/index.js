import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيطات الرئيسية (Layouts) ---
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

// --- استيراد الصفحات الأساسية الثابتة ---
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

// ==========================================
// --- استيراد صفحات الكيانات (Lazy Loading) ---
// ==========================================

// 1. الإدارة والبيانات الأساسية
const UsersList = () => import('@/views/users/UsersList.vue')
const RolesList = () => import('@/views/roles/RolesList.vue')

// 2. الموردين (بديلة للشركات القديمة)
const SuppliersList = () => import('@/views/suppliers/SuppliersList.vue')

// 3. منظومة الآليات
const MachineryOwnersList = () => import('@/views/machinery_owners/MachineryOwnersList.vue')
const MachineriesList = () => import('@/views/machineries/MachineriesList.vue')
const DriversList = () => import('@/views/drivers/DriversList.vue')

// 4. المشاريع والخزائن
const ProjectsList = () => import('@/views/projects/ProjectsList.vue')
const TreasuriesList = () => import('@/views/treasuries/TreasuriesList.vue')

// 5. العمليات الحركية والمالية
const DispatchOrdersList = () => import('@/views/dispatch_orders/DispatchOrdersList.vue')
const FinancialTransactionsList = () =>
  import('@/views/financial_transactions/FinancialTransactionsList.vue')

const MessageCenter = () => import('@/views/messages/MessageCenter.vue')
// ==========================================
// --- استيراد صفحات التقارير ---
// ==========================================
const SuppliersSummaryReport = () => import('@/views/reports/SuppliersSummaryReport.vue')
const SupplierStatementReport = () => import('@/views/reports/SupplierStatementReport.vue')
const MachineryOwnerStatementReport = () =>
  import('@/views/reports/MachineryOwnerStatementReport.vue')
const ProjectsReport = () => import('@/views/reports/ProjectsReport.vue')

// ==========================================
// --- إعداد المسارات (Routes) ---
// ==========================================
const routes = [
  // --- المسارات العامة (لا تتطلب مصادقة) ---
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: '', redirect: '/login' },
    ],
  },

  // --- المسارات المحمية (تتطلب مصادقة) ---
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },

      // --- مسارات إدارة النظام (المستخدمين والصلاحيات) ---
      {
        path: 'users',
        name: 'UsersList',
        component: UsersList,
        meta: { permission: 'user.view' },
      },
      {
        path: 'roles',
        name: 'RolesList',
        component: RolesList,
        meta: { permission: 'role.view' },
      },

      // --- مسارات البيانات الأساسية ---
      {
        path: 'suppliers',
        name: 'SuppliersList',
        component: SuppliersList,
        meta: { permission: 'supplier.view' },
      },
      {
        path: '/supplier/dashboard',
        name: 'SupplierDashboard',
        component: () => import('@/views/suppliers/SupplierDashboard.vue'),
        meta: {
          requiresAuth: true,
          role: 'Supplier', // حماية المسار بحيث لا يدخله إلا المورد
        },
      },
      {
        path: 'drivers',
        name: 'DriversList',
        component: DriversList,
        meta: { permission: 'driver.view' },
      },
      {
        path: 'machinery-owners',
        name: 'MachineryOwnersList',
        component: MachineryOwnersList,
        meta: { permission: 'machinery_owner.view' },
      },
      {
        path: 'machineries',
        name: 'MachineriesList',
        component: MachineriesList,
        meta: { permission: 'machinery.view' },
      },
      {
        path: 'projects',
        name: 'ProjectsList',
        component: ProjectsList,
        meta: { permission: 'project.view' },
      },
      {
        path: 'treasuries',
        name: 'TreasuriesList',
        component: TreasuriesList,
        meta: { permission: 'treasury.view' },
      },

      // --- مسارات العمليات التشغيلية والمالية ---
      {
        path: 'dispatch-orders',
        name: 'DispatchOrdersList',
        component: DispatchOrdersList,
        meta: { permission: 'dispatch_order.view' },
      },
      {
        path: 'financial-transactions',
        name: 'FinancialTransactionsList',
        component: FinancialTransactionsList,
        meta: { permission: 'financial_transaction.view' },
      },

      {
        path: 'messages',
        name: 'MessageCenter',
        component: MessageCenter,
        meta: { permission: 'message.view' },
      },

      // // --- مسارات التقارير ---
      {
        path: 'reports/suppliers-summary',
        name: 'SuppliersSummaryReport',
        component: SuppliersSummaryReport,
        meta: { permission: 'report.view' },
      },
      {
        path: 'reports/supplier-statement',
        name: 'SupplierStatementReport',
        component: SupplierStatementReport,
        meta: { permission: 'report.view' },
      },
      {
        path: 'reports/machinery-owner-statement/:id?', // إضافة :id اختياري
        name: 'MachineryOwnerStatementReport',
        component: MachineryOwnerStatementReport,
        meta: { permission: 'report.my_statement', requiresAuth: true },
      },
      {
        path: 'reports/projects',
        name: 'ProjectsReport',
        component: ProjectsReport,
        meta: { permission: 'report.view' },
      },

      // إعادة توجيه المسار الرئيسي للتطبيق إلى لوحة التحكم
      { path: '', redirect: '/app/dashboard' },
    ],
  },

  // ==========================================
  // --- مسارات الطباعة (خارج الـ AppLayout لكي تطبع ورقة بيضاء نظيفة) ---
  // ==========================================
  // {
  //   path: '/print/supplier-statement/:id',
  //   name: 'PrintSupplierStatement',
  //   component: () => import('@/views/reports/print/SupplierStatementPrint.vue'),
  //   meta: { requiresAuth: true },
  // },
  // {
  //   path: '/print/machinery-owner-statement/:id',
  //   name: 'PrintMachineryOwnerStatement',
  //   component: () => import('@/views/reports/print/MachineryOwnerStatementPrint.vue'),
  //   meta: { requiresAuth: true },
  // },

  {
    path: '/print/dispatch-order/:id',
    name: 'PrintDispatchOrder',
    component: () => import('@/views/dispatch_orders/DispatchOrderPrint.vue'),
    meta: { requiresAuth: true, permission: 'dispatch_order.view' },
  },
  {
    path: '/print/financial-transaction/:id',
    name: 'PrintFinancialTransaction',
    component: () => import('@/views/financial_transactions/FinancialTransactionPrint.vue'),
    meta: { requiresAuth: true, permission: 'financial_transaction.view' },
  },
  // مسار للتعامل مع الصفحات غير الموجودة (404)
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ==========================================
// --- حارس التنقل العام (Global Navigation Guard) ---
// ==========================================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { isAuthenticated, can, user } = authStore // استخراج بيانات المستخدم أيضاً

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      authStore.returnUrl = to.fullPath
      next({ name: 'Login' })
    } else {
      // --- المنطق الجديد للتوجيه التلقائي للمالك ---
      // إذا كان المستخدم يحاول الذهاب للوحة التحكم (Dashboard) وهو "صاحب آلية"
      if (to.name === 'Dashboard' && authStore.hasRole('Machinery Owner')) {
        // نوجهه مباشرة لتقريره الخاص
        // ملاحظة: تأكد أن authStore.user يحتوي على بيانات machinery_owner.id
        const ownerId = user?.machinery_owner?.id

        if (ownerId) {
          return next({
            name: 'MachineryOwnerStatementReport',
            params: { id: ownerId },
          })
        }
      }

      const requiredPermission = to.meta.permission
      if (requiredPermission && !can(requiredPermission)) {
        next({ name: 'Dashboard' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
