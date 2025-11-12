const API_URL = 'http://127.0.0.1:5000';


const modal = document.getElementById("editModal");
const closeModalBtn = document.querySelector(".close-modal-btn");
const editForm = document.getElementById("editForm");
const editProductId = document.getElementById("editProductId");
const editProductName = document.getElementById("editProductName");
const editProductQuantity = document.getElementById("editProductQuantity");
const editProductPrice = document.getElementById("editProductPrice");

const openEditModal = (button) => {
  editProductId.value = button.getAttribute('data-id');
  editProductName.value = button.getAttribute('data-nome');
  editProductQuantity.value = button.getAttribute('data-quantidade');
  editProductPrice.value = button.getAttribute('data-valor');
  modal.style.display = "block";
};

const closeEditModal = () => {
  modal.style.display = "none";
};


const clearTable = () => {
  const tableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = "";
}

const getList = async () => {
  let url = `${API_URL}/produtos`;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      clearTable(); 
      data.produtos.forEach(item => 
        insertList(item.id, item.nome, item.quantidade, item.valor)
      );

      addDeleteListeners();
      addEditListeners();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

const postItem = async (inputProduct, inputQuantity, inputPrice) => {
  const formData = new FormData();
  formData.append('nome', inputProduct);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  let url = `${API_URL}/produto`;
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
        console.log("Item adicionado:", data);
        alert("Item adicionado!");
        
        getList();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


const deleteItem = async (itemName, rowToRemove) => {
  console.log("Deletando:", itemName)
  let url = `${API_URL}/produto?nome=${encodeURIComponent(itemName)}`;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => {
        if (response.ok) {
            rowToRemove.remove(); 
            alert("Removido!");
        } else {
            alert("Erro ao remover item.");
        }
        return response.json();
    })
    .then((data) => console.log("Resposta Delete:", data))
    .catch((error) => {
      console.error('Error:', error);
      alert("Erro ao remover item.");
    });
}

const updateItem = async (id, nome, quantidade, valor) => {
    
    const updateData = {};

    if (nome) {
        updateData.nome = nome;
    }

    const parsedQuantity = parseInt(quantidade, 10);
    if (!isNaN(parsedQuantity)) {
        updateData.quantidade = parsedQuantity;
    }

    const parsedValor = parseFloat(valor);
    if (!isNaN(parsedValor)) {
        updateData.valor = parsedValor;
    }
  

    let url = `${API_URL}/produto/${id}`;
    
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData) 
    })
    .then(response => {
        if (!response.ok) {
        
            return response.json().then(err => { throw new Error(err.mesage || 'Erro desconhecido'); });
        }
        return response.json();
    })
    .then(data => {
        console.log("Item atualizado:", data);
        alert("Item atualizado com sucesso!");
        closeEditModal();
        getList(); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Falha ao atualizar o item: ${error.message}`);
    });
}


const insertDeleteButton = (parentCell) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7"); 
  span.className = "close";
  span.appendChild(txt);
  parentCell.appendChild(span);
}

const insertEditButton = (parentCell, id, nome, quantidade, valor) => {
    let btn = document.createElement("button");
    btn.className = "editBtn";
    btn.textContent = "Editar";
    
    btn.setAttribute('data-id', id);
    btn.setAttribute('data-nome', nome);
    btn.setAttribute('data-quantidade', quantidade || ''); 
    btn.setAttribute('data-valor', valor);

    parentCell.appendChild(btn);
}

const addDeleteListeners = () => {
  let closeButtons = document.getElementsByClassName("close");
  for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].onclick = function () {
      let row = this.parentElement.parentElement;
      const nomeItem = row.getElementsByTagName('td')[0].innerHTML;
      if (confirm("Você tem certeza que quer excluir \"" + nomeItem + "\"?")) {
        deleteItem(nomeItem, row); 
      }
    }
  }
}

const addEditListeners = () => {
    let editButtons = document.getElementsByClassName("editBtn");
    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].onclick = function () {
            openEditModal(this); 
        }
    }
}

const insertList = (id, nameProduct, quantity, price) => {
  var tableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
  var row = tableBody.insertRow();

  row.insertCell(0).textContent = nameProduct;
  row.insertCell(1).textContent = quantity;
  row.insertCell(2).textContent = price;
  insertEditButton(row.insertCell(3), id, nameProduct, quantity, price);
  insertDeleteButton(row.insertCell(4));
}

const newItem = () => {
  let inputProduct = document.getElementById("newInput").value;
  let inputQuantity = document.getElementById("newQuantity").value;
  let inputPrice = document.getElementById("newPrice").value;

  if (inputProduct === '') {
    alert("Escreva o nome de um item!");
  } else if (isNaN(parseFloat(inputPrice)) || inputPrice === '') {
    alert("Valor precisa ser um número válido!");
  } else {
    postItem(inputProduct, inputQuantity, inputPrice);
    
    document.getElementById("newInput").value = "";
    document.getElementById("newQuantity").value = "";
    document.getElementById("newPrice").value = "";
  }
}


window.onload = () => {
  getList();
};

closeModalBtn.onclick = closeEditModal;

window.onclick = (event) => {
  if (event.target == modal) {
    closeEditModal();
  }
};

editForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    
    const id = editProductId.value;
    const nome = editProductName.value;
    const quantidade = editProductQuantity.value;
    const valor = editProductPrice.value;


    if (!nome && !quantidade && !valor) {
        alert("Preencha pelo menos um campo para atualizar.");
        return;
    }

    updateItem(id, nome, quantidade, valor);
});