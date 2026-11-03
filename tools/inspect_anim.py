import bpy
for a in bpy.data.actions:
    print("ACAO", a.name, "users", a.users)
    try:
        curves = a.fcurves
    except AttributeError:
        curves = [c for l in a.layers for s in l.strips for cb in s.channelbags for c in cb.fcurves]
    for fc in curves:
        ks = [(round(k.co[0]), round(k.co[1], 3)) for k in fc.keyframe_points]
        if len(ks) > 12: ks = ks[:6] + ['...'] + ks[-4:]
        print("   ", fc.data_path, fc.array_index, ks)
for n in ['Doca | tampa direita', 'Doca | tampa esquerda', 'Drone | decolagem e retorno', 'Camera | totem completo']:
    o = bpy.data.objects[n]
    print(n, 'loc', [round(v,3) for v in o.location], 'rot', [round(v,3) for v in o.rotation_euler], o.rotation_mode)
