const REMOTE_BASE =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes";
const CANONICAL_HOST = "gasolinabarata.me";
const LEGACY_HOSTS = new Set(["gasoprice.nheu.dev"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (LEGACY_HOSTS.has(url.hostname)) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/municipios") {
      return proxyJson("/Listados/Municipios/");
    }

    if (url.pathname === "/api/provincias") {
      return proxyJson("/Listados/Provincias/");
    }

    if (url.pathname === "/api/productos") {
      return proxyJson("/Listados/ProductosPetroliferos/");
    }

    if (url.pathname === "/api/estaciones") {
      const municipioId = url.searchParams.get("municipioId");
      const provinciaId = url.searchParams.get("provinciaId");
      const productId = url.searchParams.get("productId");

      if (!productId || (!municipioId && !provinciaId)) {
        return json(
          { error: "Missing productId and municipioId or provinciaId" },
          400,
        );
      }

      if (provinciaId) {
        return proxyJson(
          `/EstacionesTerrestres/FiltroProvinciaProducto/${encodeURIComponent(
            provinciaId,
          )}/${encodeURIComponent(productId)}`,
        );
      }

      return proxyJson(
        `/EstacionesTerrestres/FiltroMunicipioProducto/${encodeURIComponent(
          municipioId,
        )}/${encodeURIComponent(productId)}`,
      );
    }

    return env.ASSETS.fetch(request);
  },
};

async function proxyJson(path) {
  const response = await fetch(`${REMOTE_BASE}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}
