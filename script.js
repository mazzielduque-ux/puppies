const contenedorProductos = document.getElementById("contenedor-productos");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtro-categoria");
const itemsCarrito = document.getElementById("items-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const formulario = document.querySelector(".contacto form");

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carritoPuppies")) || [];

const productosPetShop = [
    {
        id: 1,
        title: "Accesorios para mascotas",
        price: 3500,
        category: "accesorios",
        image: "img/accesorios.jpg"
    },
    {
        id: 2,
        title: "Alimento balanceado",
        price: 5000,
        category: "alimento",
        image: "img/alimento.jpg"
    },
    {
        id: 3,
        title: "Arenero para gatos",
        price: 4500,
        category: "higiene",
        image: "img/arenero.jpg"
    },
    {
        id: 4,
        title: "Kit de baño para mascotas",
        price: 4200,
        category: "higiene",
        image: "img/ba%C3%B1o.jpg"
    },
    {
        id: 5,
        title: "Cama para mascotas",
        price: 8500,
        category: "confort",
        image: "img/cama.jpg"
    },
    {
        id: 6,
        title: "Comedero para mascotas",
        price: 3000,
        category: "accesorios",
        image: "img/comedero.jpg"
    },
    {
        id: 7,
        title: "Juguetes para mascotas",
        price: 2800,
        category: "juguetes",
        image: "img/juguetes.jpg"
    },
    {
        id: 8,
        title: "Rascador para gatos",
        price: 6500,
        category: "juguetes",
        image: "img/rascador.jpg"
    },
    {
        id: 9,
        title: "Transportadora para mascotas",
        price: 9000,
        category: "accesorios",
        image: "img/transportadora.jpg"
    },
    {
        id: 10,
        title: "Toallas para mascotas",
        price: 2500,
        category: "higiene",
        image: "img/toallas.jpg"
    }
];

// Consumo de Fake Store API
async function cargarProductos() {
    try {
        const respuesta = await fetch("https://fakestoreapi.com/products");

        if (!respuesta.ok) {
            throw new Error("La API no respondió correctamente.");
        }

        const productosApi = await respuesta.json();

        productos = productosPetShop.map((producto, indice) => {
            return {
                ...producto,
                id: productosApi[indice].id
            };
        });
    } catch (error) {
        console.log("La API no está disponible. Se muestran productos locales.");
        productos = productosPetShop;
    }

    cargarCategorias();
    mostrarProductos(productos);
}

// Mostrar productos
function mostrarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    listaProductos.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("producto");

        tarjeta.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}">
            <h3>${producto.title}</h3>
            <p><strong>Categoría:</strong> ${producto.category}</p>
            <p><strong>$${producto.price.toFixed(2)}</strong></p>
            <button class="agregar-carrito" data-id="${producto.id}">
                Agregar al carrito
            </button>
        `;

        contenedorProductos.appendChild(tarjeta);
    });
}

// Cargar opciones del filtro
function cargarCategorias() {
    filtroCategoria.innerHTML = `
        <option value="todos">Todas las categorías</option>
    `;

    const categorias = [...new Set(productos.map((producto) => producto.category))];

    categorias.forEach((categoria) => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtroCategoria.appendChild(opcion);
    });
}

// Buscador y filtro
function filtrarProductos() {
    const textoBuscado = buscador.value.toLowerCase();
    const categoriaElegida = filtroCategoria.value;

    const productosFiltrados = productos.filter((producto) => {
        const coincideNombre = producto.title.toLowerCase().includes(textoBuscado);
        const coincideCategoria =
            categoriaElegida === "todos" || producto.category === categoriaElegida;

        return coincideNombre && coincideCategoria;
    });

    mostrarProductos(productosFiltrados);
}

buscador.addEventListener("input", filtrarProductos);
filtroCategoria.addEventListener("change", filtrarProductos);

// Agregar al carrito
contenedorProductos.addEventListener("click", (evento) => {
    if (evento.target.classList.contains("agregar-carrito")) {
        const idProducto = Number(evento.target.dataset.id);
        agregarAlCarrito(idProducto);
    }
});

function agregarAlCarrito(idProducto) {
    const productoElegido = productos.find((producto) => producto.id === idProducto);
    const productoEnCarrito = carrito.find((producto) => producto.id === idProducto);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({
            id: productoElegido.id,
            title: productoElegido.title,
            price: productoElegido.price,
            cantidad: 1
        });
    }

    guardarCarrito();
    mostrarCarrito();
}

// Mostrar carrito
function mostrarCarrito() {
    itemsCarrito.innerHTML = "";

    if (carrito.length === 0) {
        itemsCarrito.innerHTML = `
            <p class="carrito-vacio">Tu carrito está vacío.</p>
        `;

        totalCarrito.textContent = "0.00";
        contadorCarrito.textContent = "0";
        return;
    }

    carrito.forEach((producto) => {
        const item = document.createElement("article");
        item.classList.add("item-carrito");

        item.innerHTML = `
            <div>
                <strong>${producto.title}</strong>
                <p>$${producto.price.toFixed(2)} x ${producto.cantidad}</p>
            </div>

            <div>
                <button class="restar" data-id="${producto.id}">-</button>
                <span>${producto.cantidad}</span>
                <button class="sumar" data-id="${producto.id}">+</button>
                <button class="eliminar" data-id="${producto.id}">Eliminar</button>
            </div>
        `;

        itemsCarrito.appendChild(item);
    });

    actualizarTotal();
}

// Aumentar, disminuir o eliminar
itemsCarrito.addEventListener("click", (evento) => {
    const idProducto = Number(evento.target.dataset.id);

    if (evento.target.classList.contains("sumar")) {
        cambiarCantidad(idProducto, 1);
    }

    if (evento.target.classList.contains("restar")) {
        cambiarCantidad(idProducto, -1);
    }

    if (evento.target.classList.contains("eliminar")) {
        eliminarProducto(idProducto);
    }
});

function cambiarCantidad(idProducto, cambio) {
    const producto = carrito.find((producto) => producto.id === idProducto);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        eliminarProducto(idProducto);
        return;
    }

    guardarCarrito();
    mostrarCarrito();
}

function eliminarProducto(idProducto) {
    carrito = carrito.filter((producto) => producto.id !== idProducto);

    guardarCarrito();
    mostrarCarrito();
}

// Total y contador
function actualizarTotal() {
    const total = carrito.reduce((acumulador, producto) => {
        return acumulador + producto.price * producto.cantidad;
    }, 0);

    const cantidadTotal = carrito.reduce((acumulador, producto) => {
        return acumulador + producto.cantidad;
    }, 0);

    totalCarrito.textContent = total.toFixed(2);
    contadorCarrito.textContent = cantidadTotal;
}

// Guardar carrito
function guardarCarrito() {
    localStorage.setItem("carritoPuppies", JSON.stringify(carrito));
}

// Validación del formulario
if (formulario) {
    formulario.addEventListener("submit", (evento) => {
        const nombre = formulario.nombre.value.trim();
        const email = formulario.email.value.trim();
        const mensaje = formulario.mensaje.value.trim();

        if (nombre === "" || email === "" || mensaje === "") {
            evento.preventDefault();
            alert("Por favor, completá todos los campos.");
            return;
        }

        if (!email.includes("@")) {
            evento.preventDefault();
            alert("Ingresá un correo electrónico válido.");
        }
    });
}

cargarProductos();
mostrarCarrito();
