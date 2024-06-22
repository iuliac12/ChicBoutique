window.addEventListener("load", function() {

    /* paginare */
    const ITEMS_PER_PAGE = 8;
    let currentPage = 1;
    let filteredProduse = [];


    ///referinta la modal
    var modal = document.getElementById("productModal");

    ///referinta la elemenentul <span> care inchide modalul
    var span = document.getElementsByClassName("close")[0];

    var products = document.querySelectorAll('.produs');

    ///parcurge containerele pentru produse
    products.forEach(function(product) {
        product.addEventListener('click', function() {
            ///extrage id-ul produsului curent
            var productId = this.id;
            var productDetails = this.innerHTML;

            ///adauga detaliile
            document.getElementById('modalDetails').innerHTML = productDetails;
            modal.style.display = "block";
        });
    });

    // click pe <span> (x)
    span.onclick = function() {
        modal.style.display = "none";
    }

    /// click in afara modalului
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }



    function applyFilters() {
        if (!validateInputs()) {
            return;
        }

        filteredProduse = [];
        var inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        var inpMarime;

        var vRadio = document.getElementsByName("gr_rad");
        for (let r of vRadio) {
            if (r.checked) {
                inpMarime = r.value;
                break;
            }
        }

        let minMarime = 0, maxMarime = Infinity;
        if (inpMarime != "All") {
            var aux = inpMarime.split(":");
            minMarime = parseInt(aux[0]);
            maxMarime = parseInt(aux[1]);
        }

        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim();
        var inpColor = document.getElementById("color-choice").value.toLowerCase().trim();

        var availableCheckbox = document.getElementById("available");
        var unavailableCheckbox = document.getElementById("unavailable");

        var inpStock = "";
        if (availableCheckbox.checked) inpStock = "available";
        else if (unavailableCheckbox.checked) inpStock = "unavailable";

        var selectElement = document.getElementById("inp-categorie2");
        var selectedOptions = [];
        for (var i = 0; i < selectElement.selectedOptions.length; i++) {
            selectedOptions.push(selectElement.selectedOptions[i].value.toLowerCase().trim());
        }

        var inpText = document.getElementById("i_textarea").value.trim().toLowerCase();
    
        var produse = document.getElementsByClassName("produs");
        let anyVisible = false;

        for (let produs of produse) 
        {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase(); 
            let cond1 = inpNume ? valNume.startsWith(inpNume) : true;

            let marimiText = produs.getElementsByClassName("val-marime")[1].innerHTML.trim();
            ///console.log("Marime[0]", produs.getElementsByClassName("val-marime")[0].innerHTML.trim()); => "Marimi:"
           /// console.log("Marime[1]", produs.getElementsByClassName("val-marime")[1].innerHTML.trim()); => "30,32,..."

            let marimi = marimiText.split(',').map(m => parseInt(m.trim())); 
            let cond2 = (inpMarime == "all" || marimi.some(m => m >= minMarime && m <= maxMarime)); 

            let valPret = parseInt(produs.getElementsByClassName("val-pret")[1].innerHTML);                
            let cond3 = (valPret >= inpPret);

            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trim();
            let cond4 = inpCateg ? (inpCateg == valCategorie || inpCateg == "all") : true;

            let valCuloare = produs.getElementsByClassName("val-culoare")[1].innerHTML.toLowerCase().trim();
            console.log("Culori: ", valCuloare);
            let cond5 = inpColor ? (valCuloare.startsWith(inpColor)) : true;

            let valStock = produs.getElementsByClassName("val-in_stoc")[1].innerHTML.toLowerCase().trim();
            let conditie6 = (inpStock == 'available' && valStock == 'true') || (inpStock == 'unavailable' && valStock == 'false');
            let cond6 = inpStock ? conditie6 : true;

            let materialeText = produs.getElementsByClassName("val-materiale")[1].innerHTML.trim();
            let materiale = materialeText.split(',').map(m => m.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")); ///fara diacritice
            let normalizedSelectedOptions  = selectedOptions.map(option => option.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            let ok = true;
            if (materiale.some(m => normalizedSelectedOptions.includes(m))) ok = false;
            let cond7 = selectedOptions ? ok : true;

            let valDescriere = produs.getElementsByClassName("val-descriere")[1].innerHTML.trim().toLowerCase(); 
            valDescriere = valDescriere.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); ///fara diacritice
            let cond8 = (inpText != 'keywords') ? valDescriere.includes(inpText) : true;

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
                produs.style.display = "block";
                filteredProduse.push(produs); ///vector de produse filtrate
                anyVisible = true;
            } else {
                produs.style.display = "none";
            }
 
       }
       

        updatePagination(filteredProduse);
        console.log('Produse filtrate: ', filteredProduse);

        /* paginare */
        function updatePagination(products) {
            const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
            const paginationContainer = document.getElementById("pagination");
            paginationContainer.innerHTML = "";
    
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.innerHTML = i;
                pageButton.onclick = function () {
                    currentPage = i;
                    displayPage(products, currentPage);
                };
                paginationContainer.appendChild(pageButton);
            }
    
            currentPage = 1;
            displayPage(products, currentPage);
        }
    
        function displayPage(products, page) {
            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = Math.min(start + ITEMS_PER_PAGE, products.length);
            for (let i = 0; i < products.length; i++) {
                products[i].style.display = (i >= start && i < end) ? "block" : "none";
            }
    
            const numarProdusePePagina = end - start;
            document.getElementById("numar-produse").textContent = numarProdusePePagina;
        }


        var noProductsMessage = document.getElementById("no-products-message");
        if (!anyVisible) {
            if (!noProductsMessage) {
                noProductsMessage = document.createElement("div");
                noProductsMessage.id = "no-products-message";
                noProductsMessage.innerHTML = "Nu exista produse conform filtrării curente.";
                document.getElementById("produse").appendChild(noProductsMessage);
            } else {
                noProductsMessage.style.display = "block";
            }
        } else {
            if (noProductsMessage) {
                noProductsMessage.style.display = "none";
            }
        }
    }

    ///validare inputuri: 
    function validateInputs() 
    {
        var inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        var iTextarea = document.getElementById("i_textarea").value.trim();

        if (inpNume) {
            if (/[^a-zA-Z\s]/.test(inpNume)) {
                alert("Numele nu trebuie sa contina cifre sau caractere speciale.");
                return false;
            } else if (inpNume.length < 3) {
                alert("Numele trebuie sa aiba cel putin 3 caraactere.");
                return false;
            }
        }

        return true;
    }

    document.getElementById("inp-pret").onchange = document.getElementById("inp-pret").oninput = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        applyFilters();
    };

    document.getElementById("inp-nume").oninput = applyFilters;

    document.getElementById('i_textarea').addEventListener('input', function () {
        var textarea = this;
        var value = textarea.value.trim();
        if (/[^a-zA-Z\s]/.test(value)) {
            textarea.classList.add('is-invalid'); ///element cu 2 clase care se afla intr-un vector
            textarea.classList.remove('is-valid');
        } else if (value.length < 2) {
            textarea.classList.add('is-invalid');
            textarea.classList.remove('is-valid');
        } else {
            textarea.classList.remove('is-invalid');
            textarea.classList.add('is-valid');
        }
        applyFilters();
    });

    document.querySelectorAll('.toggle input[type="radio"]').forEach(function(input) {
        input.addEventListener('change', function() {
            document.querySelectorAll('.toggle .btn').forEach(function(label) {
                label.classList.remove('active');
            });
            input.parentElement.classList.add('active');
            applyFilters();
        });
    });

    ///ordinea initiala a produselor
    var prodinitialOrder = Array.from(document.getElementsByClassName("produs"));

    document.getElementById("resetare").onclick = function () 
    {
        var confirmReset = confirm("Doriti sa resetati filtrele?");
        if (confirmReset) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("i_rad4").checked = true;
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("color-choice").value = "";

            var textarea = document.getElementById("i_textarea");
            textarea.value = "Keywords";
            textarea.classList.remove('is-invalid');
            textarea.classList.remove('is-valid');

            var radioButtons = document.querySelectorAll('input[name="gr_rad"]');
            radioButtons.forEach(function (radio) {
                var label = radio.parentElement;
                if (radio.id === "i_rad4") {
                    label.classList.add("active");
                } else {
                    label.classList.remove("active");
                }
            });

            var checkboxes = document.querySelectorAll('#input-check input[type="checkbox"]');
            checkboxes.forEach(function (checkbox) {
                checkbox.checked = false;
            });

            ///resetare select multiplu
            var multiSelect = document.getElementById("inp-categorie2");
            for (var i = 0; i < multiSelect.options.length; i++) {
                multiSelect.options[i].selected = false;
            }

            ///resetare sortari
            var parentContainer = prodinitialOrder[0].parentNode;
            parentContainer.innerHTML = "";
            for (let prod of prodinitialOrder) {
                parentContainer.appendChild(prod);
                prod.style.display = "block";
            }
        }
    }

    function sorteaza(semn) {
        var produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse);///primeste orice obiect si genereaza un vector cu acelasi continut = "conversie"
        v_produse.sort(function (a, b) {
        /// sort by default sorteaza lexicografic

            let categ_a = (a.getElementsByClassName("val-categorie")[0].innerHTML)
            let categ_b = (b.getElementsByClassName("val-categorie")[0].innerHTML)

            if (categ_a == categ_b) {
                let pret_a = parseInt(a.getElementsByClassName("val-pret")[1].innerHTML)
                let pret_b = parseInt(b.getElementsByClassName("val-pret")[1].innerHTML)
                return semn * (pret_a - pret_b);
            }
            return semn * categ_a.localeCompare(categ_b);
        })

        for (let prod of v_produse) {
            prod.parentNode.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1);
    }

    document.getElementById("calculeazaBtn").onclick = function () {
        var suma = 0;
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {
            var selectCheckbox = produs.querySelector('.select-cos');
            if (selectCheckbox.checked) {
                suma += parseFloat(produs.getElementsByClassName("val-pret")[1].innerHTML)
            }
        }
        if (!document.getElementById("div_suma")) {
            let div = document.createElement("div");
            div.innerHTML = suma;
            div.id = "div_suma";
            container = document.getElementById("produse")
            container.insertBefore(div, container.children[0])

            setTimeout(function () {
                var pgf = document.getElementById("div_suma")
                if (pgf) pgf.remove()
            }, 2000);
        }
    }

    function addInputListeners() {
        const inputs = [
            document.getElementById("inp-nume"),
            document.getElementById("inp-pret"),
            document.getElementById("inp-categorie"),
            document.getElementById("color-choice"),
            document.getElementById("i_textarea"),
            ...document.querySelectorAll('input[name="gr_rad"]'),
            ...document.querySelectorAll('#input-check input[type="checkbox"]'),
            document.getElementById("inp-categorie2")
        ];

        inputs.forEach(input => {
            input.addEventListener('change', applyFilters);
            input.addEventListener('input', applyFilters);
        });
    }

    addInputListeners();


    /* Tasta apasata */ 

    window.onkeydown = function (e) {
        if (e.key == "c" && e.altKey) {///altkey e bool
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
            for (let produs of produse) 
            {
                ///verificam stilizarea css
                var stil = getComputedStyle(produs)///stilul calculat de peste tot
                if (stil.display != "none") {
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[1].innerHTML)
                }
            }

            if (!document.getElementById("rezultat")) {
                let p = document.createElement("p")
                p.innerHTML = suma;
                p.id = "rezultat";
                container = document.getElementById("produse")
                                    ///appendchild adauga la final
                container.insertBefore(p, container.children[0])

                setTimeout(function () {
                    var pgf = document.getElementById("rezultat")
                    if (pgf)
                        pgf.remove()
                }, 2000);
            }
        }
    }

    applyFilters();
});
