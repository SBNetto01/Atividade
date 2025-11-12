from typing import Optional

from src.core.entities.product import Product
from src.core.exceptions import ProductAlreadyExists, ProductNotFound
from src.core.interfaces.product_repository import ProductRepository
from src.core.interfaces.usecase_interface import UseCase


class UpdateProductUseCase(UseCase):
    """Implementa o caso de uso para atualizar um produto existente."""

    def __init__(self, repository: ProductRepository):
        self._repository = repository

    def execute(
        self,
        product_id: int,
        nome: Optional[str],
        quantidade: Optional[int],
        valor: Optional[float],
    ) -> Product:
        """
        Executa a lógica de atualização.
        1. Busca o produto pelo ID.
        2. Se um novo nome foi fornecido, valida se ele já existe.
        3. Atualiza apenas os campos que não são nulos.
        4. Persiste as mudanças via repositório.
        """
        
        # 1. Buscar o produto existente
        existing_product = self._repository.get_by_id(product_id)

        if not existing_product:
            raise ProductNotFound(
                f"Produto com ID {product_id} não encontrado."
            )

        # 2. Validar o nome (Nossa regra de negócio diferente)
        # Se um novo nome foi passado E é diferente do nome atual...
        if nome is not None and nome != existing_product.nome:
            # ...verificamos se esse novo nome já está em uso por outro produto.
            if self._repository.get_by_name(nome):
                raise ProductAlreadyExists(
                    f"O nome de produto '{nome}' já está em uso."
                )
            existing_product.nome = nome  # Atualiza o nome

        # 3. Atualizar outros campos apenas se eles foram fornecidos
        if quantidade is not None:
            existing_product.quantidade = quantidade
        
        if valor is not None:
            existing_product.valor = valor
        
        # 4. Persistir a mudança
        updated_product = self._repository.update(existing_product)

        return updated_product