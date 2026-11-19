const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const REMOTE_BASE =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);

      if (url.pathname.startsWith("/api/")) {
        await handleApi(url, res);
        return;
      }

      serveStatic(url.pathname, res);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Server error" });
    }
  })
  .listen(PORT, () => {
    console.log(`Gasoprice running on http://localhost:${PORT}`);
  });

async function handleApi(url, res) {
  if (url.pathname === "/api/municipios") {
    return proxyJson("/Listados/Municipios/", res);
  }

  if (url.pathname === "/api/provincias") {
    return proxyJson("/Listados/Provincias/", res);
  }

  if (url.pathname === "/api/productos") {
    return proxyJson("/Listados/ProductosPetroliferos/", res);
  }

  if (url.pathname === "/api/estaciones") {
    const municipalityId = url.searchParams.get("municipioId");
    const provinceId = url.searchParams.get("provinciaId");
    const productId = url.searchParams.get("productId");

    if (!productId || (!municipalityId && !provinceId)) {
      return sendJson(res, 400, {
        error: "Missing productId and municipioId or provinciaId",
      });
    }

    if (provinceId) {
      return proxyJson(
        `/EstacionesTerrestres/FiltroProvinciaProducto/${encodeURIComponent(
          provinceId,
        )}/${encodeURIComponent(productId)}`,
        res,
      );
    }

    return proxyJson(
      `/EstacionesTerrestres/FiltroMunicipioProducto/${encodeURIComponent(
        municipalityId,
      )}/${encodeURIComponent(productId)}`,
      res,
    );
  }

  return sendJson(res, 404, { error: "Not found" });
}

async function proxyJson(remotePath, res) {
  const response = await fetch(`${REMOTE_BASE}${remotePath}`, {
    headers: { Accept: "application/json" },
  });

  const text = await response.text();

  res.writeHead(response.ok ? 200 : response.status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(text);
}

function serveStatic(rawPathname, res) {
  const pathname = rawPathname === "/" ? "/index.html" : rawPathname;
  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    return sendText(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      return sendText(res, 404, "Not found");
    }

    res.writeHead(200, {
      "Content-Type":
        MIME_TYPES[path.extname(filePath).toLowerCase()] ||
        "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}
