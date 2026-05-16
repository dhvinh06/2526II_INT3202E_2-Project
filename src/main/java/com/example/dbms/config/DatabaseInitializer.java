package com.example.dbms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing advanced database features...");

        // 1. INDEX
        try {
            jdbcTemplate.execute("CREATE INDEX idx_product_name ON products(name(255))");
            logger.info("Created index idx_product_name");
        } catch (Exception e) {
            logger.warn("Index idx_product_name might already exist or failed to create: " + e.getMessage());
        }

        // 2. FUNCTION
        try {
            jdbcTemplate.execute("DROP FUNCTION IF EXISTS fn_calculate_discount");
            String createFunctionSql = 
                "CREATE FUNCTION fn_calculate_discount(price INT, discount_percent INT) " +
                "RETURNS INT DETERMINISTIC " +
                "BEGIN " +
                "  RETURN price - (price * discount_percent / 100); " +
                "END";
            jdbcTemplate.execute(createFunctionSql);
            logger.info("Created function fn_calculate_discount");
        } catch (Exception e) {
            logger.warn("Failed to create function: " + e.getMessage());
        }

        // 3. STORED PROCEDURE
        try {
            jdbcTemplate.execute("DROP PROCEDURE IF EXISTS sp_update_product_stock");
            String createProcedureSql = 
                "CREATE PROCEDURE sp_update_product_stock(IN p_product_id INT, IN p_quantity_change INT) " +
                "BEGIN " +
                "  UPDATE products SET stock = stock + p_quantity_change WHERE id = p_product_id; " +
                "END";
            jdbcTemplate.execute(createProcedureSql);
            logger.info("Created stored procedure sp_update_product_stock");
        } catch (Exception e) {
            logger.warn("Failed to create stored procedure: " + e.getMessage());
        }

        // 4. TRIGGER
        try {
            jdbcTemplate.execute("DROP TRIGGER IF EXISTS trg_after_order_item_insert");
            String createTriggerSql = 
                "CREATE TRIGGER trg_after_order_item_insert " +
                "AFTER INSERT ON order_items " +
                "FOR EACH ROW " +
                "BEGIN " +
                "  UPDATE products SET sold = IFNULL(sold, 0) + NEW.quantity WHERE id = NEW.product_id; " +
                "END";
            jdbcTemplate.execute(createTriggerSql);
            logger.info("Created trigger trg_after_order_item_insert");
        } catch (Exception e) {
            logger.warn("Failed to create trigger: " + e.getMessage());
        }

        // 5. MOCK COUPONS
        try {
            jdbcTemplate.execute("INSERT IGNORE INTO coupons (id, discount_percent, active) VALUES ('GIAM10', 10, 1), ('GIAM20', 20, 1)");
            logger.info("Inserted mock coupons GIAM10 and GIAM20");
        } catch (Exception e) {
            logger.warn("Failed to insert mock coupons: " + e.getMessage());
        }

        // 6. ADD SELLER_ID TO PRODUCTS
        try {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN seller_id INT, ADD CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES users(id)");
            logger.info("Added seller_id column to products");
        } catch (Exception e) {
            logger.warn("seller_id column might already exist: " + e.getMessage());
        }

        // 7. POPULATE RANDOM SELLERS FOR EXISTING PRODUCTS
        try {
            jdbcTemplate.execute("UPDATE products SET seller_id = (SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'SELLER' ORDER BY RAND() LIMIT 1) WHERE seller_id IS NULL");
            logger.info("Populated random sellers for existing products");
        } catch (Exception e) {
            logger.warn("Failed to populate random sellers: " + e.getMessage());
        }

        // 8. CLEAR FAKE RATINGS
        try {
            jdbcTemplate.execute("UPDATE products p SET p.rating = 0 WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.product_id = p.id)");
            logger.info("Cleared fake ratings for products with no reviews");
        } catch (Exception e) {
            logger.warn("Failed to clear fake ratings: " + e.getMessage());
        }

        logger.info("Database initialization completed.");
    }
}
