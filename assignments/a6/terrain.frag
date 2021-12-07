#version 330 core

layout (std140) uniform camera
{
	mat4 projection;
	mat4 view;
	mat4 pvm;
	mat4 ortho;
	vec4 position;
};

/*uniform variables*/
uniform float iTime;					////time

/*input variables*/
in vec3 vtx_pos;

/*input variables*/
out vec4 frag_color;

///////////// Part 1a /////////////////////
/* Create a function that takes in an xy coordinate and returns a 'random' 2d vector. (There is no right answer)
   Feel free to find a hash function online. Use the commented function to check your result */
vec2 hash2(vec2 v)
{
	vec2 rand = vec2(0,0);
	
	// Your implementation starts here

	//rand  = 50.0 * 1.05 * fract(v * 0.3183099 + vec2(0.71, 0.113));
    //rand = -1.0 + 2 * 1.05 * fract(rand.x * rand.y * (rand.x + rand.y) * rand);
	
	// Your implementation ends here
	rand=vec2(dot(v,vec2(127.1,311.7)),
			  dot(v,vec2(269.5,183.1)));
	rand=-1.f+2.f*fract(sin(rand)*43758.5453123);

	return rand;
}

vec2 Hash22(vec2 p)
{
	vec3 hashscale3=vec3(.1031, .1030, .0973);
	vec3 p3 = fract(vec3(p.xyx) * hashscale3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}

///////////// Part 1b /////////////////////
/*  Using i, f, and m, compute the perlin noise at point v */
float perlin_noise(vec2 v, int scale) 
{
	float noise = 0;
	// Your implementation starts here
	//int scale=2;
	vec2 i=vec2(int(floor(v.x)/scale)*scale,int(floor(v.y)/scale)*scale);
	//vec2 f=vec2((fract(v.x)+mod(v.x,scale))/scale,(fract(v.y)+mod(v.y,scale))/scale);
	vec2 f=vec2(mod(v.x,scale)/scale,mod(v.y,scale)/scale);
	vec2 m=f*f*(3.f-2.f*f);

	
	float g0=dot(v-i,hash2(i))/scale;
	float g1=dot(v-(i+vec2(float(scale),0.f)),hash2(i+vec2(float(scale),0.f)))/scale;
	float g2=dot(v-(i+vec2(0.f,float(scale))),hash2(i+vec2(0.f,float(scale))))/scale;
	float g3=dot(v-(i+vec2(float(scale),float(scale))),hash2(i+vec2(float(scale),float(scale))))/scale;

	noise=mix(mix(g0,g1,m.x),mix(g2,g3,m.x),m.y);
	// Your implementation ends here
	return noise;
}

vec2 Noise2(vec2 x)
{
	vec2 add = vec2(1.0, 0.0);
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y * 57.0;
    vec2 res = mix(mix( Hash22(p),          Hash22(p + add.xy),f.x),
                  mix( Hash22(p + add.yx), Hash22(p + add.xx),f.x),f.y);
    return res;
}

float Hash12(vec2 p)
{
	float hashscale1=.1031;
	vec3 p3  = fract(vec3(p.xyx) * hashscale1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float Noise( in vec2 x )
{
	vec2 add = vec2(1.0, 0.0);
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    float res = mix(mix( Hash12(p),          Hash12(p + add.xy),f.x),
                    mix( Hash12(p + add.yx), Hash12(p + add.xx),f.x),f.y);
    return res;
}

///////////// Part 1c /////////////////////
/*  Given a point v and an int num, compute the perlin noise octave for point v with octave num
	num will be greater than 0 */
float noiseOctave(vec2 v, int num, int scale)
{
	float sum = 0;
	// Your implementation starts here
	for(int i=0;i<num;i++){
		sum+=pow(2.,-i)*perlin_noise(pow(2.,i)*v,scale);
	}
	// Your implementation ends here
	return sum;
}

float height(vec2 v){
    float h = 0;
	// Your implementation starts here
	//h=pow((v.x-12.5)/5,2);
	//h=min(pow((v.x-12.5)/5,2),5*pow((v.x-12.5)/5,2)-0.1);
	//h=pow((v.x-12.5+1-pow((v.y-12.5),2)/(12.5*12.5))/5,2);
	//h=pow((v.x-12.5+sin(v.y))/5,2);

	//h=pow((v.x-12.5+sin(v.y))/5,2);

	h=pow((v.x-12.5+2*sin(pow(0.1*v.y,1.8)))/5,2);
	//h=pow((v.x-12.5+2*sin(v.y))/5,2);
	
	//h+=min(h,1)*sin((25-max(min(v.x,20),5))/20*v.y)/2;
	//h+=min(h,1)*sin(v.y/20)/2;
	//h+=min(h,1)*sin(log(1+v.y)/3)/2;


	//h+=2*sin(v.y);
	if(h>0.5){
		h+=noiseOctave(v,1,2);
		h+=0.1*noiseOctave(v,3,1);
	}
	else{
		h+=pow(h/0.5,3)*noiseOctave(v,1,2);
	}

	//if(h>0.2){
		h+=0.1*noiseOctave(v,3,1);
	//}

	// Your implementation ends here
	return h;
}

///////////// Part 2b /////////////////////
/* compute the normal vector at v by find the points d to the left/right and d forward/backward 
    and using a cross product. Be sure to normalize the result */
vec3 compute_normal(vec2 v, float d)
{	
	vec3 normal_vector = vec3(0,0,0);
	// Your implementation starts here
	vec3 v1 = vec3(v.x + d, v.y, height(vec2(v.x + d, v.y)));
	vec3 v2 = vec3(v.x - d, v.y, height(vec2(v.x - d, v.y)));
	vec3 v3 = vec3(v.x, v.y + d, height(vec2(v.x, v.y + d)));
	vec3 v4 = vec3(v.x, v.y - d, height(vec2(v.x, v.y - d)));

	normal_vector=normalize(cross((v2-v1),(v4-v3)));

	// Your implementation ends here
	return normal_vector;
}

///////////// Part 2c /////////////////////
/* complete the get_color function by setting emissiveColor using some function of height/normal vector/noise */
/* put your Phong/Lambertian lighting model here to synthesize the lighting effect onto the terrain*/
vec3 get_color(vec2 v)
{
	float time = (iTime)*.03;
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1,1,1);

	// Your implementation starts here
	

	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	const vec3 LightPosition = vec3(10, 30, 30);
	const vec3 LightIntensity = vec3(2000);
	const vec3 ka = 0.1*vec3(.28,.28,.89);
	const vec3 kd = 0.5*vec3(.71,.8,.86);
	const vec3 ks = vec3(248/255.f,233/255.f,213.f/255.f);
	const float n = 400.0;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));
	//vec3 dir=normalize(vtx_pos-position);


	if(height(v)<0.05){
		emissiveColor=vec3(0.83,0.95,0.98);

		////water plus
		vec3 wat=vec3(vtx_pos.xyz);
		float tx = cos(wat.x*.052) *4.5;
		float ty = sin(wat.y*.072) *4.5;
		vec2 co = Noise2(vec2(wat.x*4.7+1.3+ty, wat.y*4.69+time*35.0-tx));
		co += Noise2(vec2(wat.y*8.6+time*13.0-tx, wat.x*8.712+ty))*.4;
		//vec3 nor = normalize(vec3(co.x, 20.0, co.y));
		//nor = normalize(reflect(dir, nor));
		//tx = wat.z-height(v);
		//emissiveColor=0.5 + 0.5 * (noiseOctave(vtx_pos.xy, 6,1))  * vec3(1,0,0);
		//emissiveColor=mix(vec3(0.,0.3,0.5),vec3(0,0.41,0.58),noiseOctave(vtx_pos.xy, 6,1));
		emissiveColor=mix(vec3(0.83,0.95,0.98),vec3(0,0.41,0.58),co.x);

	}
	else if(height(v)>=0.05&&height(v)<0.2){
		emissiveColor=vec3(0.76,0.7,0.5);
	}
	else{
		emissiveColor=vec3(0,0.45,0.25);
	}

	// Your implementation ends here


    return emissiveColor*lightingColor;


}

void main()
{
	frag_color = vec4(get_color(vtx_pos.xy),1.f);
}