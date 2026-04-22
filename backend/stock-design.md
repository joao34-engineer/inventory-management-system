# Stock Manager Design Document

This document outlines the **Use Cases** and **Business Rules** for the Stock Manager project. We are starting with an MVP (Minimum Viable Product) and will iterate with more features over time.

---

## 🚀 1. Core Use Cases (MVP)

### 1.1 Product Management
*   **Create Product**: Register a new item in the system with a name, SKU, price, and initial quantity.
*   **List Products**: View a list of all products currently in the system.
*   **Update Product Details**: Change the name, price, or category of an existing product.
*   **Delete Product**: Remove a product from the system.

### 1.2 Inventory Operations
*   **Add Stock**: Increase the quantity of a product (e.g., when a new batch arrives).
*   **Remove Stock**: Decrease the quantity of a product (e.g., when a sale is made).

---

## ⚖️ 2. Business Rules

### 2.1 Inventory Integrity
*   **Rule: No Negative Stock**  
    The quantity of a product can never drop below `0`. Any operation that would result in negative stock must be rejected with an error.
*   **Rule: Unique SKUs**  
    The SKU (Stock Keeping Unit) is a unique identifier. No two products can share the same SKU.

### 2.2 Financial Rules
*   **Rule: Positive Pricing**  
    The price of a product must always be greater than or equal to `0`.
*   **Rule: Integer Pennies**  
    Prices must be stored as integers (cents/pennies) in the database to avoid floating-point rounding errors (e.g., `$10.50` is stored as `1050`).

### 2.3 Identification
*   **Rule: Automated IDs**  
    Internal database IDs must be generated automatically (UUID or NanoID).

---

## 📈 3. Future Roadmap (Iterations)
*   **Categories & Tags**: Group products for better filtering.
*   **Suppliers**: Track which company provides which product.
*   **History Logs**: Audit trail of every stock change (Who did it? When? Why?).
*   **Low Stock Alerts**: Automatically flag products when quantity drops below a threshold (e.g., 5 units).
*   **Multi-User Auth**: Secure the system so only authorized staff can change stock.
