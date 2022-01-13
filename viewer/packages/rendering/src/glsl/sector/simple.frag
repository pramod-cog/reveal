#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: NodeAppearance = require('../base/nodeAppearance.glsl')
#pragma glslify: determineNodeAppearance = require('../base/determineNodeAppearance.glsl');
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../base/determineColor.glsl');
#pragma glslify: isClipped = require('../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: GeometryType = require('../base/geometryTypes.glsl');

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 treeIndexTextureSize;

in float v_treeIndex;
in vec3 v_color;
in vec3 v_normal;

uniform int renderMode;

in vec3 vViewPosition;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }
    if (isClipped(appearance, vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, appearance);
    updateFragmentColor(renderMode, color, v_treeIndex, v_normal, gl_FragCoord.z, matCapTexture, GeometryType.Quad);
}
