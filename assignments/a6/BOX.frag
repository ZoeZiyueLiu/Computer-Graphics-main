/*This is your fragment shader for texture and normal mapping*/

#version 330 core

/*default camera matrices. do not modify.*/
layout (std140) uniform camera
{
    mat4 projection;    /*camera's projection matrix*/
    mat4 view;            /*camera's view matrix*/
    mat4 pvm;            /*camera's projection*view*model matrix*/
    mat4 ortho;            /*camera's ortho projection matrix*/
    vec4 position;        /*camera's position in world space*/
};

/*uniform variables*/
uniform float iTime;                    ////time
uniform sampler2D tex_albedo;            ////texture color
uniform sampler2D tex_normal;            ////texture normal

float time = 0.0;
vec2 hash2(vec2 v)
{
    vec2 rand = vec2(0.,0.);
    
    // Your implementation starts here

    //rand  = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    //rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);
    
    // Your implementation ends here
    rand = vec2(dot(v, vec2(127.1, 311.7)),
                dot(v, vec2(269.5, 183.1)));
    rand = -1.0 +2.0*fract(sin(rand)*43758.5453123);
    //rand = random2(0)
//    rand  = 50.0 * 1.05 * v * 0.3183099 + vec2(0.71, 0.113);

    return rand;
}
float perlin_noise(vec2 v)
{
    float noise = 0.0;
    // Your implementation starts here
    vec2 idx = floor(v);
    vec2 of = fract(v);
    vec2 m = of * of * (3. - 2. * of);
    float pg_0 = dot(v-idx, hash2(idx));
    float pg_1 = dot(v-(idx+vec2(1.0, 0.0)), hash2(idx+vec2(1.0, 0.0)));
    float pg_2 = dot(v-(idx+vec2(0.0, 1.0)), hash2(idx+vec2(0.0, 1.0)));
    float pg_3 = dot(v-(idx+vec2(1.0, 1.0)), hash2(idx+vec2(1.0, 1.0)));
    
//    noise = mix(mix(pg_0, pg_1, smoothstep(0.0, 1.0, _x_y.x)),
//                mix(pg_2, pg_3, smoothstep(0.0, 1.0, _x_y.x)), smoothstep(0.0, 1.0, _x_y.y));
    
    //noise = (1-_x_y.x)*(1-_x_y.y)*pg_0 + _x_y.x*(1-_x_y.y)+pg_1 + (1-_x_y.x)*_x_y.y*pg_2 + _x_y.x*_x_y.y*pg_3;
    noise = mix(mix(pg_0, pg_1,  m.x),
                    mix(pg_2, pg_3, m.x), m.y);
    
    // Your implementation ends here
    return noise;
}
//float noise( in vec3 x )
//{
//    float  z = x.z*64.0;
//    vec2 offz = vec2(0.317,0.123);
//    vec2 uv1 = x.xy + offz*floor(z);
//    vec2 uv2 = uv1  + offz;
//    return mix(textureLod( iChannel0, uv1 ,0.0).x,textureLod( iChannel0, uv2 ,0.0).x,fract(z))-0.5;
//}
float noiseOctave(vec2 v, int num)
{
    float sum = 0.0;
    // Your implementation starts here
    float ind = 0.0;
    for(int i=0; i<num; i++){
        sum = sum + pow(2., -ind)*perlin_noise(pow(2.,ind)*v);
        ind +=  1.0;
        
    }
    // Your implementation ends here
    return sum;
}
vec3 rotate(vec3 r, float v){ return vec3(r.x*cos(v)+r.z*sin(v),r.y,r.z*cos(v)-r.x*sin(v));}

float noise( in vec3 x )
{
    float  z = x.z*64.0;
    vec2 offz = vec2(0.317,0.123);
    vec2 uv1 = x.xy + offz*floor(z);
    vec2 uv2 = uv1  + offz;
    return mix(noiseOctave(uv1,6),noiseOctave(uv2,6),fract(z))-0.5;
}

float noises( in vec3 p){
    float a = 0.0;
    for(float i=1.0;i<6.0;i++){
        a += noise(p)/i;
        p = p*2.0 + vec3(0.0,a*0.001/i,a*0.0001/i);
    }
    return a;
}
float base( in vec3 p){
    return noise(p*0.00002)*1200.0;
}

float ground( in vec3 p){
    return base(p)+noises(p.zxy*0.00005+10.0)*40.0*(0.0-p.y*0.01)+p.y;
}

float clouds( in vec3 p){
    float b = base(p);
    p.y += b*0.5/abs(p.y) + 100.0;
    return noises(vec3(p.x*0.3+((time)*30.0),p.y,p.z)*0.00002)-max(p.y,0.0)*0.00009;
}
/*input variables*/
//// TODO: declare your input variables
in vec3 vtx_pos;
in vec4 vtx_color;
in vec2 vtx_uv;
in vec4 norma;
in vec3 tange;
/*output variables*/
out vec4 frag_color;

/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
const vec3 LightPosition = vec3(3, 1, 3);
const vec3 LightIntensity_p = vec3(1.0);
const vec3 LightIntensity = vec3(1);
const vec3 ka = 0.1*vec3(1., 1., 1.);
const vec3 kd = 1.0*vec3(1., 1., 1.);
const vec3 ks = vec3(2.);
const float n = 16.0;

void main()
{
    
//    time = iTime*5.0+floor(iTime*0.1)*150.0;
//    vec2 iResolution =vec2(1280.0, 960.0);
//
//    vec2 uv     = vtx_pos.xy/(iResolution.xx*0.5)-vec2(1.0,iResolution.y/iResolution.x);
//    vec3 campos   = vec3(30.0,500.0,time*8.0);
//         campos.y = 500.0-base(campos);
//    vec3 ray   = rotate(normalize(vec3(uv.x,uv.y-sin(time*0.05)*0.2-0.1,1.0).xyz),time*0.01);
//    //vec3 pos    = campos+ray;
//    vec3 pos    = campos+LightPosition;
//    vec3 sun    = vec3(0.0,0.6,-0.4);
//
//    // raymarch
//    float test  = 0.0;
//    float fog   = 0.0;
//    float dist  = 0.0;
//
//    vec3  p1 = vtx_pos;
//    for(float i=1.0;i<50.0;i++){
//        test  = ground(p1);
//        fog  += max(test*clouds(p1),fog*0.02);
//        p1   += ray*min(test,i*i*0.5);
//        dist += test;
//        if(abs(test)<10.0||dist>40000.0) break;
//    }
//
//    float l     = sin(dot(ray,sun));
//    vec3  light = vec3(l,0.0,-l)+ray.y*0.2;
//
//    float amb = smoothstep(-100.0,100.0,ground(p1+vec3(0.0,30.0,0.0)+sun*10.0))-smoothstep(1000.0,-0.0,p1.y)*0.7;
//    vec3  ground = vec3(0.30,0.30,0.25)+sin(p1*0.001)*0.01+noise(vec3(p1*0.002))*0.1+amb*0.7+light*0.01;
//
//    float f = smoothstep(0.0,800.0,fog);
//    vec3  cloud = vec3(0.70,0.72,0.70)+light*0.05+sin(fog*0.0002)*0.2+noise(p1)*0.05;
//
//    float h = smoothstep(10000.,40000.0,dist);
//    vec3  sky = cloud+ray.y*0.1-0.02;
//
//    vec4 fragColor = vec4(sqrt(smoothstep(0.2,1.0,mix(mix(ground,sky,h),cloud,f)-dot(uv,uv)*0.1)),1.0);

    
    
    bool use_normal_mapping = false;    ////TODO: set this flag to be true when you move from Step 2 to Step 3

    if(!use_normal_mapping){
        //// TODO (Step 1 and 2): texture with shading
        ////Here are some useful hints:
        ////Step 1.0: load the texture color from tex_albedo and then set it to frag_color
        vec2 uv = vtx_uv;
        vec4 tex_color = texture(tex_albedo, uv);
        
        ////Step 2.0: use the loaded texture color as the local material color and multiply the local color with the Lambertian shading model you implemented previously to render a textured and shaded sphere.
        vec3 norm = normalize(norma.xyz);
        vec3 l = normalize(LightPosition - vtx_pos.xyz);
        float ln = max(dot(l, norm),0.0);
        
//        vec3 v = normalize(position.xyz - vtx_pos.xyz);
//        vec3 r = normalize(reflect(-l, norm));
//        float vr = max(dot(v, r), 0.0);
        
        vec3 am = ka.xyz * LightIntensity.xyz;
        vec3 di = kd.xyz* LightIntensity.xyz * ln;
//        vec3 sp = ks.xyz * LightIntensity_p.xyz * pow(vr, n);
//        vec3 ph = am + di + sp;
        vec3 la = am + di;
        ////The way to read a texture is to call texture(texture_name,uv). It will return a vec4.

        vec4 col = vec4(1.f);
        //vec3 t_s_col = la * tex_color.rgb;
        //vec3 t_s_col = tex_color.rgb + fragColor.xyz;
        //t_s_col = vec3(1.0, 0.0, 0.0);
        vec3 t_s_col = tex_color.rgb;
        
        frag_color = vec4(t_s_col, 1);
    }
    else{
        //// TODO (Step 3): texture with normal mapping
        ////Here are some useful hints:
        ////Step 3.0: load the texture color from tex_albedo
        vec2 uv = vtx_uv;
        vec4 tex_color = texture(tex_albedo, uv);
        ////Step 3.1: load the texture normal from tex_normal, and remap each component from [0, 1] to [-1, 1] (notice that currently the loaded normal is in the local tangent space)
        vec4 tex_norm = texture(tex_normal, uv);
        vec3 tex_norma = 2.0 *tex_norm.xyz - vec3(1.0, 1.0, 1.0);
        vec3 N = normalize(norma.xyz);
//        vec3 T = normalize(tange.xyz - dot(norma.xyz, tange)*norma.xyz);
        vec3 T = normalize(tange.xyz);
        vec3 B = cross(N, T);
        ////Step 3.2: calculate the TBN matrix using the vertex normal and tangent
        mat3 TBN = mat3(T, B, N);
        
        ////Step 3.3: transform the texture normal from the local tangent space to the global world space
        vec3 tex_n = normalize(TBN*tex_norma);
        ////Step 3.4 and following: use the transformed normal and the loaded texture color to conduct the further lighting calculation
        vec3 l = normalize(LightPosition - vtx_pos.xyz);
        float ln = max(dot(l, tex_n),0.0);
        
        vec3 v = normalize(position.xyz - vtx_pos.xyz);
        vec3 r = normalize(reflect(-l, tex_n));
        float vr = max(dot(v, r), 0.0);
        
        vec3 am = ka.xyz * LightIntensity.xyz;
        vec3 di = kd.xyz* LightIntensity.xyz * ln;
        vec3 sp = ks.xyz * LightIntensity_p.xyz * pow(vr, n);
        vec3 ph = am + di + sp;
        vec3 la = am + di;
        ////The way to read a texture is to call texture(texture_name,uv). It will return a vec4.

        //vec3 t_s_col = la * tex_color.rgb;
        vec3 t_s_col = tex_color.rgb;
        
        ////The way to declare a 3x3 matrix is mat3 mat=mat3(v0,v1,v2);
        ////The way to read a texture is to call texture(texture_name,uv). It will return a vec4.
        ////The way to calculate cross product is to call cross(u1,u2);
        vec4 col = vec4(1.f);

        frag_color = vec4(t_s_col.rgb, 1);
    }
}
