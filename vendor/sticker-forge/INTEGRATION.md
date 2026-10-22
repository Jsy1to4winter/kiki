# Sticker Forge integration

Source: CatsJuice/sticker-forge at 068caa49eef69745564a5debbc01bab3fcd31042 (MIT; upstream license retained).

The local adapter exports StickerRenderer and adds mountInGroup, getIntegratedMesh, isArtworkUVVisible, and a spring-return helper. mountInGroup moves the upstream meshes and lights into a supplied Three.js Group and delegates all visible rendering to the host renderer. It does not replace the upstream vertex/fragment/custom-depth shaders, alpha-silhouette clipping or geometry preparation. The upstream private renderer stays off-screen; it does not display a second image overlay.

The reference lanyard texture was edited to be transparent and blank. A second native Sticker Forge renderer generates the exact text @Jsy_1to4 as separate artwork and attaches its mesh flush to the badge. These meshes remain fixed in left-sticker-group. Per the user's latest instruction, the application does not connect pointer gestures, click animations, entrance playback, peel progress or sounds to either badge or label. Ordinary journal-paper focusing uses GSAP timeline labels and quaternion interpolation; it never moves the badge.

The original blue interaction tint in the vendored renderer is changed to #08fff9. Other unused upstream options and examples remain as source documentation.

On CPU-only SwiftShader/llvmpipe, the two static meshes retain their native Sticker Forge geometry and prepared alpha textures but use a rough MeshStandardMaterial/custom alpha-depth material. This avoids evaluating unused animated finishes on a CPU and allows ordinary scene-light shadow reception. Hardware WebGL uses the original native shader. Neither path enables interaction or animation on the badge.
