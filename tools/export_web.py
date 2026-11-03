# Exporta o Shomer Vision para a web: quadro 1 (doca fechada, drone pousado), uma câmera dome em cada face, sem
# estúdio, luzes e câmera, subdivisão desligada, texturas em até 1024 px (JPEG). As animações ficam de fora: a página
# comanda tampas, drone e hélices pelo código.
#   blender -b <arquivo.blend> --python tools/export_web.py -- <saida.glb>
import sys, math, bpy
from mathutils import Matrix
out = sys.argv[sys.argv.index("--") + 1]
sc = bpy.context.scene
sc.frame_set(1)
for o in list(sc.objects):
    if o.type in {"LIGHT", "CAMERA"} or o.name.startswith("Estudio"):
        bpy.data.objects.remove(o, do_unlink=True)
# a câmera dome da frente, copiada para as outras três faces (giro em torno do eixo do totem)
dome = [o for o in sc.objects if o.name.startswith("Camera dome")]
for k, ang in enumerate([90, 180, 270]):
    R = Matrix.Rotation(math.radians(ang), 4, "Z")
    for o in dome:
        c = o.copy()
        c.data = o.data
        c.name = f"{o.name} | face {k + 2}"
        c.matrix_world = R @ o.matrix_world
        for col in o.users_collection:
            col.objects.link(c)
for o in sc.objects:
    for m in o.modifiers:
        if m.type == "SUBSURF":
            m.levels = 0
            m.render_levels = 0
    if o.animation_data:
        o.animation_data.action = None
for img in bpy.data.images:
    w, h = img.size
    lim = 1440 if "shomer" in img.name.lower() else 1024
    if max(w, h) > lim:
        k = lim / max(w, h)
        img.scale(max(1, int(w * k)), max(1, int(h * k)))
        print("IMG", img.name, (w, h), "->", tuple(img.size))
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=85, export_animations=False, export_apply=True, export_cameras=False, export_lights=False)
