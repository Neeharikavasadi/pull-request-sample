package com.example.RetailOrderingWebsite.controller;

import com.example.RetailOrderingWebsite.dto.CategoryRequest;
import com.example.RetailOrderingWebsite.dto.MessageResponse;
import com.example.RetailOrderingWebsite.model.Category;
import com.example.RetailOrderingWebsite.service.AuthorizationService;
import com.example.RetailOrderingWebsite.service.CategoryService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final AuthorizationService authorizationService;

    public CategoryController(CategoryService categoryService, AuthorizationService authorizationService) {
        this.categoryService = categoryService;
        this.authorizationService = authorizationService;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody CategoryRequest request) {
        try {
            authorizationService.validateAdminAccess();
            Category category = categoryService.createCategory(request.getName());
            return ResponseEntity.ok(category);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId) {
        try {
            authorizationService.validateAdminAccess();
            categoryService.deleteCategory(categoryId);
            return ResponseEntity.ok(new MessageResponse("Category deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(409).body(new MessageResponse("Cannot delete category while products still belong to it."));
        }
    }
}
