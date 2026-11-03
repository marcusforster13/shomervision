# Lista objetos, hierarquia, materiais, animações e caixas do .blend (em metros, z para cima).
import bpy
from mathutils import Vector
sc = bpy.context.scene
print("CENA", sc.name, "unidade", sc.unit_settings.system, sc.unit_settings.scale_length, "quadros", sc.frame_start, sc.frame_end)
def box(o):
    lo = Vector((1e9,)*3); hi = Vector((-1e9,)*3)
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    return [round(v,3) for v in lo], [round(v,3) for v in hi]
def walk(o, d):
    info = f"{'  '*d}{o.name} [{o.type}]"
    if o.type == 'MESH':
        lo, hi = box(o)
        info += f" v={len(o.data.vertices)} mats={[m.name for m in o.data.materials if m]} min={lo} max={hi}"
    if o.animation_data and o.animation_data.action:
        info += f" ANIM={o.animation_data.action.name}"
    if o.constraints: info += f" constr={[c.type for c in o.constraints]}"
    if o.modifiers: info += f" mods={[m.type for m in o.modifiers]}"
    print(info)
    for c in o.children: walk(c, d+1)
for o in sc.objects:
    if o.parent is None: walk(o, 0)
print("ACOES", [(a.name, [round(x) for x in a.frame_range]) for a in bpy.data.actions])
print("COLECOES", [(c.name, len(c.objects), c.hide_render) for c in bpy.data.collections])
print("IMAGENS", [(i.name, tuple(i.size)) for i in bpy.data.images])
