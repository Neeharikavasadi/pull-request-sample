package com.example.RetailOrderingWebsite.config;

import com.example.RetailOrderingWebsite.model.Category;
import com.example.RetailOrderingWebsite.model.Product;
import com.example.RetailOrderingWebsite.repository.CategoryRepository;
import com.example.RetailOrderingWebsite.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(CategoryRepository categoryRepository, ProductRepository productRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                Category pizzas = new Category("Pizzas");
                Category drinks = new Category("Drinks");
                Category breads = new Category("Breads");

                categoryRepository.save(pizzas);
                categoryRepository.save(drinks);
                categoryRepository.save(breads);

                productRepository.save(new Product("Margherita Pizza", "Tomato, mozzarella and basil", BigDecimal.valueOf(250.00), pizzas, "Dominos", "Box", 50));
                productRepository.save(new Product("Pepperoni Pizza", "Spicy pepperoni and cheese", BigDecimal.valueOf(350.00), pizzas, "Pizza Hut", "Box", 40));
                productRepository.save(new Product("Veggie Pizza", "Bell pepper, onion and mushrooms", BigDecimal.valueOf(300.00), pizzas, "Papa Johns", "Box", 30));
                productRepository.save(new Product("Cola", "Classic soda drink", BigDecimal.valueOf(60.00), drinks, "Coca Cola", "Bottle", 100));
                productRepository.save(new Product("Lemonade", "Fresh lemon soda", BigDecimal.valueOf(80.00), drinks, "Sprite", "Can", 80));
                productRepository.save(new Product("Garlic Bread", "Toasted bread with garlic butter", BigDecimal.valueOf(120.00), breads, "Local Bakery", "Bag", 60));
                productRepository.save(new Product("Cheesy Bread", "Bread topped with melted cheese", BigDecimal.valueOf(150.00), breads, "Local Bakery", "Bag", 45));
            }
            
            // Check if Cheese Pizza exists (since it's a newly added item)
            boolean hasCheesePizza = productRepository.findAll().stream().anyMatch(p -> p.getName().equals("Cheese Pizza"));
            if (!hasCheesePizza) {
                Category pizzas = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Pizzas")).findFirst().orElse(null);
                if (pizzas != null) {
                    productRepository.save(new Product("Cheese Pizza", "Delicious melted cheese blend", BigDecimal.valueOf(280.00), pizzas, "Dominos", "Box", 45));
                }
            }
        };
    }
}
