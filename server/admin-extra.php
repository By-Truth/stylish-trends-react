<?php
/**
 * Stylish Trends – Admin Extra API
 * ===================================
 * ADDITIVE file. Does not modify api/index.php or includes/config.php.
 * Fills in the endpoints the admin panel needs that the original API
 * doesn't provide: categories CRUD, coupons CRUD, customers, review
 * moderation, settings, media/image upload, and CSV export.
 *
 * Uses simple query-string routing (?resource=...) so it drops in next
 * to index.php with no .htaccess changes required.
 *
 * Endpoints:
 *   GET    /api/admin-extra.php?resource=categories
 *   POST   /api/admin-extra.php?resource=categories            (admin)
 *   PUT    /api/admin-extra.php?resource=categories&id=5       (admin)
 *   DELETE /api/admin-extra.php?resource=categories&id=5       (admin)
 *
 *   GET    /api/admin-extra.php?resource=coupons                (admin)
 *   POST   /api/admin-extra.php?resource=coupons                (admin)
 *   PUT    /api/admin-extra.php?resource=coupons&id=5           (admin)
 *   DELETE /api/admin-extra.php?resource=coupons&id=5           (admin)
 *
 *   GET    /api/admin-extra.php?resource=customers               (admin)
 *   GET    /api/admin-extra.php?resource=customers&id=5          (admin)
 *
 *   GET    /api/admin-extra.php?resource=reviews                 (admin, all incl. unapproved)
 *   PUT    /api/admin-extra.php?resource=reviews&id=5            (admin) { is_approved }
 *   DELETE /api/admin-extra.php?resource=reviews&id=5            (admin)
 *
 *   GET    /api/admin-extra.php?resource=settings                (admin)
 *   PUT    /api/admin-extra.php?resource=settings                (admin) { key, value }
 *
 *   GET    /api/admin-extra.php?resource=media                   (admin)
 *   POST   /api/admin-extra.php?resource=media                   (admin) multipart upload
 *   DELETE /api/admin-extra.php?resource=media&file=x.jpg         (admin)
 *
 *   GET    /api/admin-extra.php?resource=export&type=orders|products (admin) -> CSV
 */

require_once __DIR__ . '/../includes/config.php';
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? (int)$_GET['id'] : null;
$method   = $_SERVER['REQUEST_METHOD'];
$rawBody  = file_get_contents('php://input');
$body     = json_decode($rawBody, true) ?? [];

// Export streams a CSV directly, so it must bypass jsonResponse's JSON header.
if ($resource === 'export' && $method === 'GET') {
    requireAdmin();
    exportCsv($_GET['type'] ?? 'orders');
    exit;
}
if ($resource === 'media' && $method === 'POST') {
    requireAdmin();
    uploadMedia();
    exit;
}

header('Content-Type: application/json');

match (true) {
    $resource === 'me' && $method === 'GET'            => jsonResponse(['user' => getCurrentUser()]),
    $resource === 'public-settings' && $method === 'GET' => getPublicSettings(),

    $resource === 'categories' && $method === 'GET'    => getCategories(),
    $resource === 'categories' && $method === 'POST'   => createCategory($body),
    $resource === 'categories' && $method === 'PUT'    => updateCategory($id, $body),
    $resource === 'categories' && $method === 'DELETE' => deleteCategory($id),

    $resource === 'coupons' && $method === 'GET'       => getCoupons(),
    $resource === 'coupons' && $method === 'POST'      => createCoupon($body),
    $resource === 'coupons' && $method === 'PUT'       => updateCoupon($id, $body),
    $resource === 'coupons' && $method === 'DELETE'    => deleteCoupon($id),

    $resource === 'customers' && $method === 'GET' && $id => getCustomer($id),
    $resource === 'customers' && $method === 'GET'        => getCustomers(),

    $resource === 'reviews' && $method === 'GET'       => getAllReviews(),
    $resource === 'reviews' && $method === 'PUT'       => moderateReview($id, $body),
    $resource === 'reviews' && $method === 'DELETE'    => deleteReview($id),

    $resource === 'settings' && $method === 'GET'      => getSettings(),
    $resource === 'settings' && $method === 'PUT'      => updateSettings($body),

    $resource === 'media' && $method === 'GET'         => getMedia(),
    $resource === 'media' && $method === 'DELETE'      => deleteMedia($_GET['file'] ?? ''),

    default => jsonResponse(['error' => 'Endpoint not found'], 404),
};

/* ================================================================
   CATEGORIES
   ================================================================ */
function getCategories(): void {
    $db = getDB();
    $rows = $db->query("
        SELECT c.*, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
    ")->fetchAll();
    jsonResponse(['categories' => $rows]);
}

function createCategory(array $data): void {
    requireAdmin();
    $db = getDB();
    $name = sanitize($data['name'] ?? '');
    if (!$name) jsonResponse(['error' => 'Name is required'], 422);
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
    $db->prepare('INSERT INTO categories (name, slug, image, parent_id, sort_order) VALUES (?,?,?,?,?)')
       ->execute([$name, $slug, $data['image'] ?? null, $data['parent_id'] ?? null, (int)($data['sort_order'] ?? 0)]);
    jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

function updateCategory(?int $id, array $data): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Category id required'], 422);
    $db = getDB();
    $fields = []; $params = [];
    foreach (['name','image','parent_id','sort_order'] as $key) {
        if (array_key_exists($key, $data)) { $fields[] = "$key = ?"; $params[] = $data[$key]; }
    }
    if (!$fields) jsonResponse(['error' => 'No fields to update'], 422);
    $params[] = $id;
    $db->prepare('UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    jsonResponse(['success' => true]);
}

function deleteCategory(?int $id): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Category id required'], 422);
    getDB()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ================================================================
   COUPONS
   ================================================================ */
function getCoupons(): void {
    requireAdmin();
    jsonResponse(['coupons' => getDB()->query('SELECT * FROM coupons ORDER BY created_at DESC')->fetchAll()]);
}

function createCoupon(array $data): void {
    requireAdmin();
    $db = getDB();
    $code = strtoupper(sanitize($data['code'] ?? ''));
    if (!$code || empty($data['value'])) jsonResponse(['error' => 'Code and value are required'], 422);
    $db->prepare('INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at, is_active) VALUES (?,?,?,?,?,?,?)')
       ->execute([
           $code,
           $data['type'] ?? 'percent',
           (float)$data['value'],
           (float)($data['min_order'] ?? 0),
           (int)($data['max_uses'] ?? 0),
           !empty($data['expires_at']) ? $data['expires_at'] : null,
           (int)($data['is_active'] ?? 1),
       ]);
    jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

function updateCoupon(?int $id, array $data): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Coupon id required'], 422);
    $db = getDB();
    $fields = []; $params = [];
    foreach (['type','value','min_order','max_uses','expires_at','is_active'] as $key) {
        if (array_key_exists($key, $data)) { $fields[] = "$key = ?"; $params[] = $data[$key]; }
    }
    if (!$fields) jsonResponse(['error' => 'No fields to update'], 422);
    $params[] = $id;
    $db->prepare('UPDATE coupons SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
    jsonResponse(['success' => true]);
}

function deleteCoupon(?int $id): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Coupon id required'], 422);
    getDB()->prepare('DELETE FROM coupons WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ================================================================
   CUSTOMERS
   ================================================================ */
function getCustomers(): void {
    requireAdmin();
    $rows = getDB()->query("
        SELECT u.id, u.name, u.email, u.phone, u.newsletter, u.created_at,
               COUNT(o.id) AS order_count, COALESCE(SUM(o.total),0) AS lifetime_value
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'customer'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ")->fetchAll();
    jsonResponse(['customers' => $rows]);
}

function getCustomer(int $id): void {
    requireAdmin();
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, phone, newsletter, created_at FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $customer = $stmt->fetch();
    if (!$customer) jsonResponse(['error' => 'Customer not found'], 404);

    $oStmt = $db->prepare("SELECT id, order_number, status, payment_status, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $oStmt->execute([$id]);
    $customer['orders'] = $oStmt->fetchAll();
    jsonResponse(['customer' => $customer]);
}

/* ================================================================
   REVIEWS (moderation)
   ================================================================ */
function getAllReviews(): void {
    requireAdmin();
    $rows = getDB()->query("
        SELECT r.*, p.name AS product_name
        FROM reviews r
        LEFT JOIN products p ON p.id = r.product_id
        ORDER BY r.created_at DESC
    ")->fetchAll();
    jsonResponse(['reviews' => $rows]);
}

function moderateReview(?int $id, array $data): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Review id required'], 422);
    getDB()->prepare('UPDATE reviews SET is_approved = ? WHERE id = ?')
           ->execute([(int)($data['is_approved'] ?? 0), $id]);
    jsonResponse(['success' => true]);
}

function deleteReview(?int $id): void {
    requireAdmin();
    if (!$id) jsonResponse(['error' => 'Review id required'], 422);
    getDB()->prepare('DELETE FROM reviews WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

/* ================================================================
   SETTINGS (key-value store — backs General / Shipping / WhatsApp / Payments pages)
   ================================================================ */
function getSettings(): void {
    requireAdmin();
    $rows = getDB()->query('SELECT `key`, `value` FROM settings')->fetchAll();
    $out = [];
    foreach ($rows as $row) {
        $out[$row['key']] = json_decode($row['value'], true) ?? $row['value'];
    }
    jsonResponse(['settings' => $out]);
}

function getPublicSettings(): void {
    // Deliberately unauthenticated: the storefront (WhatsApp float button,
    // free-shipping banner, footer contact info) needs these values before
    // anyone logs in. Only non-sensitive fields are exposed here — nothing
    // from the 'payments' key (bank account details, etc.) leaks through.
    $rows = getDB()->query("SELECT `key`, `value` FROM settings WHERE `key` IN ('whatsapp','shipping','general')")->fetchAll();
    $out = [];
    foreach ($rows as $row) {
        $out[$row['key']] = json_decode($row['value'], true) ?? $row['value'];
    }
    jsonResponse(['settings' => $out]);
}

function updateSettings(array $data): void {
    requireAdmin();
    $key = sanitize($data['key'] ?? '');
    if (!$key || !array_key_exists('value', $data)) jsonResponse(['error' => 'key and value are required'], 422);
    $value = is_array($data['value']) ? json_encode($data['value']) : (string)$data['value'];
    $db = getDB();
    $db->prepare('INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)')
       ->execute([$key, $value]);
    jsonResponse(['success' => true]);
}

/* ================================================================
   MEDIA (image upload + listing, backs Media Library + product image fields)
   ================================================================ */
function getMedia(): void {
    requireAdmin();
    $dir = realpath(__DIR__ . '/../images') ?: __DIR__ . '/../images';
    $files = [];
    foreach (glob($dir . '/*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE) as $f) {
        $files[] = [
            'name' => basename($f),
            'url'  => '/images/' . basename($f),
            'size' => filesize($f),
            'modified' => date('c', filemtime($f)),
        ];
    }
    usort($files, fn($a, $b) => strcmp($b['modified'], $a['modified']));
    jsonResponse(['media' => $files]);
}

function uploadMedia(): void {
    if (empty($_FILES['file'])) jsonResponse(['error' => 'No file uploaded'], 422);
    $file = $_FILES['file'];
    $allowed = ['jpg','jpeg','png','webp','gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) jsonResponse(['error' => 'Unsupported file type'], 422);
    if ($file['size'] > 5 * 1024 * 1024) jsonResponse(['error' => 'File too large (max 5MB)'], 422);

    $dir = __DIR__ . '/../images';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $safeName = uniqid('st-') . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $safeName)) {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }
    jsonResponse(['success' => true, 'url' => '/images/' . $safeName, 'name' => $safeName], 201);
}

function deleteMedia(string $file): void {
    $file = basename($file); // prevent path traversal
    $path = __DIR__ . '/../images/' . $file;
    if (is_file($path)) unlink($path);
    jsonResponse(['success' => true]);
}

/* ================================================================
   CSV EXPORT
   ================================================================ */
function exportCsv(string $type): void {
    $db = getDB();
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $type . '-export-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');

    if ($type === 'products') {
        $rows = $db->query('SELECT sku,name,price,compare_price,stock_qty,is_active,is_featured,is_new,created_at FROM products ORDER BY created_at DESC')->fetchAll();
        fputcsv($out, ['SKU','Name','Price','Compare Price','Stock','Active','Featured','New','Created At']);
        foreach ($rows as $r) fputcsv($out, $r);
    } else {
        $rows = $db->query('SELECT order_number,cust_name,cust_email,status,payment_status,payment_method,subtotal,shipping_fee,discount_amount,total,created_at FROM orders ORDER BY created_at DESC')->fetchAll();
        fputcsv($out, ['Order #','Customer','Email','Status','Payment Status','Payment Method','Subtotal','Shipping','Discount','Total','Created At']);
        foreach ($rows as $r) fputcsv($out, $r);
    }
    fclose($out);
}
