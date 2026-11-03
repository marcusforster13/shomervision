import bpy, sys
out = sys.argv[sys.argv.index("--") + 1]
img = bpy.data.images["led-shomer-vision.png"]
img.filepath_raw = out
img.file_format = "PNG"
img.save()
print("SALVO", img.size[:])
