const API_URL = "https://fakestoreapi.com/products";

const productContainer = document.getElementById("productContainer");
const statusMessage = document.getElementById("statusMessage");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchbutton");
const priceSort = document.getElementById("pricesort");
const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");

let products = [];

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

        meta.append(category, price);
        content.append(title, meta, detailsButton);
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
    const visibleProducts = products.filter(product =>
        `${product.title} ${product.category} ${product.description}`
            .toLowerCase()
            .includes(searchTerm)
    );

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
priceSort.addEventListener("change", filterAndDisplayProducts);

fetchProducts();
