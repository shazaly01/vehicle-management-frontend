import apiClient from './apiClient'

const resource = '/machineries'

export default {
  get(page = 1, search = '', filters = {}) {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search,
        // هذا هو السطر السحري: نقوم بـ "نشر" كل الفلاتر داخل الـ params
        // مثل owner_id و status لكي تصل للسيرفر في الرابط
        ...filters,
      },
    })
  },

  // دالة إضافية مقترحة لتسهيل جلب الآليات المتاحة للعمل فقط (بدون تقسيم صفحات) للقوائم المنسدلة
  getAvailable() {
    return apiClient.get(resource, {
      params: {
        status: 'available',
        paginate: false, // إذا كنت قد برمجت الـ Backend ليتجاهل الصفحات عند تمرير هذا المتغير
      },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
