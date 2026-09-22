# 3D Models — AlegrIA Module 2 (Futuro)

Drop `.glb` files exported from Blender here to replace the procedural fallback geometry.
The `ModelLoader` does a HEAD check at runtime — if the file exists, it loads the glTF;
otherwise it renders the procedural version.

## Directory structure

```
models/
├── library/      → hall.glb, bookshelf.glb, book-scattered.glb
├── museum/       → hall.glb, pedestal.glb, painting-frame.glb, column.glb
├── pedestal/     → pedestal.glb, book.glb
└── wormhole/     → tunnel.glb
```

## Export settings (Blender)

- Format: glTF Binary (.glb)
- Origin at base center
- Apply transforms before export
- Include materials (PBR metallic-roughness)
