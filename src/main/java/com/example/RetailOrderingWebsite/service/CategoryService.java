package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.model.Category;
import com.example.RetailOrderingWebsite.repository.CategoryRepository;
import com.example.RetailOrderingWebsite.repository.ProductRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    }

    @Transactional
    public Category createCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
        String normalizedName = name.trim();
        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new IllegalArgumentException("Category already exists");
        }
        Category category = new Category(normalizedName);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (productRepository.existsByCategoryId(categoryId)) {
            throw new DataIntegrityViolationException("Category contains products");
        }
        categoryRepository.delete(category);
    }
}

