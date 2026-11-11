# Reads the node positions, colours and edges of the constellation out of the current hoodie back print, so other goods can reuse it.
# usage: python -I hoodie-net.py <back.png> <out.json>
import json, sys, itertools
import cv2, numpy as np

im = cv2.imread(sys.argv[1], cv2.IMREAD_UNCHANGED).astype(float)
b, g, r, a = (im[..., i] for i in range(4))
sat = (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)) * (a > 100)
# the network is the top part of the print; nodes are the saturated (or pure white) blobs
y0, y1 = int(im.shape[0] * 0.1), int(im.shape[0] * 0.45)
mask = np.zeros(a.shape, np.uint8)
mask[y0:y1] = (((sat > 60) | ((r > 235) & (g > 235) & (b > 235) & (a > 200))) * 255)[y0:y1].astype(np.uint8)
n, lab, st, cen = cv2.connectedComponentsWithStats(mask)
nodes = []
for i in range(1, n):
    x, y, w, h, area = st[i]
    if area < 30 or w > 60: continue
    pix = lab == i
    ring = area < 0.55 * w * h  # hollow node
    nodes.append(dict(x=float(round(cen[i][0], 1)), y=float(round(cen[i][1], 1)), r=float(max(w, h)) / 2, ring=bool(ring), rgb=[int(r[pix].mean()), int(g[pix].mean()), int(b[pix].mean())]))
# an edge is wherever the grey line pixels run the whole way between two nodes
lum = (r + g + b) / 3
line = (a > 40) & (sat < 40) & (lum > 45) & (lum < 230)
edges = []
for (i, p), (j, q) in itertools.combinations(enumerate(nodes), 2):
    d = np.hypot(q["x"] - p["x"], q["y"] - p["y"])
    if d > 700: continue
    ts = np.linspace(0, 1, int(d))[int(p["r"] + 6):-int(q["r"] + 6) or None]
    hits = [line[max(0, int(p["y"] + (q["y"] - p["y"]) * t) - 2):int(p["y"] + (q["y"] - p["y"]) * t) + 3, max(0, int(p["x"] + (q["x"] - p["x"]) * t) - 2):int(p["x"] + (q["x"] - p["x"]) * t) + 3].any() for t in ts]
    if hits and np.mean(hits) > 0.97: edges.append([i, j])
json.dump(dict(size=im.shape[1], nodes=nodes, edges=edges), open(sys.argv[2], "w"), indent=1)
print(len(nodes), "nodes", len(edges), "edges")
for k in nodes: print(k)
print(edges)
