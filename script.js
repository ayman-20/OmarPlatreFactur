class BillingSystem {
    constructor() {
        this.clients = JSON.parse(localStorage.getItem('clients')) || [];
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.currentInvoiceItems = [];
        this.invoiceCounter = parseInt(localStorage.getItem('invoiceCounter')) || 1;
        
        this.init();
        this.loadSampleData();
    }

    init() {
        this.setupEventListeners();
        this.updateInvoiceNumber();
        this.setCurrentDate();
        this.renderClients();
        this.renderProducts();
        this.updateSelects();
    }

    loadSampleData() {
        // Ajouter des données d'exemple si aucune donnée n'existe
        if (this.clients.length === 0) {
            this.clients = [
                {
                    id: 1,
                    name: "Ahmed Benali",
                    phone: "0661234567",
                    email: "ahmed.benali@email.com",
                    address: "Rue de la Paix, Marrakech"
                },
                {
                    id: 2,
                    name: "Fatima Zahra",
                    phone: "0677891234",
                    email: "fatima.zahra@email.com",
                    address: "Avenue Mohammed V, Marrakech"
                }
            ];
            this.saveClients();
        }

        if (this.products.length === 0) {
            this.products = [
                {
                    id: 1,
                    name: "Plâtre de Paris",
                    price: 25.00,
                    unit: "sac",
                    description: "Sac de plâtre de Paris 25kg"
                },
                {
                    id: 2,
                    name: "Enduit de finition",
                    price: 45.00,
                    unit: "sac",
                    description: "Enduit de finition intérieur 20kg"
                },
                {
                    id: 3,
                    name: "Bande de joint",
                    price: 15.00,
                    unit: "rouleau",
                    description: "Bande de joint pour placo 50m"
                },
                {
                    id: 4,
                    name: "Cornière d'angle",
                    price: 8.50,
                    unit: "pièce",
                    description: "Cornière d'angle métallique 2.5m"
                }
            ];
            this.saveProducts();
        }
    }

    setupEventListeners() {
        // Navigation entre les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Gestion des clients
        document.getElementById('addClientBtn').addEventListener('click', () => {
            document.getElementById('clientForm').classList.remove('hidden');
        });

        document.getElementById('cancelClient').addEventListener('click', () => {
            document.getElementById('clientForm').classList.add('hidden');
            document.getElementById('clientFormElement').reset();
        });

        document.getElementById('clientFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addClient();
        });

        // Gestion des produits
        document.getElementById('addProductBtn').addEventListener('click', () => {
            document.getElementById('productForm').classList.remove('hidden');
        });

        document.getElementById('cancelProduct').addEventListener('click', () => {
            document.getElementById('productForm').classList.add('hidden');
            document.getElementById('productFormElement').reset();
        });

        document.getElementById('productFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Gestion de la facturation
        document.querySelector('.btn-add-product').addEventListener('click', () => {
            this.addProductToInvoice();
        });

        document.getElementById('generateInvoice').addEventListener('click', () => {
            this.generateInvoice();
        });

        document.getElementById('clearInvoice').addEventListener('click', () => {
            this.clearInvoice();
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('invoiceModal').style.display = 'none';
        });

        document.getElementById('printInvoice').addEventListener('click', () => {
            window.print();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('invoiceModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        // Masquer tous les contenus d'onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Désactiver tous les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activer l'onglet sélectionné
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    // Gestion des clients
    addClient() {
        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const email = document.getElementById('clientEmail').value;
        const address = document.getElementById('clientAddress').value;

        const client = {
            id: Date.now(),
            name,
            phone,
            email,
            address
        };

        this.clients.push(client);
        this.saveClients();
        this.renderClients();
        this.updateSelects();

        document.getElementById('clientForm').classList.add('hidden');
        document.getElementById('clientFormElement').reset();

        this.showNotification('Client ajouté avec succès!', 'success');
    }

    deleteClient(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
            this.clients = this.clients.filter(client => client.id !== id);
            this.saveClients();
            this.renderClients();
            this.updateSelects();
            this.showNotification('Client supprimé avec succès!', 'success');
        }
    }

    renderClients() {
        const clientsList = document.getElementById('clientsList');
        clientsList.innerHTML = '';

        if (this.clients.length === 0) {
            clientsList.innerHTML = '<p class="text-center">Aucun client enregistré</p>';
            return;
        }

        this.clients.forEach(client => {
            const clientElement = document.createElement('div');
            clientElement.className = 'list-item';
            clientElement.innerHTML = `
                <div class="item-info">
                    <h4>${client.name}</h4>
                    <p><i class="fas fa-phone"></i> ${client.phone || 'N/A'}</p>
                    <p><i class="fas fa-envelope"></i> ${client.email || 'N/A'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${client.address || 'N/A'}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="billingSystem.deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            clientsList.appendChild(clientElement);
        });
    }

    // Gestion des produits
    addProduct() {
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const unit = document.getElementById('productUnit').value;
        const description = document.getElementById('productDescription').value;

        const product = {
            id: Date.now(),
            name,
            price,
            unit,
            description
        };

        this.products.push(product);
        this.saveProducts();
        this.renderProducts();
        this.updateSelects();

        document.getElementById('productForm').classList.add('hidden');
        document.getElementById('productFormElement').reset();

        this.showNotification('Produit ajouté avec succès!', 'success');
    }

    deleteProduct(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            this.products = this.products.filter(product => product.id !== id);
            this.saveProducts();
            this.renderProducts();
            this.updateSelects();
            this.showNotification('Produit supprimé avec succès!', 'success');
        }
    }

    renderProducts() {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (this.products.length === 0) {
            productsList.innerHTML = '<p class="text-center">Aucun produit enregistré</p>';
            return;
        }

        this.products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'list-item';
            productElement.innerHTML = `
                <div class="item-info">
                    <h4>${product.name}</h4>
                    <p><i class="fas fa-tag"></i> ${product.price.toFixed(2)} MAD / ${product.unit}</p>
                    <p><i class="fas fa-info-circle"></i> ${product.description || 'Aucune description'}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="billingSystem.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            productsList.appendChild(productElement);
        });
    }

    // Gestion de la facturation
    updateSelects() {
        // Mise à jour de la liste des clients
        const clientSelect = document.getElementById('clientSelect');
        clientSelect.innerHTML = '<option value="">Sélectionner un client</option>';
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });

        // Mise à jour de la liste des produits
        const productSelects = document.querySelectorAll('.product-select');
        productSelects.forEach(select => {
            select.innerHTML = '<option value="">Sélectionner un produit</option>';
            this.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${product.price.toFixed(2)} MAD/${product.unit}`;
                select.appendChild(option);
            });
        });
    }

    addProductToInvoice() {
        const productSelect = document.querySelector('.product-select');
        const quantityInput = document.querySelector('.quantity');
        const unitPriceInput = document.querySelector('.unit-price');

        const productId = parseInt(productSelect.value);
        const quantity = parseFloat(quantityInput.value);
        const unitPrice = parseFloat(unitPriceInput.value);

        if (!productId || !quantity || !unitPrice) {
            this.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Produit non trouvé', 'error');
            return;
        }

        const invoiceItem = {
            id: Date.now(),
            productId,
            productName: product.name,
            quantity,
            unitPrice,
            unit: product.unit,
            total: quantity * unitPrice
        };

        this.currentInvoiceItems.push(invoiceItem);
        this.renderInvoiceItems();
        this.calculateTotals();

        // Réinitialiser les champs
        productSelect.value = '';
        quantityInput.value = '';
        unitPriceInput.value = '';
    }

    removeInvoiceItem(id) {
        this.currentInvoiceItems = this.currentInvoiceItems.filter(item => item.id !== id);
        this.renderInvoiceItems();
        this.calculateTotals();
    }

    renderInvoiceItems() {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        this.currentInvoiceItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'invoice-item';
            itemElement.innerHTML = `
                <span>${item.productName}</span>
                <span>${item.quantity} ${item.unit}</span>
                <span>${item.unitPrice.toFixed(2)} MAD</span>
                <span>${item.total.toFixed(2)} MAD</span>
                <button class="btn btn-danger btn-small" onclick="billingSystem.removeInvoiceItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            productsList.appendChild(itemElement);
        });
    }

    calculateTotals() {
        const subtotal = this.currentInvoiceItems.reduce((sum, item) => sum + item.total, 0);
        const tax = 0; // TVA 0%
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} MAD`;
        document.getElementById('tax').textContent = `${tax.toFixed(2)} MAD`;
        document.getElementById('total').textContent = `${total.toFixed(2)} MAD`;
    }

    generateInvoice() {
        const clientId = parseInt(document.getElementById('clientSelect').value);
        const invoiceDate = document.getElementById('invoiceDate').value;

        if (!clientId || !invoiceDate || this.currentInvoiceItems.length === 0) {
            this.showNotification('Veuillez remplir tous les champs et ajouter au moins un produit', 'error');
            return;
        }

        const client = this.clients.find(c => c.id === clientId);
        const subtotal = this.currentInvoiceItems.reduce((sum, item) => sum + item.total, 0);
        const tax = 0;
        const total = subtotal + tax;

        const invoice = {
            id: Date.now(),
            number: this.invoiceCounter,
            clientId,
            client,
            date: invoiceDate,
            items: [...this.currentInvoiceItems],
            subtotal,
            tax,
            total
        };

        this.invoices.push(invoice);
        this.saveInvoices();

        this.showInvoicePreview(invoice);
        this.invoiceCounter++;
        this.updateInvoiceNumber();
        localStorage.setItem('invoiceCounter', this.invoiceCounter.toString());
    }

    showInvoicePreview(invoice) {
        const modal = document.getElementById('invoiceModal');
        const preview = document.getElementById('invoicePreview');

        const itemsHtml = invoice.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.unitPrice.toFixed(2)} MAD</td>
                <td>${item.total.toFixed(2)} MAD</td>
            </tr>
        `).join('');

        preview.innerHTML = `
            <div class="invoice-header">
                <h1>FACTURE</h1>
                <h2>Omar Plâtre</h2>
                <p>Tamansort Zone 7, Marrakech</p>
            </div>
            
            <div class="invoice-details">
                <div>
                    <h3>Facturé à:</h3>
                    <p><strong>${invoice.client.name}</strong></p>
                    <p>${invoice.client.address || ''}</p>
                    <p>${invoice.client.phone || ''}</p>
                    <p>${invoice.client.email || ''}</p>
                </div>
                <div>
                    <p><strong>N° Facture:</strong> ${invoice.number.toString().padStart(4, '0')}</p>
                    <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Unité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="invoice-total">
                <div class="total-line">
                    <span>Sous-total:</span>
                    <span>${invoice.subtotal.toFixed(2)} MAD</span>
                </div>
                <div class="total-line">
                    <span>TVA (0%):</span>
                    <span>${invoice.tax.toFixed(2)} MAD</span>
                </div>
                <div class="total-line final-total">
                    <span>Total à payer:</span>
                    <span>${invoice.total.toFixed(2)} MAD</span>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    clearInvoice() {
        if (confirm('Êtes-vous sûr de vouloir effacer cette facture?')) {
            this.currentInvoiceItems = [];
            this.renderInvoiceItems();
            this.calculateTotals();
            document.getElementById('clientSelect').value = '';
            this.showNotification('Facture effacée', 'success');
        }
    }

    updateInvoiceNumber() {
        document.getElementById('invoiceNumber').value = this.invoiceCounter.toString().padStart(4, '0');
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
    }

    // Utilitaires de sauvegarde
    saveClients() {
        localStorage.setItem('clients', JSON.stringify(this.clients));
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    saveInvoices() {
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
    }

    showNotification(message, type = 'info') {
        // Créer une notification simple
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Ajouter les styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialiser le système
const billingSystem = new BillingSystem();