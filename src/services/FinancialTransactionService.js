import apiClient from './apiClient'

const resource = '/financial_transactions'

export default {
  get(page = 1, search = '', filters = {}) {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search,
        ...filters,
      },
    })
  },

  find(id) {
    // رقم المعاملة (transaction_no) 18 رقم
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
