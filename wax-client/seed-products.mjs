/**
 * Seed script — crea 9 productos en el catálogo WAX via la API del backend.
 *
 * Requisitos:
 *   - Backend corriendo en http://localhost:5005
 *   - Node.js 18+ (usa fetch nativo y FormData)
 *
 * Uso:
 *   node seed-products.mjs
 */

const BASE_URL = 'http://localhost:5005/api';
const ADMIN_EMAIL = 'admin@wax.com';
const ADMIN_PASSWORD = 'Admin1234!';

const PRODUCTS = [
  {
    name: 'Bolso Arc Noir',
    description: 'Estructura rígida en resina negra con acabado satinado. Silueta de arco con cierre de presión magnética.',
    price: 38500,
    type: 'Bolso',
    brand: 'WAX',
    quantityInStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  },
  {
    name: 'Collar Vértice',
    description: 'Cadena de eslabones geométricos impresos en ABS con baño de latón envejecido.',
    price: 12800,
    type: 'Joyería',
    brand: 'WAX',
    quantityInStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  },
  {
    name: 'Cinturón Lattice',
    description: 'Malla estructural de nylon con hebilla de resina translúcida. Patrón de celosía paramétrica.',
    price: 19200,
    type: 'Cinturón',
    brand: 'WAX',
    quantityInStock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&q=80',
  },
  {
    name: 'Brazalete Torque',
    description: 'Brazalete rígido con torsión helicoidal. Impreso en PLA con pigmento termocrómico.',
    price: 9600,
    type: 'Joyería',
    brand: 'WAX',
    quantityInStock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f94658bd?w=600&q=80',
  },
  {
    name: 'Bolso Cloud Blanc',
    description: 'Volumen nuboso en polímero blanco con textura ondulada. Asa de cuero trenzado incluida.',
    price: 42000,
    type: 'Bolso',
    brand: 'WAX',
    quantityInStock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  },
  {
    name: 'Anillo Arco',
    description: 'Anillo de banda ancha con perfil arqueado. Resina epoxi en degradado ámbar-hueso.',
    price: 6400,
    type: 'Joyería',
    brand: 'WAX',
    quantityInStock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    name: 'Clutch Obsidiana',
    description: 'Embrague de mano de superficie facetada. Acabado negro mineral con cadena de aluminio.',
    price: 28900,
    type: 'Bolso',
    brand: 'WAX',
    quantityInStock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
  },
  {
    name: 'Pendientes Axis',
    description: 'Pendientes de gota asimétrica con perforación lineal. TPU flexible en tono porcelana.',
    price: 8200,
    type: 'Joyería',
    brand: 'WAX',
    quantityInStock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=600&q=80',
  },
  {
    name: 'Bolso Stud Noir',
    description: 'Bolso estructurado con tachuelas hexagonales en relieve. ABS negro con interior de microfibra.',
    price: 35700,
    type: 'Bolso',
    brand: 'WAX',
    quantityInStock: 7,
    imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
  },
];

async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar imagen: ${url}`);
  return response.blob();
}

async function login() {
  const jar = [];

  const response = await fetch(`${BASE_URL}/login?useCookies=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    redirect: 'manual',
  });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  if (setCookie.length === 0 && !response.ok) {
    throw new Error(`Login fallido: ${response.status} ${response.statusText}`);
  }

  // Extraer la cookie de autenticación
  const authCookie = (setCookie.length > 0 ? setCookie : [response.headers.get('set-cookie') ?? ''])
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');

  console.log('✓ Login exitoso');
  return authCookie;
}

async function createProduct(cookie, product) {
  console.log(`  Descargando imagen para "${product.name}"...`);
  const imageBlob = await fetchImageAsBlob(product.imageUrl);
  const filename = `${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;

  const form = new FormData();
  form.append('name', product.name);
  form.append('description', product.description);
  form.append('price', String(product.price));
  form.append('type', product.type);
  form.append('brand', product.brand);
  form.append('quantityInStock', String(product.quantityInStock));
  form.append('file', imageBlob, filename);

  const response = await fetch(`${BASE_URL}/Product`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error creando "${product.name}": ${response.status} — ${text}`);
  }

  const created = await response.json();
  return created;
}

async function main() {
  console.log('WAX — Seed de productos\n');

  let cookie;
  try {
    cookie = await login();
  } catch (err) {
    console.error('✗ No se pudo autenticar:', err.message);
    console.error('  Verifica que el backend esté corriendo en', BASE_URL);
    process.exit(1);
  }

  let created = 0;
  let failed = 0;

  for (const product of PRODUCTS) {
    try {
      const result = await createProduct(cookie, product);
      console.log(`✓ "${result.name}" creado (id: ${result.id})`);
      created++;
    } catch (err) {
      console.error(`✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResumen: ${created} creados, ${failed} fallidos de ${PRODUCTS.length} total.`);
}

main();
