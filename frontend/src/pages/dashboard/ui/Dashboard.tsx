import { NavBar } from '@widgets/navbar'
import { SideBar } from '@widgets/Sidebar'
import { ProductCard, StockChart, StatCard, mapProductFromApi, type Product } from '@entities/product'
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@shared/api/api.ts'
import { Button, Modal, PlusIcon } from '@shared/ui'
import { CreateProductForm } from '@features/product/create/ui/CreateProductForm.tsx'
import { deleteProduct } from '@features/product/delete'
import './DashBoard.css'


export const DashboardPage = (): React.JSX.Element => {
  const [isExpended, setIsExpended] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchRealData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ data: unknown[] }>('/products')
      if (response.data) {
        const realProducts = response.data
          .map(mapProductFromApi)
          .filter((p): p is Product => p !== null)
        
        setProducts(realProducts)
      }
    } catch (err) {
      console.error('Failed to load real database products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDeleteProduct = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Erro ao excluir produto')
    }
  }, [])

  useEffect(() => {
    fetchRealData()
  }, [fetchRealData])

  return (
    <div className={`dashboard-layout ${isExpended ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <SideBar isExpended={isExpended}
          onToggle={() => setIsExpended(!isExpended)} />

        <div className='main-wrapper'>
          <NavBar />

        <main className='dashboard-content'>
          <header className='dashboard-header'>
            <div className="header-info">
              <h1>Inventory</h1>
              <p>Welcome back to the Stock Manager</p>
            </div>
            <Button 
              className="add-product-btn" 
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusIcon size={20} />}
            >
              Adicionar Produto
            </Button>
          </header>

          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title="Adicionar Novo Produto"
          >
            <CreateProductForm 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchRealData();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </Modal>

          <section className='stats-row'>
            <StatCard 
              label="Produtos Totais" 
              value={products.length} 
            />
            <StatCard 
              label="Em Estoque" 
              value={products.filter(p => p.status === 'in-stock').length} 
            />
            <StatCard 
              label="Estoque Baixo" 
              value={products.filter(p => p.status === 'low-stock').length} 
            />
            <StatCard 
              label="Sem Estoque" 
              value={products.filter(p => p.status === 'out-of-stock').length} 
            />
          </section>

          <section className='products-section'>
            <h2 className='section-title'>Seus Produtos</h2>
            {isLoading ? (
              <div className="loading-state">
                <p>Carregando inventário...</p>
              </div>
            ) : products.length > 0 ? (
              <div className='products-grid'>
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Nenhum produto encontrado no banco de dados.</p>
              </div>
            )}
          </section>

          <section id='stock-chart-section' className='chart-section'>
            <h2 className='section-title'>Performance de Estoque</h2>
            <StockChart products={products} />
          </section>
        </main>
      </div>
    </div>
 
  )

}
