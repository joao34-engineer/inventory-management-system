import React, { useState, useEffect } from 'react';
import { Input, Button } from '@shared/ui';
import { getCategories } from '@entities/category/api/getCategories.ts';
import { createProduct } from '../api/createProduct.ts';
import { createCategory } from '@features/category/create';
import type { Category } from '@entities/category/model/types.ts';
import './CreateProductForm.css';

interface CreateProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_CATEGORIES_TO_SHOW = 5;

export const CreateProductForm: React.FC<CreateProductFormProps> = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err: unknown) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const priceInCents = Math.round(parseFloat(price.replace(',', '.')) * 100);
      const quantityNum = parseInt(quantity, 10);

      if (isNaN(priceInCents) || priceInCents <= 0) {
        throw new Error('Preço inválido');
      }

      if (!categoryName.trim()) {
        throw new Error('Categoria é obrigatória');
      }

      // Check if category exists
      let categoryId: string;
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
      );

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const newCategory = await createCategory({ name: categoryName.trim() });
        setCategories(prev => [...prev, newCategory]);
        categoryId = newCategory.id;
      }

      await createProduct({
        name,
        sku,
        price: priceInCents,
        quantity: quantityNum,
        categoryId,
        description,
        status: 'active'
      });

      onSuccess();
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Erro ao criar produto');
        } else {
          setError('Erro ao criar produto');
        }
      } finally {
          setLoading(false);
        }
  };

  const getCategoryHint = () => {
    if (categories.length === 0) return null;
    
    const displayCategories = categories.slice(0, MAX_CATEGORIES_TO_SHOW);
    const remaining = categories.length - MAX_CATEGORIES_TO_SHOW;
    
    const categoryNames = displayCategories.map(c => c.name).join(', ');
    
    if (remaining > 0) {
      return `Categorias existentes: ${categoryNames} e mais ${remaining}...`;
    }
    
    return `Categorias existentes: ${categoryNames}`;
  };

  return (
    <form className="create-product-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Input
          label="Nome do Produto"
          placeholder="Ex: Motor Trifásico"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="SKU / Código"
          placeholder="Ex: MOT-123"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <Input
          label="Preço (R$)"
          placeholder="0,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label="Estoque Inicial"
          type="number"
          placeholder="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="category-input-wrapper">
        <Input
          label="Categoria"
          placeholder="Digite a categoria (ex: Motores, Ferramentas)"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          list="categories-list"
        />
        <datalist id="categories-list">
          {categories.map(cat => (
            <option key={cat.id} value={cat.name} />
          ))}
        </datalist>
        {categories.length > 0 && (
          <p className="category-hint">
            {getCategoryHint()}
          </p>
        )}
      </div>

      <Input
        label="Descrição"
        placeholder="Detalhes técnicos do produto..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <p className="form-error-msg">{error}</p>}

      <div className="form-actions">
        <Button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
};
