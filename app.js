const API_BASES = [
  `${window.location.origin}/api`,
  "https://soft-disk-f17b.akitanheu-ai.workers.dev/api",
];
const REMOTE_BASE =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes";
const SITE_URL = "https://gasolinabarata.me";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const STORAGE_KEY = "gasolineras-favoritas-filtros-v2";
const CALCULATOR_STORAGE_KEY = "gasolineras-calculadora-v1";
const THEME_STORAGE_KEY = "gasolineras-theme-v1";
const APP_VERSION = "20260513a";
const DEFAULT_SEO_TITLE = "Gasolina barata cerca de ti | Precios de gasolineras hoy";
const DEFAULT_SEO_DESCRIPTION =
  "Encuentra gasolina barata cerca de ti y compara precios actualizados de gasolineras en España: gasolina 95, gasolina 98 y diésel por municipio, marca o ubicación.";
const DEFAULT_DRIVE_MINUTES = 20;
const AVERAGE_DRIVE_SPEED_KMH = 55;
const ROAD_DISTANCE_FACTOR = 1.35;
const NATIONWIDE_CACHE_TTL_MS = 5 * 60 * 1000;
const NATIONWIDE_FETCH_CONCURRENCY = 6;
const EXCLUDED_NATIONWIDE_PROVINCES = new Set(["CEUTA", "MELILLA"]);

const DEFAULT_PRODUCTS = [
  { id: "1", label: "Gasolina 95" },
  { id: "3", label: "Gasolina 98" },
  { id: "4", label: "Gasóleo A" },
];

const BRAND_LOGO_ASSETS = [
  { match: ["REPSOL"], src: "./assets/logos/repsol.jpg", alt: "Logo de Repsol" },
  { match: ["MOEVE", "CEPSA"], src: "./assets/logos/moeve.svg", alt: "Logo de Moeve" },
  { match: ["GALP"], src: "./assets/logos/galp.png", alt: "Logo de Galp" },
  { match: ["Q8"], src: "./assets/logos/q8.svg", alt: "Logo de Q8" },
  { match: ["PETRONOR"], src: "./assets/logos/petronor.png", alt: "Logo de Petronor" },
  { match: ["BALLENOIL"], src: "./assets/logos/ballenoil.png", alt: "Logo de Ballenoil" },
  { match: ["PLENOIL", "PLENERGY"], src: "./assets/logos/plenoil.svg", alt: "Logo de Plenoil" },
  { match: ["MEROIL"], src: "./assets/logos/meroil.png", alt: "Logo de Meroil" },
  { match: ["TAMOIL"], src: "./assets/logos/tamoil.png", alt: "Logo de Tamoil" },
  { match: ["BONAREA", "BONÀREA"], src: "./assets/logos/bonarea.svg", alt: "Logo de bonÀrea" },
  { match: ["ESCLATOIL"], src: "./assets/logos/esclatoil.svg", alt: "Logo de Esclatoil" },
  { match: ["PETROPRIX"], src: "./assets/logos/petroprix.svg", alt: "Logo de Petroprix" },
  { match: ["SHELL"], src: "./assets/logos/shell.svg", alt: "Logo de Shell" },
];

const BRAND_LOGO_STYLES = [
  { match: ["REPSOL"], label: "Repsol", bg: "#ff6b00", fg: "#ffffff", accent: "#1f3c88" },
  { match: ["CEPSA", "MOEVE"], label: "Cepsa", bg: "#e1251b", fg: "#ffffff", accent: "#b51d15" },
  { match: ["BP"], label: "bp", bg: "#2f9e44", fg: "#ffffff", accent: "#1f7a32" },
  { match: ["GALP"], label: "galp", bg: "#f76707", fg: "#ffffff", accent: "#c75000" },
  { match: ["SHELL"], label: "Shell", bg: "#ffd43b", fg: "#8f2d00", accent: "#ff922b" },
  { match: ["PETRONOR"], label: "Petronor", bg: "#e03131", fg: "#ffffff", accent: "#9c1f1f" },
  { match: ["PLENOIL"], label: "Plenoil", bg: "#1864ab", fg: "#ffffff", accent: "#0b4f8a" },
  { match: ["BALLENOIL"], label: "Ballenoil", bg: "#1098ad", fg: "#ffffff", accent: "#0b7285" },
  { match: ["BONAREA"], label: "bonArea", bg: "#fab005", fg: "#5f3b00", accent: "#f08c00" },
  { match: ["ESCLATOIL"], label: "Esclat", bg: "#c92a2a", fg: "#ffffff", accent: "#862e9c" },
  { match: ["PETROPRIX"], label: "Petroprix", bg: "#495057", fg: "#ffffff", accent: "#212529" },
  { match: ["Q8"], label: "Q8", bg: "#5f3dc4", fg: "#ffffff", accent: "#3b2b91" },
];

const state = {
  municipalities: [],
  provinces: [],
  products: [],
  stations: [],
  timerId: null,
  requestId: 0,
  abortController: null,
  showAllFuels: false,
  searchMode: "municipality",
  currentCoords: null,
  currentProvince: null,
  currentLocationLabel: "",
  searchContext: null,
  nationwideCheapestCache: new Map(),
  nationwideSummaryRequestId: 0,
  calculatorDefaults: {
    budget: 30,
    consumption: null,
  },
};

const municipioInput = document.querySelector("#municipioInput");
const municipiosList = document.querySelector("#municipiosList");
const brandSelect = document.querySelector("#brandSelect");
const fuelSelect = document.querySelector("#fuelSelect");
const toggleMoreFuelsButton = document.querySelector("#toggleMoreFuelsButton");
const sortSelect = document.querySelector("#sortSelect");
const nearbyCheckbox = document.querySelector("#nearbyCheckbox");
const openNowCheckbox = document.querySelector("#openNowCheckbox");
const driveTimeRange = document.querySelector("#driveTimeRange");
const driveTimeValue = document.querySelector("#driveTimeValue");
const useLocationButton = document.querySelector("#useLocationButton");
const themeToggleButton = document.querySelector("#themeToggleButton");
const locationHint = document.querySelector("#locationHint");
const refreshButton = document.querySelector("#refreshButton");
const controlsPanel = document.querySelector(".controls-panel");
const filtersForm = document.querySelector("#filtersForm");
const filtersToggleButton = document.querySelector("#filtersToggleButton");
const filtersToggleLabel = filtersToggleButton.querySelector("span");
const filtersSummary = document.querySelector("#filtersSummary");
const results = document.querySelector("#results");
const resultsCount = document.querySelector("#resultsCount");
const selectedFuelLabel = document.querySelector("#selectedFuelLabel");
const stationTemplate = document.querySelector("#stationTemplate");
const nationwideCheapestLocation = document.querySelector("#nationwideCheapestLocation");
const nationwideCheapestMeta = document.querySelector("#nationwideCheapestMeta");
const nationwideCheapestPrice = document.querySelector("#nationwideCheapestPrice");
const metaDescription = document.querySelector("#metaDescription");
const canonicalLink = document.querySelector("#canonicalLink");
const ogTitle = document.querySelector("#ogTitle");
const ogDescription = document.querySelector("#ogDescription");
const ogUrl = document.querySelector("#ogUrl");
const twitterTitle = document.querySelector("#twitterTitle");
const twitterDescription = document.querySelector("#twitterDescription");
const gaMetaTag = document.querySelector('meta[name="ga4-measurement-id"]');
const GA_MEASUREMENT_ID = (gaMetaTag?.content || "").trim();
const GA_ENABLED = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX";
const COOKIE_CONSENT_KEY = "cookie-consent-v1";

boot();

async function boot() {
  setupAnalytics();
  applySavedTheme();
  registerServiceWorker();
  bindEvents();

  try {
    const [municipalities, products, provinces] = await Promise.all([
      fetchJson("/municipios"),
      fetchJson("/productos"),
      fetchJson("/provincias").catch(() => []),
    ]);

    state.municipalities = municipalities;
    state.provinces = provinces.map((item) => ({
      ...item,
      IDProvincia: item.IDProvincia || item.IDPovincia,
    }));
    state.products = products;

    renderMunicipalities(municipalities);
    renderFuelOptions(products);
    hydrateFilters();
    hydrateCalculator();
    updateLocationUi();
    updateFiltersSummary();
    syncFiltersPanel();
    updateNationwideCheapest();

    if (municipioInput.value) {
      await loadStations();
    }
  } catch (error) {
    console.error(error);
    renderEmpty("Revisa tu conexión y vuelve a intentarlo.");
  }
}

function bindEvents() {
  municipioInput.addEventListener("input", () => {
    if (state.searchMode === "location") {
      disableLocationMode();
    }

    saveFilters();
    updateFiltersSummary();
  });

  municipioInput.addEventListener("change", () => {
    saveFilters();
    updateFiltersSummary();
    trackEvent("search_municipio", {
      municipio: municipioInput.value.trim() || "(vacio)",
    });
    loadStations();
  });

  brandSelect.addEventListener("change", () => {
    saveFilters();
    updateFiltersSummary();
    renderStations();
  });

  const handleFuelSelection = () => {
    updateSelectedFuelLabel();
    saveFilters();
    updateNationwideCheapest();
    trackEvent("select_fuel", {
      product_id: fuelSelect.value || "(none)",
      fuel_name: fuelSelect.options[fuelSelect.selectedIndex]?.textContent || "(none)",
    });
    loadStations();
  };

  fuelSelect.addEventListener("change", handleFuelSelection);
  fuelSelect.addEventListener("input", handleFuelSelection);
  fuelSelect.addEventListener("blur", handleFuelSelection);
  toggleMoreFuelsButton.addEventListener("click", toggleFuelOptions);

  sortSelect.addEventListener("change", () => {
    saveFilters();
    renderStations();
  });

  nearbyCheckbox.addEventListener("change", () => {
    saveFilters();
    updateDriveTimeUi();
    updateFiltersSummary();
    loadStations();
  });

  driveTimeRange.addEventListener("input", () => {
    if (!nearbyCheckbox.checked && state.searchMode !== "location") {
      nearbyCheckbox.checked = true;
    }

    updateDriveTimeUi();
    saveFilters();
    updateFiltersSummary();
  });

  driveTimeRange.addEventListener("change", () => {
    if (!nearbyCheckbox.checked && state.searchMode !== "location") {
      nearbyCheckbox.checked = true;
    }

    updateDriveTimeUi();
    saveFilters();
    updateFiltersSummary();
    loadStations({ keepFiltersOpen: true });
  });

  openNowCheckbox.addEventListener("change", () => {
    saveFilters();
    renderStations();
  });

  themeToggleButton.addEventListener("click", toggleTheme);

  useLocationButton.addEventListener("click", async () => {
    trackEvent("click_use_location", {
      mode: state.searchMode,
    });
    if (state.searchMode === "location") {
      disableLocationMode();

      if (municipioInput.value.trim()) {
        await loadStations();
      } else {
        state.stations = [];
        state.searchContext = null;
        renderEmpty("Elige un municipio o activa tu ubicación para empezar.");
      }
      return;
    }

    await requestCurrentLocation();
  });

  refreshButton.addEventListener("click", () => {
    trackEvent("click_refresh_prices");
    updateNationwideCheapest(true);
    loadStations();
  });
  filtersToggleButton.addEventListener("click", () => {
    controlsPanel.classList.toggle("collapsed");
    syncFiltersPanel();
  });
  window.addEventListener("resize", syncFiltersPanel);
}

function hydrateFilters() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const urlFilters = readFiltersFromUrl();

  if (saved.municipio) {
    municipioInput.value = saved.municipio;
  }

  if (saved.brand && [...brandSelect.options].some((opt) => opt.value === saved.brand)) {
    brandSelect.value = saved.brand;
  }

  if (saved.productId && [...fuelSelect.options].some((opt) => opt.value === saved.productId)) {
    fuelSelect.value = saved.productId;
  }

  if (saved.sort) {
    sortSelect.value = saved.sort;
  }

  if (Number.isFinite(saved.driveMinutes)) {
    driveTimeRange.value = clampDriveMinutes(saved.driveMinutes);
  } else {
    driveTimeRange.value = String(DEFAULT_DRIVE_MINUTES);
  }

  nearbyCheckbox.checked = saved.nearby !== false;
  openNowCheckbox.checked = Boolean(saved.openNow);

  if (urlFilters.municipio) {
    municipioInput.value = urlFilters.municipio;
  }

  if (urlFilters.brand && [...brandSelect.options].some((opt) => opt.value === urlFilters.brand)) {
    brandSelect.value = urlFilters.brand;
  }

  if (urlFilters.productId && [...fuelSelect.options].some((opt) => opt.value === urlFilters.productId)) {
    fuelSelect.value = urlFilters.productId;
  }
  
  // Asegurar que el UI del slider se actualice
  setTimeout(() => {
    updateDriveTimeUi();
  }, 10);
  
  updateSelectedFuelLabel();
  updateFiltersSummary();
}

function hydrateCalculator() {
  const saved = JSON.parse(localStorage.getItem(CALCULATOR_STORAGE_KEY) || "{}");

  if (Number.isFinite(saved.budget)) {
    state.calculatorDefaults.budget = saved.budget;
  }

  if (Number.isFinite(saved.consumption)) {
    state.calculatorDefaults.consumption = saved.consumption;
  }
}

function saveCalculator(values = state.calculatorDefaults) {
  state.calculatorDefaults = {
    ...state.calculatorDefaults,
    ...values,
  };

  localStorage.setItem(
    CALCULATOR_STORAGE_KEY,
    JSON.stringify({
      budget: state.calculatorDefaults.budget,
      consumption: state.calculatorDefaults.consumption,
    }),
  );
}

function saveFilters() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      municipio: municipioInput.value.trim(),
      brand: brandSelect.value,
      productId: fuelSelect.value,
      sort: sortSelect.value,
      driveMinutes: getDriveTimeLimit(),
      nearby: nearbyCheckbox.checked,
      openNow: openNowCheckbox.checked,
    }),
  );
}

async function loadStations(options = {}) {
  const { keepFiltersOpen = false } = options;
  const selectedProduct = state.products.find(
    (item) => item.IDProducto === fuelSelect.value,
  );

  if (state.abortController) {
    state.abortController.abort();
  }

  state.abortController = new AbortController();
  state.requestId += 1;
  const currentRequestId = state.requestId;
  const signal = state.abortController.signal;

  state.stations = [];
  resultsCount.textContent = "Cargando...";
  results.innerHTML = `<div class="empty-state">Cargando ${escapeHtml(
    selectedProduct?.NombreProducto || "combustible",
  )}...</div>`;

  try {
    let payload;
    let stations = [];
    let centerPoint = null;
    let searchLabel = "";

    if (state.searchMode === "location") {
      if (!state.currentCoords || !state.currentProvince) {
        throw new Error("Missing current location data");
      }

      payload = await fetchJson(
        `/estaciones?provinciaId=${encodeURIComponent(
          state.currentProvince.IDProvincia,
        )}&productId=${encodeURIComponent(fuelSelect.value)}`,
        { signal },
      );

      centerPoint = state.currentCoords;
      stations = filterStationsByTravelTime(payload.ListaEESSPrecio || [], centerPoint);
      searchLabel = state.currentLocationLabel || "tu ubicación";
    } else {
      const municipality = resolveMunicipality(municipioInput.value);

      if (!municipality) {
        state.stations = [];
        state.searchContext = null;
        renderEmpty("No encuentro ese municipio en el listado oficial.");
        updatePageSeo();
        return;
      }

      searchLabel = municipality.Municipio;

      if (nearbyCheckbox.checked) {
        if (!municipality.IDProvincia) {
          throw new Error("Missing municipality province");
        }

        const municipalityPath = `/estaciones?municipioId=${encodeURIComponent(
          municipality.IDMunicipio,
        )}&productId=${encodeURIComponent(fuelSelect.value)}`;
        const provincePath = `/estaciones?provinciaId=${encodeURIComponent(
          municipality.IDProvincia,
        )}&productId=${encodeURIComponent(fuelSelect.value)}`;

        const municipalityPayload = await fetchJson(municipalityPath, { signal });
        centerPoint =
          computeStationCentroid(municipalityPayload.ListaEESSPrecio || []) ||
          (await geocodeMunicipalityCenter(municipality, signal));

        try {
          payload = await fetchJson(provincePath, { signal });
          stations = centerPoint
            ? filterStationsByTravelTime(payload.ListaEESSPrecio || [], centerPoint)
            : payload.ListaEESSPrecio || [];
        } catch (error) {
          console.warn("No se pudo ampliar la búsqueda por provincia, uso solo municipio.", error);
          payload = municipalityPayload;
          stations = municipalityPayload.ListaEESSPrecio || [];
        }
      } else {
        const municipalityPath = `/estaciones?municipioId=${encodeURIComponent(
          municipality.IDMunicipio,
        )}&productId=${encodeURIComponent(fuelSelect.value)}`;

        payload = await fetchJson(municipalityPath, { signal });
        stations = payload.ListaEESSPrecio || [];
        centerPoint = computeStationCentroid(stations);
      }
    }

    if (currentRequestId !== state.requestId) {
      return;
    }

    state.stations = stations;
    state.searchContext = {
      centerPoint,
      searchLabel,
      isNearbyMode: nearbyCheckbox.checked || state.searchMode === "location",
      isLocationMode: state.searchMode === "location",
    };

    const visibleCards = renderStations();
    syncUrlFromFilters(searchLabel);
    updatePageSeo({ cards: visibleCards, searchLabel });
    collapseFiltersAfterSearch(keepFiltersOpen);

    clearTimeout(state.timerId);
    state.timerId = window.setTimeout(loadStations, REFRESH_INTERVAL_MS);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error(error);
    state.stations = [];
    state.searchContext = null;
    renderEmpty("No se han podido descargar los precios en este momento.");
  }
}

function renderMunicipalities(municipalities) {
  municipiosList.innerHTML = municipalities
    .slice()
    .sort((a, b) => a.Municipio.localeCompare(b.Municipio, "es"))
    .map(
      (item) =>
        `<option value="${escapeHtml(item.Municipio)} (${escapeHtml(
          item.Provincia,
        )})"></option>`,
    )
    .join("");
}

function renderFuelOptions(products) {
  const currentValue = fuelSelect.value || "1";
  const preferredIds = new Set(DEFAULT_PRODUCTS.map((product) => product.id));
  const preferredProducts = DEFAULT_PRODUCTS.map((product) =>
    products.find((item) => item.IDProducto === product.id),
  ).filter(Boolean);
  const extraProducts = products.filter((item) => !preferredIds.has(item.IDProducto));
  const selectedNeedsAll = !preferredIds.has(currentValue);
  const showAll = state.showAllFuels || selectedNeedsAll;
  const visibleProducts = showAll
    ? [...preferredProducts, ...extraProducts]
    : preferredProducts;

  fuelSelect.innerHTML = visibleProducts
    .map(
      (item) =>
        `<option value="${item.IDProducto}">${escapeHtml(item.NombreProducto)}</option>`,
    )
    .join("");

  fuelSelect.value = visibleProducts.some((item) => item.IDProducto === currentValue)
    ? currentValue
    : "1";
  toggleMoreFuelsButton.textContent = showAll ? "Ver menos" : "Ver más";
  updateSelectedFuelLabel();
}

function toggleFuelOptions() {
  state.showAllFuels = !state.showAllFuels;
  renderFuelOptions(state.products);
  saveFilters();
}

function renderStations() {
  const cards = getVisibleStations();

  resultsCount.textContent = `${cards.length} resultados`;

  if (!cards.length) {
    const emptyMessage = brandSelect.value
      ? "No hay gasolineras que coincidan con esa marca para este filtro."
      : "No hay estaciones con precio disponible para ese filtro.";
    renderEmpty(emptyMessage);
    updatePageSeo({ cards });
    return cards;
  }

  results.innerHTML = "";

  cards.forEach((station) => {
    const fragment = stationTemplate.content.cloneNode(true);
    const logo = fragment.querySelector(".station-logo");
    const logoImage = buildBrandLogo(station.Rótulo || "");
    logo.src = logoImage.src;
    logo.alt = logoImage.alt;
    fragment.querySelector(".station-brand").textContent =
      station.Rótulo || "Marca no indicada";
    fragment.querySelector(".station-name").textContent =
      station["Dirección"] || "Dirección no disponible";
    fragment.querySelector(".station-address").textContent = [
      station["C.P."],
      station.Municipio,
      station.Provincia,
    ]
      .filter(Boolean)
      .join(" · ");
    fragment.querySelector(".price-badge").textContent = `${station._parsedPrice.toFixed(3)} €/l`;
    fragment.querySelector(".schedule-pill").textContent = normalizeSchedule(
      station.Horario,
    );
    fragment.querySelector(".updated-pill").textContent = `${selectedFuelLabel.textContent} · IDEESS ${station.IDEESS}`;

    const distancePill = fragment.querySelector(".distance-pill");
    if (Number.isFinite(station._distanceKm) && Number.isFinite(station._driveMinutes)) {
      distancePill.hidden = false;
      distancePill.textContent = `${station._distanceKm.toFixed(1)} km · ${station._driveMinutes} min aprox.`;
    } else {
      distancePill.hidden = true;
      distancePill.textContent = "";
    }

    const destinationLabel = [
      station.Rótulo || "",
      station["Dirección"] || "",
      station.Municipio || "",
      station.Provincia || "",
    ]
      .filter(Boolean)
      .join(", ");
    const mapLinks = buildMapLinks(station, destinationLabel);
    const appleLink = fragment.querySelector(".map-link-apple");
    const googleLink = fragment.querySelector(".map-link-google");
    const wazeLink = fragment.querySelector(".map-link-waze");
    appleLink.href = mapLinks.apple;
    googleLink.href = mapLinks.google;
    wazeLink.href = mapLinks.waze;
    appleLink.addEventListener("click", () => trackMapClick("apple_maps", station));
    googleLink.addEventListener("click", () => trackMapClick("google_maps", station));
    wazeLink.addEventListener("click", () => trackMapClick("waze", station));
    const useStationPriceButton = fragment.querySelector(".use-station-price-button");
    const stationCalculator = fragment.querySelector(".station-calculator");
    const budgetInput = fragment.querySelector(".calc-budget-input");
    const consumptionInput = fragment.querySelector(".calc-consumption-input");

    budgetInput.value = String(state.calculatorDefaults.budget || 30);
    if (Number.isFinite(state.calculatorDefaults.consumption)) {
      consumptionInput.value = String(state.calculatorDefaults.consumption);
    }

    const updateCardCalculator = () => {
      updateStationCalculator(stationCalculator, station._parsedPrice);
    };

    stationCalculator.addEventListener("input", () => {
      saveCalculator({
        budget: parseSpanishNumber(budgetInput.value),
        consumption: parseSpanishNumber(consumptionInput.value),
      });
      updateCardCalculator();
    });

    useStationPriceButton.addEventListener("click", () => {
      stationCalculator.hidden = !stationCalculator.hidden;
      useStationPriceButton.textContent = stationCalculator.hidden
        ? "Calcular km"
        : "Ocultar cálculo";
      updateCardCalculator();
    });

    results.appendChild(fragment);
  });

  updatePageSeo({ cards });
  return cards;
}

function updateStationCalculator(container, price) {
  const budget = parseSpanishNumber(container.querySelector(".calc-budget-input").value);
  const consumption = parseSpanishNumber(
    container.querySelector(".calc-consumption-input").value,
  );
  const litersOutput = container.querySelector(".calc-liters-output");
  const distanceOutput = container.querySelector(".calc-distance-output");
  const canCalculate =
    Number.isFinite(budget) &&
    Number.isFinite(price) &&
    Number.isFinite(consumption) &&
    budget > 0 &&
    price > 0 &&
    consumption > 0;

  if (!canCalculate) {
    litersOutput.textContent = "-- litros";
    distanceOutput.textContent = "-- km";
    return;
  }

  const liters = budget / price;
  const distanceKm = (liters * 100) / consumption;

  litersOutput.textContent = `${formatNumber(liters, 1)} litros`;
  distanceOutput.textContent = `${formatNumber(distanceKm, 0)} km aprox.`;
}

async function updateNationwideCheapest(force = false) {
  const productId = fuelSelect.value;
  const productName =
    fuelSelect.options[fuelSelect.selectedIndex]?.textContent || "este combustible";
  const eligibleProvinces = state.provinces.filter(
    (province) => !EXCLUDED_NATIONWIDE_PROVINCES.has(normalizeText(province.Provincia).toUpperCase()),
  );

  if (!productId || !eligibleProvinces.length) {
    renderNationwideCheapest({
      title: "Sin datos todavía",
      meta: `No he podido preparar el resumen nacional para ${productName}.`,
      price: "--",
    });
    return;
  }

  const cacheEntry = state.nationwideCheapestCache.get(productId);
  const isFresh =
    cacheEntry && Date.now() - cacheEntry.timestamp < NATIONWIDE_CACHE_TTL_MS;

  if (!force && isFresh) {
    renderNationwideCheapestFromStation(cacheEntry.station, productName);
    return;
  }

  const requestId = ++state.nationwideSummaryRequestId;

  renderNationwideCheapest({
    title: "Buscando mejor precio...",
    meta: `Consultando ${productName.toLowerCase()} en toda España.`,
    price: "...",
  });

  try {
    const provinceResults = await mapWithConcurrency(
      eligibleProvinces,
      NATIONWIDE_FETCH_CONCURRENCY,
      async (province) => {
        try {
          const payload = await fetchJson(
            `/estaciones?provinciaId=${encodeURIComponent(
              province.IDProvincia,
            )}&productId=${encodeURIComponent(productId)}`,
          );

          return getCheapestStation(payload.ListaEESSPrecio || []);
        } catch (error) {
          console.warn(
            `No se pudo consultar la provincia ${province.Provincia || province.IDProvincia}.`,
            error,
          );
          return null;
        }
      },
    );

    if (requestId !== state.nationwideSummaryRequestId) {
      return;
    }

    const cheapestStation = getCheapestStation(provinceResults.filter(Boolean));

    if (!cheapestStation) {
      renderNationwideCheapest({
        title: "Sin precios disponibles",
        meta: `No hay precios válidos ahora mismo para ${productName}.`,
        price: "--",
      });
      return;
    }

    state.nationwideCheapestCache.set(productId, {
      timestamp: Date.now(),
      station: cheapestStation,
    });
    renderNationwideCheapestFromStation(cheapestStation, productName);
  } catch (error) {
    if (requestId !== state.nationwideSummaryRequestId) {
      return;
    }

    console.error(error);
    renderNationwideCheapest({
      title: "No he podido calcularlo",
      meta: `Ha fallado la consulta nacional de ${productName}.`,
      price: "--",
    });
  }
}

function renderNationwideCheapestFromStation(station, productName) {
  const place = [station.Municipio, station.Provincia].filter(Boolean).join(", ");
  const brand = station.Rótulo || "Gasolinera sin marca";
  const address = station["Dirección"] || "Dirección no disponible";

  renderNationwideCheapest({
    title: place || "Ubicación no disponible",
    meta: `${brand} · ${address} · ${productName}`,
    price: `${station._parsedPrice.toFixed(3)} €/l`,
  });
}

function renderNationwideCheapest({ title, meta, price }) {
  nationwideCheapestLocation.textContent = title;
  nationwideCheapestMeta.textContent = meta;
  nationwideCheapestPrice.textContent = price;
}

function updateSelectedFuelLabel() {
  const selectedOption = fuelSelect.options[fuelSelect.selectedIndex];
  selectedFuelLabel.textContent = `Combustible activo: ${
    selectedOption?.textContent || "No seleccionado"
  }`;
  updateFiltersSummary();
  updatePageSeo();
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawFuel = params.get("combustible") || params.get("fuel") || "";
  const rawBrand = params.get("marca") || params.get("brand") || "";

  return {
    municipio: params.get("municipio") || params.get("q") || "",
    brand: rawBrand.trim().toUpperCase(),
    productId: normalizeProductParam(rawFuel),
  };
}

function normalizeProductParam(value) {
  const normalized = normalizeText(value).replace(/_/g, "-");

  if (!normalized) {
    return "";
  }

  if (/^\d+$/.test(normalized)) {
    return normalized;
  }

  if (normalized.includes("98")) {
    return "3";
  }

  if (normalized.includes("diesel") || normalized.includes("gasoleo")) {
    return "4";
  }

  if (normalized.includes("95") || normalized.includes("gasolina")) {
    return "1";
  }

  return "";
}

function syncUrlFromFilters(searchLabel = "") {
  if (!window.history?.replaceState || state.searchMode === "location") {
    return;
  }

  const params = new URLSearchParams();
  const municipality = searchLabel || municipioInput.value.trim();
  const fuelSlug = getFuelSlug(fuelSelect.value);
  const brand = brandSelect.value.trim();

  if (municipality) {
    params.set("municipio", municipality);
  }

  if (fuelSlug && fuelSelect.value !== "1") {
    params.set("combustible", fuelSlug);
  }

  if (brand) {
    params.set("marca", brand.toLowerCase());
  }

  const nextUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState(null, "", nextUrl);
}

function updatePageSeo(options = {}) {
  const cards = options.cards || [];
  const searchLabel = options.searchLabel || state.searchContext?.searchLabel || "";
  const fuelName =
    fuelSelect.options[fuelSelect.selectedIndex]?.textContent || "gasolina";
  const brandName = brandSelect.value
    ? brandSelect.options[brandSelect.selectedIndex]?.textContent || brandSelect.value
    : "";
  const hasMunicipality = state.searchMode !== "location" && Boolean(searchLabel);
  const title = hasMunicipality
    ? `${fuelName} barato en ${searchLabel} | Gasolineras más baratas hoy`
    : DEFAULT_SEO_TITLE;
  const description = hasMunicipality
    ? buildLocalSeoDescription(cards.length, fuelName, searchLabel, brandName)
    : DEFAULT_SEO_DESCRIPTION;
  const canonicalUrl = buildCanonicalUrl(hasMunicipality ? searchLabel : "");

  document.title = title;
  setElementContent(metaDescription, "content", description);
  setElementContent(canonicalLink, "href", canonicalUrl);
  setElementContent(ogTitle, "content", title);
  setElementContent(ogDescription, "content", description);
  setElementContent(ogUrl, "content", canonicalUrl);
  setElementContent(twitterTitle, "content", title);
  setElementContent(twitterDescription, "content", description);
}

function buildLocalSeoDescription(count, fuelName, municipality, brandName) {
  const countText = count
    ? `${count} gasolineras`
    : "gasolineras";
  const brandText = brandName ? ` de ${brandName}` : "";

  return `Compara ${countText}${brandText} en ${municipality} y encuentra ${fuelName.toLowerCase()} barato cerca de ti con precios actualizados, distancia aproximada y enlaces para llegar.`;
}

function buildCanonicalUrl(municipality = "") {
  const url = new URL(SITE_URL);
  const fuelSlug = getFuelSlug(fuelSelect.value);

  if (municipality) {
    url.searchParams.set("municipio", municipality);
  }

  if (municipality && fuelSlug && fuelSelect.value !== "1") {
    url.searchParams.set("combustible", fuelSlug);
  }

  return url.toString();
}

function getFuelSlug(productId) {
  const selectedOption = state.products.find((item) => item.IDProducto === productId);
  const label = normalizeText(selectedOption?.NombreProducto || "");

  if (label.includes("98")) {
    return "gasolina-98";
  }

  if (label.includes("gasoleo") || label.includes("diesel")) {
    return "diesel";
  }

  if (label.includes("95") || label.includes("gasolina")) {
    return "gasolina-95";
  }

  return productId ? `combustible-${productId}` : "";
}

function setElementContent(element, attribute, value) {
  if (!element) {
    return;
  }

  element.setAttribute(attribute, value);
}

function getVisibleStations() {
  const brandNeedle = normalizeText(brandSelect.value);
  const sortMode = sortSelect.value;
  const prioritizeOpenNow = openNowCheckbox.checked;

  const filtered = state.stations
    .map((station) => decorateStation(station, state.searchContext?.centerPoint))
    .filter((station) => Number.isFinite(station._parsedPrice))
    .filter((station) => {
      if (!brandNeedle) {
        return true;
      }

      return normalizeText(station.Rótulo || "").includes(brandNeedle);
    });

  filtered.sort((left, right) => {
    if (prioritizeOpenNow && right._scheduleScore !== left._scheduleScore) {
      return right._scheduleScore - left._scheduleScore;
    }

    if (sortMode === "price-desc") {
      return right._parsedPrice - left._parsedPrice;
    }

    if (sortMode === "distance-asc") {
      const leftDistance = Number.isFinite(left._distanceKm) ? left._distanceKm : Number.POSITIVE_INFINITY;
      const rightDistance = Number.isFinite(right._distanceKm)
        ? right._distanceKm
        : Number.POSITIVE_INFINITY;

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    if (sortMode === "name-asc") {
      return (left.Rótulo || left["Dirección"] || "").localeCompare(
        right.Rótulo || right["Dirección"] || "",
        "es",
      );
    }

    return left._parsedPrice - right._parsedPrice;
  });

  return filtered;
}

function decorateStation(station, centerPoint) {
  const coords = parseStationCoordinates(station);
  const distanceKm =
    centerPoint && coords ? haversineDistanceKm(centerPoint, coords) : Number.NaN;
  const driveMinutes = Number.isFinite(distanceKm)
    ? estimateDriveMinutes(distanceKm)
    : Number.NaN;

  return {
    ...station,
    _parsedPrice: parseSpanishNumber(station.PrecioProducto),
    _scheduleScore: scoreSchedule(station.Horario),
    _distanceKm: distanceKm,
    _driveMinutes: driveMinutes,
  };
}

function getCheapestStation(stations) {
  const cheapest = stations
    .map((station) => decorateStation(station))
    .filter((station) => Number.isFinite(station._parsedPrice))
    .sort((left, right) => left._parsedPrice - right._parsedPrice)[0];

  return cheapest || null;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}

function buildMapLinks(station, destinationLabel) {
  const coords = parseStationCoordinates(station);
  const label = encodeURIComponent(destinationLabel);

  if (coords) {
    const latitude = coords.latitude.toFixed(6);
    const longitude = coords.longitude.toFixed(6);

    return {
      apple: `https://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`,
      google: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      waze: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
    };
  }

  const fallback = encodeURIComponent(destinationLabel || station["Dirección"] || "");
  return {
    apple: `https://maps.apple.com/?q=${fallback}`,
    google: `https://www.google.com/maps/search/?api=1&query=${fallback}`,
    waze: `https://waze.com/ul?q=${fallback}&navigate=yes`,
  };
}

function buildBrandLogo(rawBrand) {
  const brand = String(rawBrand || "").trim();
  const normalizedBrand = normalizeText(brand).toUpperCase();
  const asset = BRAND_LOGO_ASSETS.find((item) =>
    item.match.some((candidate) => normalizedBrand.includes(candidate)),
  );

  if (asset) {
    return {
      src: asset.src,
      alt: asset.alt,
    };
  }

  const style =
    BRAND_LOGO_STYLES.find((item) =>
      item.match.some((candidate) => normalizedBrand.includes(candidate)),
    ) || {
      label: extractBrandMonogram(brand || "Gas"),
      bg: "#172321",
      fg: "#fff8ef",
      accent: "#5f6d66",
    };

  const dataUri = buildLogoDataUri(style.label, style.bg, style.fg, style.accent);
  return {
    src: dataUri,
    alt: brand ? `Logo de ${brand}` : "Logo genérico de gasolinera",
  };
}

function extractBrandMonogram(brand) {
  const clean = String(brand || "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 3).toUpperCase() || "GAS";
}

function buildLogoDataUri(label, bg, fg, accent) {
  const safeLabel = escapeXml(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#g)" />
      <circle cx="50" cy="14" r="8" fill="rgba(255,255,255,0.18)" />
      <text
        x="32"
        y="37"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${label.length >= 6 ? "13" : label.length >= 4 ? "15" : "20"}"
        font-weight="700"
        fill="${fg}"
      >${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderEmpty(message) {
  resultsCount.textContent = "0 resultados";
  results.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function setStatus() {}

function resolveMunicipality(rawValue) {
  const typed = normalizeText(rawValue);
  if (!typed) {
    return null;
  }

  const exactMatch = state.municipalities.find((item) => {
    const municipalityName = normalizeText(item.Municipio);
    const combined = normalizeText(`${item.Municipio} (${item.Provincia})`);
    return municipalityName === typed || combined === typed;
  });

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = state.municipalities.filter((item) => {
    const municipalityName = normalizeText(item.Municipio);
    const combined = normalizeText(`${item.Municipio} (${item.Provincia})`);
    return municipalityName.includes(typed) || combined.includes(typed);
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}

function resolveProvince(rawValue) {
  const typed = normalizeText(rawValue)
    .replace(/^provincia de /, "")
    .replace(/^provincia d'/, "")
    .replace(/^provincia del /, "");

  return (
    state.provinces.find((item) => normalizeText(item.Provincia) === typed) ||
    state.provinces.find((item) => normalizeText(item.Provincia).includes(typed))
  );
}

function normalizeSchedule(value) {
  if (!value) {
    return "Horario no disponible";
  }

  return value.replace(/L-D/gi, "Todos los días");
}

function scoreSchedule(value) {
  const normalized = (value || "").toUpperCase();

  if (normalized.includes("24H")) {
    return 3;
  }

  if (normalized.includes("L-D")) {
    return 2;
  }

  if (normalized) {
    return 1;
  }

  return 0;
}

function parseSpanishNumber(value) {
  return Number.parseFloat(String(value || "").replace(",", "."));
}

function parseStationCoordinates(station) {
  const latitude = parseSpanishNumber(station.Latitud);
  const longitude = parseSpanishNumber(station["Longitud (WGS84)"]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function computeStationCentroid(stations) {
  const points = stations
    .map(parseStationCoordinates)
    .filter(Boolean);

  if (!points.length) {
    return null;
  }

  const aggregate = points.reduce(
    (accumulator, point) => ({
      latitude: accumulator.latitude + point.latitude,
      longitude: accumulator.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: aggregate.latitude / points.length,
    longitude: aggregate.longitude / points.length,
  };
}

function filterStationsByTravelTime(stations, centerPoint) {
  const maxDriveMinutes = getDriveTimeLimit();
  return stations.filter((station) => {
    const coords = parseStationCoordinates(station);
    if (!coords) {
      return false;
    }

    return estimateDriveMinutes(haversineDistanceKm(centerPoint, coords)) <= maxDriveMinutes;
  });
}

function estimateDriveMinutes(distanceKm) {
  return Math.round((distanceKm * ROAD_DISTANCE_FACTOR * 60) / AVERAGE_DRIVE_SPEED_KMH);
}

function haversineDistanceKm(from, to) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function formatDate(value) {
  const parsed = new Date(String(value || "").replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return value || "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatNumber(value, maximumFractionDigits) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits,
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchJson(path, options = {}) {
  const remoteUrl = buildOfficialApiUrl(path);
  if (remoteUrl) {
    try {
      const remoteResponse = await fetch(remoteUrl, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
      });

      if (remoteResponse.ok) {
        return remoteResponse.json();
      }
    } catch (error) {
      console.warn("Fallo consultando la API oficial directamente.", error);
    }
  }

  let lastError = null;

  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo conectar con la API");
}

function buildOfficialApiUrl(path) {
  if (path === "/municipios") {
    return `${REMOTE_BASE}/Listados/Municipios/`;
  }

  if (path === "/provincias") {
    return `${REMOTE_BASE}/Listados/Provincias/`;
  }

  if (path === "/productos") {
    return `${REMOTE_BASE}/Listados/ProductosPetroliferos/`;
  }

  if (path.startsWith("/estaciones?")) {
    const params = new URLSearchParams(path.slice("/estaciones?".length));
    const productId = params.get("productId");
    const municipalityId = params.get("municipioId");
    const provinceId = params.get("provinciaId");

    if (!productId) {
      return null;
    }

    if (provinceId) {
      return `${REMOTE_BASE}/EstacionesTerrestres/FiltroProvinciaProducto/${encodeURIComponent(
        provinceId,
      )}/${encodeURIComponent(productId)}`;
    }

    if (municipalityId) {
      return `${REMOTE_BASE}/EstacionesTerrestres/FiltroMunicipioProducto/${encodeURIComponent(
        municipalityId,
      )}/${encodeURIComponent(productId)}`;
    }
  }

  return null;
}

async function geocodeMunicipalityCenter(municipality, signal) {
  const query = encodeURIComponent(
    `${municipality.Municipio}, ${municipality.Provincia}, España`,
  );
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=es&limit=1&q=${query}`,
    {
      signal,
      headers: {
        "Accept-Language": "es",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed with HTTP ${response.status}`);
  }

  const matches = await response.json();
  const match = matches[0];

  if (!match) {
    return null;
  }

  return {
    latitude: Number.parseFloat(match.lat),
    longitude: Number.parseFloat(match.lon),
  };
}

async function requestCurrentLocation() {
  if (!("geolocation" in navigator)) {
    setStatus("Tu navegador no permite acceder a la ubicación.");
    locationHint.textContent = "Activa la ubicación del navegador o busca por municipio.";
    return;
  }

  if (!window.isSecureContext) {
    setStatus("La ubicación solo funciona en una web segura (HTTPS) o en localhost.");
    locationHint.textContent =
      "Abre la web en HTTPS o usa el buscador por municipio mientras tanto.";
    return;
  }

  useLocationButton.disabled = true;
  useLocationButton.textContent = "Buscando...";
  setStatus("Esperando permiso para usar tu ubicación...");

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });
    });

    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const place = await reverseGeocode(coords);
    await ensureProvincesLoaded();

    const province = resolveProvince(
      place.province || place.region || place.county || "",
    );

    if (!province) {
      throw new Error("No se pudo resolver la provincia actual");
    }

    state.searchMode = "location";
    state.currentCoords = coords;
    state.currentProvince = province;
    state.currentLocationLabel = place.locality
      ? `${place.locality} (${province.Provincia})`
      : `tu ubicación en ${province.Provincia}`;
    nearbyCheckbox.checked = true;
    saveFilters();

    updateLocationUi();
    await loadStations();
  } catch (error) {
    console.error(error);
    setStatus("No he podido usar tu ubicación ahora mismo.");
    locationHint.textContent =
      "Prueba otra vez o usa el buscador de municipio como alternativa.";
    disableLocationMode();
  } finally {
    useLocationButton.disabled = false;
    updateLocationUi();
  }
}

async function ensureProvincesLoaded() {
  if (state.provinces.length) {
    return;
  }

  const provinces = await fetchJson("/provincias");
  state.provinces = provinces.map((item) => ({
    ...item,
    IDProvincia: item.IDProvincia || item.IDPovincia,
  }));
}

async function reverseGeocode(coords) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${encodeURIComponent(
      coords.latitude,
    )}&lon=${encodeURIComponent(coords.longitude)}`,
    {
      headers: {
        "Accept-Language": "es",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const address = payload.address || {};

  return {
    locality:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.hamlet ||
      "",
    province: address.province || address.state || "",
    region: address.state_district || "",
    county: address.county || "",
  };
}

function disableLocationMode() {
  state.searchMode = "municipality";
  state.currentCoords = null;
  state.currentProvince = null;
  state.currentLocationLabel = "";
  updateLocationUi();
}

function updateLocationUi() {
  const usingLocation = state.searchMode === "location" && state.currentCoords;
  useLocationButton.textContent = usingLocation
    ? "Dejar de usar mi ubicación"
    : "Usar mi ubicación";
  locationHint.textContent = usingLocation
    ? `Buscando cerca de ${state.currentLocationLabel}.`
    : "Si lo permites, te mostraré gasolineras cercanas a donde estés.";
  updateDriveTimeUi();
  updateFiltersSummary();
}

function buildLoadedStatus(visibleCount, searchLabel) {
  const brandLabel = brandSelect.value ? ` de ${brandSelect.options[brandSelect.selectedIndex]?.textContent || brandSelect.value}` : "";
  const nearbyLabel =
    state.searchContext?.isNearbyMode || state.searchContext?.isLocationMode
      ? " y alrededores"
      : "";

  return `${visibleCount} gasolineras${brandLabel} para ${
    selectedFuelLabel.textContent.replace("Combustible activo: ", "") || "este combustible"
  } en ${searchLabel}${nearbyLabel}.`;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register(`./sw.js?v=${APP_VERSION}`, { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}

function updateFiltersSummary() {
  const parts = [];
  const municipality = municipioInput.value.trim();
  const brand = brandSelect.value
    ? brandSelect.options[brandSelect.selectedIndex]?.textContent
    : "";
  const fuel = fuelSelect.options[fuelSelect.selectedIndex]?.textContent || "";

  if (state.searchMode === "location" && state.currentLocationLabel) {
    parts.push(state.currentLocationLabel);
  } else if (municipality) {
    parts.push(municipality);
  }

  if (brand) {
    parts.push(brand);
  }

  if (fuel) {
    parts.push(fuel);
  }

  if (nearbyCheckbox.checked || state.searchMode === "location") {
    parts.push(`${getDriveTimeLimit()} min`);
  }

  filtersSummary.textContent = parts.join(" · ") || "Toca para abrir";
}

function collapseFiltersAfterSearch(keepFiltersOpen = false) {
  if (keepFiltersOpen) {
    return;
  }

  if (window.innerWidth <= 900) {
    controlsPanel.classList.add("collapsed");
    syncFiltersPanel();
  }
}

function syncFiltersPanel() {
  const isCollapsed = controlsPanel.classList.contains("collapsed");
  filtersToggleButton.hidden = false;
  filtersToggleLabel.textContent = isCollapsed ? "Filtros" : "Ocultar filtros";
  filtersToggleButton.setAttribute("aria-expanded", String(!isCollapsed));
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getDriveTimeLimit() {
  return clampDriveMinutes(Number.parseInt(driveTimeRange.value, 10));
}

function clampDriveMinutes(value) {
  const min = Number.parseInt(driveTimeRange.min, 10) || 5;
  const max = Number.parseInt(driveTimeRange.max, 10) || 60;
  const safeValue = Number.isFinite(value) ? value : DEFAULT_DRIVE_MINUTES;
  return Math.min(max, Math.max(min, safeValue));
}

function updateDriveTimeUi() {
  const minutes = getDriveTimeLimit();
  const min = Number.parseInt(driveTimeRange.min, 10) || 5;
  const max = Number.parseInt(driveTimeRange.max, 10) || 60;
  const progress = `${((minutes - min) / (max - min)) * 100}%`;
  
  // Actualizar el valor del input
  driveTimeRange.value = String(minutes);
  
  // Actualizar el texto visible
  driveTimeValue.textContent = `${minutes} min`;
  
  // Actualizar variables CSS
  driveTimeRange.style.setProperty("--range-progress", progress);
  driveTimeRange.style.setProperty("--range-current", progress);
  driveTimeRange.style.setProperty("--value", minutes);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme =
    savedTheme ||
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  setTheme(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(isDark ? "dark" : "light");
  themeToggleButton.setAttribute("aria-pressed", String(isDark));
  themeToggleButton.setAttribute(
    "aria-label",
    isDark ? "Activar modo claro" : "Activar modo oscuro",
  );
  trackEvent("toggle_theme", { theme: isDark ? "dark" : "light" });
}

function setupAnalytics() {
  if (!GA_ENABLED || typeof window === "undefined") {
    return;
  }

  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent !== "accepted") {
    showCookieBanner();
    return;
  }

  if (window.gtag) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: true,
  });
}

function showCookieBanner() {
  if (document.querySelector("#cookieBanner")) {
    return;
  }

  const banner = document.createElement("div");
  banner.id = "cookieBanner";
  banner.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:1200;background:var(--panel-strong);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;box-shadow:var(--shadow)";
  banner.innerHTML = `
    <p style="margin:0;font-size:.82rem;color:var(--muted);line-height:1.45;max-width:780px">
      Usamos cookies de analítica (Google Analytics) para medir visitas y mejorar la web. Puedes aceptar o rechazar.
    </p>
    <div style="display:flex;gap:8px">
      <button type="button" id="cookieReject" class="ghost-button" style="border-color:rgba(248,113,113,.5);color:#c74848">Rechazar</button>
      <button type="button" id="cookieAccept" class="ghost-button" style="border-color:rgba(74,222,128,.55);color:#2f9e44">Aceptar</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.querySelector("#cookieReject")?.addEventListener("click", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "denied");
    banner.remove();
  });

  document.querySelector("#cookieAccept")?.addEventListener("click", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    banner.remove();
    setupAnalytics();
  });
}

function trackEvent(eventName, params = {}) {
  if (!GA_ENABLED || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

function trackMapClick(provider, station) {
  trackEvent("click_map_directions", {
    provider,
    station_brand: station.Rótulo || "(sin_marca)",
    station_city: station.Municipio || "(sin_municipio)",
    station_province: station.Provincia || "(sin_provincia)",
  });
}
