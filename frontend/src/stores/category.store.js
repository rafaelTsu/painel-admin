import { defineStore } from 'pinia';
import { categoryService } from '../services/category.service';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false
  }),
  actions: {
    async fetchCategories(groupId, params) {
      this.loading = true;
      try {
        const res = await categoryService.list(groupId, params);
        if (res.data) {
             this.categories = res.data;
        } else {
             this.categories = Array.isArray(res) ? res : [];
        }
      } finally {
        this.loading = false;
      }
    },
    async createCategory(groupId, data) {
        await categoryService.create(groupId, data);
        await this.fetchCategories(groupId);
    },
    async updateCategory(groupId, id, data) {
        await categoryService.update(groupId, id, data);
        await this.fetchCategories(groupId);
    },
    async assignVariables(groupId, categoryId, variableIds) {
        await categoryService.assignVariables(groupId, categoryId, variableIds);
        await this.fetchCategories(groupId, { includeVariables: true });
    }
  }
});
