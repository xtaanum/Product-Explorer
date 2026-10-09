const API_URL = "https://fakestoreapi.com/products";

const productContainer = document.getElementById("productContainer");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchbutton");
const productFilter = document.getElementById("productFilter");
const priceSort = document.getElementById("pricesort");
const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");

let products = [];
const FAVORITES_STORAGE_KEY = "product-explorer-favorites";

function loadFavorites() {
    try {
        const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (savedFavorites === null) {
            return new Set();
        }

        const favoriteIds = JSON.parse(savedFavorites);
        if (!Array.isArray(favoriteIds) || !favoriteIds.every(Number.isInteger)) {
            throw new Error("Saved favorites have an invalid format.");
        }

        return new Set(favoriteIds);
    } catch (error) {
        console.error("Could not load saved favorites:", error);
        return new Set();
    }
}

const favoriteIds = loadFavorites();

function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
    } catch (error) {
        console.error("Could not save favorites:", error);
    }
}

function displayProducts(items) {
    productContainer.replaceChildren();

    if (items.length === 0) {
        statusMessage.textContent = "No products match your search.";
        return;
    }

    statusMessage.textContent = `Showing ${items.length} product${items.length === 1 ? "" : "s"}.`;

    items.forEach(product => {
        const productCard = document.createElement("article");
        productCard.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.title;

        const content = document.createElement("div");
        content.className = "product-card-content";

        const title = document.createElement("h3");
        title.textContent = product.title;

        const meta = document.createElement("div");
        meta.className = "product-meta";

        const category = document.createElement("span");
        category.textContent = product.category;

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = `$${Number(product.price).toFixed(2)}`;

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = "View Details";
        detailsButton.addEventListener("click", () => showProductDetails(product));

        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "favorite-button";
        favoriteButton.setAttribute("aria-pressed", String(favoriteIds.has(product.id)));
        favoriteButton.textContent = favoriteIds.has(product.id) ? "Remove favorite" : "Add to favorites";
        favoriteButton.addEventListener("click", () => {
            if (favoriteIds.has(product.id)) {
                favoriteIds.delete(product.id);
            } else {
                favoriteIds.add(product.id);
            }

            saveFavorites();
            filterAndDisplayProducts();
        });

        meta.append(category, price);
        content.append(title, meta, favoriteButton, detailsButton);
        productCard.append(image, content);
        productContainer.appendChild(productCard);
    });
}

function showProductDetails(product) {
    productImage.src = product.image;
    productImage.alt = product.title;
    productName.value = product.title;
    productCategory.value = product.category;
    productPrice.value = `$${Number(product.price).toFixed(2)}`;
    productDescription.value = product.description;
}

function filterAndDisplayProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const visibleProducts = products.filter(product => {
        const matchesSearch = `${product.title} ${product.category} ${product.description}`
            .toLowerCase()
            .includes(searchTerm);
        const matchesFilter = productFilter.value !== "favorites" || favoriteIds.has(product.id);

        return matchesSearch && matchesFilter;
    });

    if (priceSort.value === "high") {
        visibleProducts.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (priceSort.value === "low") {
        visibleProducts.sort((a, b) => Number(a.price) - Number(b.price));
    }

    displayProducts(visibleProducts);
}

async function fetchProducts() {
    statusMessage.textContent = "Loading products...";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Product request failed with status ${response.status}.`);
        }

        const result = await response.json();
        if (!Array.isArray(result)) {
            throw new Error("The product API returned an unexpected response.");
        }

        products = result;
        filterAndDisplayProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        statusMessage.textContent = "Products could not be loaded. Please try again later.";
    }
}

searchInput.addEventListener("input", filterAndDisplayProducts);
searchButton.addEventListener("click", filterAndDisplayProducts);
productFilter.addEventListener("change", filterAndDisplayProducts);
priceSort.addEventListener("change", filterAndDisplayProducts);

fetchProducts();
