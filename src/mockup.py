# Approval mockups for the all-over-print bags (Fourthwall can't render these server-side).
# The blank white bag photo supplies the shading: art is warped onto each panel, multiplied by the photo's light, and the black trims
# (straps, zips, piping) are kept from the photo.
# usage, from the repo root: uv run --no-project --with numpy --with opencv-python-headless python -I src/mockup.py src/blanks art
import sys, cv2, numpy as np

blanks, out = sys.argv[1:3]
ART = lambda n: cv2.imread(f"{out}/{n.split('-')[0]}/{n}.png", cv2.IMREAD_UNCHANGED)[..., :3].astype(np.float32) / 255
NIGHT = np.array([0x17, 0x0D, 0x0B], np.float32) / 255  # BGR of #0b0d17


def bag_mask(img, rect, k=2):
    """GrabCut on the photo at its own size (fast), mask scaled up to the working size."""
    full, img, rect = img.shape, cv2.resize(img, None, fx=1 / k, fy=1 / k, interpolation=cv2.INTER_AREA), tuple(v // k for v in rect)
    m = np.zeros(img.shape[:2], np.uint8); bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, m, rect, bg, fg, 6, cv2.GC_INIT_WITH_RECT)
    m = np.where((m == 1) | (m == 3), 1, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    return cv2.GaussianBlur(cv2.resize((lab == 1 + np.argmax(st[1:, 4])).astype(np.float32), (full[1], full[0])), (5, 5), 0)


def composite(img, layers, bag, trim=0.3, gain=1.0):
    """layers: [(rgb float image already in photo space, mask)]; bag: mask of the whole printed surface (gets the night colour)."""
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    ref = np.percentile(L[bag > 0.5], 90)
    shade = np.clip(L / ref, 0, 1.25)[..., None] ** 1.15
    base = np.broadcast_to(NIGHT, img.shape).copy()
    for rgb, m in layers: base = base * (1 - m[..., None]) + rgb * m[..., None]
    lit = base * shade * gain + np.clip(L - ref * 0.97, 0, 1)[..., None] * 0.55  # keep a little sheen on the fabric
    keep = np.clip((L - trim) / 0.08, 0, 1) * bag  # dark trims (straps, zips, piping) stay as photographed
    keep = cv2.GaussianBlur(keep, (3, 3), 0)[..., None]
    res = img.astype(np.float32) / 255 * (1 - keep) + lit * keep
    return (np.clip(res, 0, 1) * 255).astype(np.uint8)


def warp_quad(art, quad, shape):
    q = np.float32(quad); side = int(max(np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[1])) * 1.3)
    art = cv2.resize(art, (side, int(side * art.shape[0] / art.shape[1])), interpolation=cv2.INTER_AREA); h, w = art.shape[:2]
    H = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    return cv2.warpPerspective(art, H, (shape[1], shape[0]), flags=cv2.INTER_LINEAR), cv2.warpPerspective(np.ones((h, w), np.float32), H, (shape[1], shape[0]))


def warp_bulge(art, box, shape, a=0.55):
    """art onto a puffy front panel: the middle comes forward, so it's magnified relative to the edges."""
    xl, yt, xr, yb = box
    art = cv2.resize(art, (int((xr - xl) * 1.3), int((yb - yt) * 1.3)), interpolation=cv2.INTER_AREA); h, w = art.shape[:2]; ys, xs = np.mgrid[0:shape[0], 0:shape[1]].astype(np.float32)
    t = np.clip((xs - xl) / (xr - xl), 0, 1) * 2 - 1
    u = 0.5 + 0.5 * np.arcsin(np.clip(t * np.sin(np.pi * a / 2), -1, 1)) / (np.pi * a / 2)
    v = (ys - yt) / (yb - yt)
    m = ((xs >= xl) & (xs <= xr) & (v >= 0) & (v <= 1)).astype(np.float32)
    return cv2.remap(art, (u * (w - 1)).astype(np.float32), (v * (h - 1)).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE), m


def tombstone(shape, xl, xr, spring, top, yb):
    m = np.zeros(shape[:2], np.uint8); cx, rx = (xl + xr) / 2, (xr - xl) / 2
    cv2.rectangle(m, (int(xl), int(spring)), (int(xr), int(yb)), 1, -1)
    cv2.ellipse(m, (int(cx), int(spring)), (int(rx), int(spring - top)), 0, 180, 360, 1, -1)
    return cv2.GaussianBlur(m.astype(np.float32), (3, 3), 0)


def rounded_quad(shape, quad, r=14):
    m = np.zeros(shape[:2], np.uint8); cv2.fillConvexPoly(m, np.int32(quad), 1)
    m = cv2.erode(m, np.ones((r, r), np.uint8)); m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r)))
    return cv2.GaussianBlur(m.astype(np.float32), (3, 3), 0)


up = lambda img, k=2: cv2.resize(img, None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)

# ── backpack, straight on (backpack_2): front panel is a rectangle with an elliptical top
img = up(cv2.imread(f"{blanks}/backpack_2.jpg")); K = 2
bag = bag_mask(img, (110 * K, 120 * K, 500 * K, 690 * K))
front = tombstone(img.shape, 160 * K, 578 * K, 352 * K, 158 * K, 788 * K) * bag
rgb, m = warp_bulge(ART("backpack-front"), (160 * K, 150 * K, 578 * K, 790 * K), img.shape)
cv2.imwrite(f"{out}/backpack/mockup.jpg", composite(img, [(rgb, m * front)], bag), [cv2.IMWRITE_JPEG_QUALITY, 92])

# ── duffle (duffle_0): the end panel faces us; the long front panel recedes to the left
img = up(cv2.imread(f"{blanks}/duffle_0.jpg"))
bag = bag_mask(img, (70 * K, 190 * K, 600 * K, 570 * K))
end_q = [[298 * K, 398 * K], [643 * K, 366 * K], [652 * K, 700 * K], [297 * K, 752 * K]]
top_q = [[98 * K, 214 * K], [414 * K, 193 * K], [645 * K, 366 * K], [298 * K, 398 * K]]
side_q = [[100 * K, 228 * K], [298 * K, 398 * K], [297 * K, 752 * K], [92 * K, 572 * K]]  # the 22 in long side, receding to the left
# the bag is the three faces we can see; GrabCut only trims them to the real outline (it also grabs the shadow on the table)
back_q = [[640 * K, 360 * K], [670 * K, 378 * K], [670 * K, 692 * K], [650 * K, 704 * K]]  # sliver of the far side, right of the end panel
faces = np.maximum.reduce([rounded_quad(img.shape, q, 20) for q in (end_q, top_q, side_q, back_q)])
L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
lit_top = rounded_quad(img.shape, top_q, 24) * cv2.GaussianBlur((L > 0.84).astype(np.float32), (5, 5), 0)  # white fabric GrabCut lost against the pale wall
bag = np.minimum(np.maximum.reduce([bag, rounded_quad(img.shape, end_q, 30), lit_top]), cv2.dilate(faces, np.ones((9, 9), np.uint8)))
end, side = warp_quad(ART("duffle-end"), end_q, img.shape), warp_quad(ART("duffle-front"), side_q, img.shape)
cv2.imwrite(f"{out}/duffle/mockup.jpg", composite(img, [(side[0], side[1] * bag), (end[0], end[1] * rounded_quad(img.shape, end_q, 30))], bag), [cv2.IMWRITE_JPEG_QUALITY, 92])
print("ok")
