function iniciarApp() {
    // Selectores
    const selectCategorias = document.querySelector("#categorias")

    if (selectCategorias) {
        selectCategorias.addEventListener("change", obtenerRecetas)
        obtenerCategorias()
    }

    const resultado = document.querySelector("#resultado")
    const modal = new bootstrap.Modal("#modal", {})

    const favoritosDiv = document.querySelector(".favoritos")

    if (favoritosDiv && window.location.pathname.includes("favoritos.html")) {
        mostrarRecetasFavoritas()
    }

    function obtenerRecetasFavoritas() {
        const recetasFavoritas = JSON.parse(localStorage.getItem("recetasFavoritas")) ?? []
        return recetasFavoritas
    }

    // Mostrar la receta en el modal
    function mostrarRecetaModal(receta) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta

        const modalTitle = document.querySelector(".modal .modal-title")
        const modalBody = document.querySelector(".modal .modal-body")
        const modalFooter = document.querySelector(".modal-footer")

        // Limpiar el contenido existente del footer
        limpiarHTML(modalFooter)

        modalTitle.textContent = strMeal

        modalBody.innerHTML = `
            <img class="img-fluid" src='${strMealThumb}' alt='${strMeal}' >
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>`

        const listGroup = document.createElement("ul")
        listGroup.classList.add("list-group")

        // Mostramos ingredientes
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                // console.log(`strIngredient${i} - strMeasure${i} `)
                const ingredientLi = document.createElement("li")
                ingredientLi.classList.add("list-group-item")
                ingredientLi.textContent = `${cantidad} - ${ingrediente}`

                listGroup.appendChild(ingredientLi)
            }
        }

        modalBody.appendChild(listGroup)

        // Botón añadir a favoritos
        const btnFavorito = document.createElement("button")

        btnFavorito.classList.add("btn", "col")

        existeFavorito(idMeal)
            ?btnFavorito.classList.add("btn", "btn-warning", "col")
            :btnFavorito.classList.add("btn", "btn-danger", "col")

        btnFavorito.textContent = existeFavorito(idMeal)
            ? "Eliminar Favorito"
            : "Guardar Favorito"

        btnFavorito.addEventListener("click", function () {
            if (existeFavorito(idMeal)) {
                eliminarFavorito(idMeal)
        
                btnFavorito.textContent = "Guardar Favorito"
                btnFavorito.classList.remove("btn-warning")
                btnFavorito.classList.add("btn-danger")

                mostrarToast("Receta eliminada correctamente")
            } else {
                const recetaFavorita = {
                    id: idMeal,
                    nombre: strMeal,
                    imagen: strMealThumb,
                    instrucciones: strInstructions
                }
        
                almacenarRecetaFavorita(recetaFavorita)
                btnFavorito.textContent = "Eliminar Favorito"
                btnFavorito.classList.remove("btn-danger")
                btnFavorito.classList.add("btn-warning")

                mostrarToast("Receta añadida correctamente")
            }
        })
            
        modalFooter.appendChild(btnFavorito)

        const btnCerrar = document.createElement("button")
        btnCerrar.classList.add("btn", "btn-danger", "col")
        btnCerrar.textContent = "Cerrar"
        // Ocultar el modal al hacer clic en el botón "Cerrar"
        btnCerrar.onclick = function () {
            modal.hide()
        }
        modalFooter.appendChild(btnCerrar)

        modal.show()
    }


    function almacenarRecetaFavorita(recetaFavorita) {
        const recetasFavoritas = JSON.parse(localStorage.getItem('recetasFavoritas')) || []

        recetasFavoritas.push(recetaFavorita)
        localStorage.setItem("recetasFavoritas", JSON.stringify(recetasFavoritas))
        console.log('Receta almacenada como favorita:'  , recetaFavorita)
    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }

    function obtenerCategorias() {
        const url = "https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarCategorias(data.categories))
    }

    function mostrarCategorias(categorias) {
        categorias.forEach(categoria => {
            const option = document.createElement("option")
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory

            selectCategorias.appendChild(option)
        })
    }

    function obtenerRecetas(e) {
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetas(data.meals))
    }

    function mostrarRecetas(recetas = []) {
        limpiarHTML(resultado)

        recetas.forEach((receta) => {
            const { idMeal, strMeal, strMealThumb } = receta
            const contenedorRecetas = document.createElement("div")

            contenedorRecetas.classList.add("col-md-4")

            const recetaCard = document.createElement("div")
            recetaCard.classList.add("card", "mb-4")

            const recetaImagen = document.createElement("img")
            recetaImagen.classList.add("card-img-top")
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.imagen}`
            recetaImagen.src = strMealThumb ?? receta.imagen

            const recetaCardBody = document.createElement("div")
            recetaCardBody.classList.add("card-body")

            const recetaHeading = document.createElement("h3")
            recetaHeading.classList.add("card-title", "mb-3")
            recetaHeading.textContent = strMeal ?? receta.title

            const recetaButton = document.createElement("button")
            recetaButton.classList.add("btn", "btn-danger", "w-100")
            recetaButton.textContent = "Ver Receta"

            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            }

            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            contenedorRecetas.appendChild(recetaCard)

            resultado.appendChild(contenedorRecetas)
        })
    }

    function seleccionarReceta(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetaModal(data.meals[0]))
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritas")) ?? []
        const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id)
        localStorage.setItem("recetasFavoritas", JSON.stringify(nuevosFavoritos))
    }

    function existeFavorito(idMeal) {
        const recetasFavoritas = obtenerRecetasFavoritas()
        return recetasFavoritas.some(receta => receta.id === idMeal)
    }

    // Funcion que muestra el toast
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector("#toast")
        const toastDivBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)
        toastDivBody.textContent = mensaje
        toast.show()
    }

    // Funcion que muestra las recetas favoritas
    function mostrarRecetasFavoritas() {
        const recetasFavoritas = obtenerRecetasFavoritas()
        limpiarHTML(resultado)

        if (recetasFavoritas.length) {
            mostrarRecetas(recetasFavoritas)
            return
        }

        const noFavoritos = document.createElement("p")
        noFavoritos.textContent = "No hay favoritos"
        noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
        favoritosDiv.appendChild(noFavoritos)
    }

}

document.addEventListener("DOMContentLoaded",iniciarApp)
